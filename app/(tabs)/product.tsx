import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator, Alert, Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';


const OPENAI_API_KEY = '';

interface Product {
  name: string;
  brands: string;
  ingredients: string;
  image: string;
  quantity: number;
  maxQuantity: number;
}

export default function ProductList() {
  const router = useRouter();
  const [savedProducts, setSavedProducts] = useState<Product[] | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const fetchMaxQuantities = async (products: Product[]) => {
    return products.map((product) => ({
      ...product,
      maxQuantity: product.quantity,
    }));
  };

  const generateRecipes = async () => {
  if (!savedProducts || savedProducts.length === 0) {
    Alert.alert("No Products available to generate recipe!");
    return;
  }

const formattedIngredients = savedProducts.map(p => `${p.name} (${p.quantity})`).join(', ');

  const prompt = `I have the following ingredients: ${formattedIngredients}. Generate one simple recipe I can cook using these items. Each recipe should include: - A name - A short description - The ingredients used from the list - Simple steps to make it, return this as a json file, it should have name, description, steps, and macro nutrients (calories, carbs, protein, and fats all of which should be a quantity in grams except for calories)`;

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 700,
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const recipeText = response.data.choices[0].message.content;

    // Save to AsyncStorage
    const existing = await AsyncStorage.getItem('savedRecipes');
    const existingRecipes = existing ? JSON.parse(existing) : [];

    const newRecipe = {
      id: Date.now(),
      text: recipeText,
      usedProducts: savedProducts,
    };

    const updatedRecipes = [...existingRecipes, newRecipe];
    await AsyncStorage.setItem('savedRecipes', JSON.stringify(updatedRecipes));

    Alert.alert('Recipe Generated', recipeText);
  } catch (error) {
    console.error(error);
    Alert.alert('Error', 'Failed to generate recipes.');
  }
};

  
  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      (async () => {
        const raw = await AsyncStorage.getItem('savedProducts');
        if (!isActive) return;

        const parsed = raw ? JSON.parse(raw) : [];
        const withQuantities = parsed.map((p: Product) => ({
          ...p,
          quantity: p.quantity || 1,
          maxQuantity: p.maxQuantity || 5,
        }));
        const updated = await fetchMaxQuantities(withQuantities);
        setSavedProducts(updated);
      })();
      return () => {
        isActive = false;
      };
    }, [])
  );

  const confirmDelete = async () => {
    if (!deletingProduct || !savedProducts) return;
    const newList = savedProducts.filter(
      (p) => p.name !== deletingProduct.name
    );
    setSavedProducts(newList);
    await AsyncStorage.setItem('savedProducts', JSON.stringify(newList));
    setDeletingProduct(null);
  };

  if (savedProducts === null) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00C853" />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
   

      <ScrollView contentContainerStyle={styles.container}>
   <View style={styles.cool}>
  <Text style={styles.header}>My Saved Products</Text>
  <TouchableOpacity 
    style={styles.recipeBtn}
    onPress={() => router.push('/recipes')}
  >
    <Text style={styles.recipeBtnText}>.</Text>
  </TouchableOpacity>
</View>

        <TouchableOpacity style={styles.genBtn} onPress={generateRecipes}>
          <Text style={styles.genBtnText}>Generate Recipes</Text>
         
        </TouchableOpacity>
        <LinearGradient
          colors={['#000', '#fff']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={{
            width: '100%',
            height: 4,
            marginBottom: 15,
          }}
        />
        {savedProducts.length === 0 ? (
          <Text style={styles.emptyText}>No products added yet.</Text>
        ) : (
          savedProducts.map((prod, idx) => (
            <TouchableOpacity
              key={idx}
              onPress={() => setSelectedProduct(prod)}
              activeOpacity={0.8}
            >
              <View style={styles.card}>
                {prod.image ? (
                  <Image source={{ uri: prod.image }} style={styles.cardImage} />
                ) : (
                  <View style={[styles.cardImage, styles.imagePlaceholder]}>
                    <Text style={styles.placeholderText}>No Image</Text>
                  </View>
                )}

                <View style={styles.cardRight}>
                  <Text style={styles.cardTitle} numberOfLines={2}>
                    {prod.name}
                  </Text>

                  <View style={styles.cardFooter}>
                    <Text style={styles.qtyLabel}>Quantity:</Text>

                    <TextInput
                      style={styles.qtyInput}
                      keyboardType="numeric"
                      value={prod.quantity === 0 ? '' : prod.quantity.toString()}
                      onChangeText={(txt) => {
                        const updatedProducts = savedProducts.map((p, i) => {
                          if (i === idx) {
                            return {
                              ...p,
                              quantity: txt === '' ? 0 : parseInt(txt, 10) || 0,
                            };
                          }
                          return p;
                        });
                        setSavedProducts(updatedProducts);
                      }}
                      onEndEditing={async () => {
                        const cleaned = savedProducts.map((p) => ({
                          ...p,
                          quantity: Math.max(1, p.quantity || 1),
                        }));
                        setSavedProducts(cleaned);
                        await AsyncStorage.setItem('savedProducts', JSON.stringify(cleaned));
                      }}
                    />

                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => setDeletingProduct(prod)}>
                      <Text style={styles.deleteText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {deletingProduct && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Remove Product?</Text>
            <Text style={styles.modalBody}>
              Delete “{deletingProduct.name}”?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setDeletingProduct(null)}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={confirmDelete}
              >
                <Text style={styles.confirmText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {selectedProduct && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{selectedProduct.name}</Text>
            {selectedProduct.image ? (
              <Image source={{ uri: selectedProduct.image }} style={styles.detailImage} />
            ) : (
              <View style={[styles.cardImage, styles.imagePlaceholder]}>
                <Text style={styles.placeholderText}>No Image</Text>
              </View>
            )}
            <ScrollView style={{ maxHeight: 250, marginVertical: 10 }}>
              <Text style={styles.detailText}>
                <Text style={styles.detailLabel}>Brands: </Text>{selectedProduct.brands}
              </Text>
              <Text style={styles.detailText}>
                <Text style={styles.detailLabel}>Ingredients: </Text>{selectedProduct.ingredients}
              </Text>
              <Text style={styles.detailText}>
                <Text style={styles.detailLabel}>Quantity: </Text>{selectedProduct.quantity}
              </Text>
              <Text style={styles.detailText}>
                <Text style={styles.detailLabel}>Max Quantity: </Text>{selectedProduct.maxQuantity}
              </Text>
            </ScrollView>

            <TouchableOpacity
              style={[styles.modalButton, styles.confirmButton]}
              onPress={() => setSelectedProduct(null)}
            >
              <Text style={styles.confirmText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const ACCENT = '#000';
const BG = '#FFF';
const CARD_BG = '#fefefe';
const TEXT_PRIMARY = '#000';
const TEXT_SECONDARY = '#555';
const PLACEHOLDER_BG = '#222';

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: BG },
  cool: {position: 'relative', marginBottom: 20},   
  
  loadingContainer: {
    flex: 1,
    backgroundColor: BG,
    justifyContent: 'center',
    alignItems: 'center'
  },
  container: { padding: 16, paddingBottom: 40 },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: ACCENT,
    marginTop: 80,
    textAlign: 'left'
  },
  emptyText: {
    color: TEXT_SECONDARY,
    fontSize: 16,
    textAlign: 'center',
    marginTop: 40
  },
  card: {
    backgroundColor: CARD_BG,
    borderRadius: 10,
    marginBottom: 16,
    overflow: 'hidden',
    flexDirection: 'row',
    height: 100,
    shadowColor: ACCENT,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3
  },
  cardImage: {
    width: 100,
    height: '100%',
    resizeMode: 'cover',
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    backgroundColor: BG
  },
  imagePlaceholder: {
    width: 100,
    height: '100%',
    backgroundColor: PLACEHOLDER_BG,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10
  },
  placeholderText: { color: TEXT_SECONDARY, fontSize: 14 },
  cardRight: { flex: 1, justifyContent: 'space-between', padding: 12 },
  cardTitle: {
    color: TEXT_PRIMARY,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingBottom: 8
  },
  qtyLabel: { color: TEXT_PRIMARY, fontSize: 16, marginRight: 8, marginLeft: -10 },
  qtyInput: {
    width: 60,
    height: 36,
    borderWidth: 1,
    borderColor: TEXT_SECONDARY,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 0,
    textAlignVertical: 'center',
    color: TEXT_PRIMARY,
    fontSize: 14,
    marginRight: 70
  },
  deleteButton: { padding: 8, borderRadius: 6 },
  deleteText: { fontSize: 18, color: TEXT_SECONDARY },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    padding: 24
  },
  modalContent: {
    backgroundColor: CARD_BG,
    borderRadius: 12,
    padding: 20
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: ACCENT,
    marginBottom: 8
  },
  modalBody: { fontSize: 16, color: TEXT_PRIMARY, marginBottom: 20 },
  modalButtons: { flexDirection: 'row', justifyContent: 'flex-end' },
  modalButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginLeft: 10
  },
  cancelButton: { backgroundColor: '#333' },
  cancelText: { color: TEXT_SECONDARY, fontSize: 14 },
  confirmButton: { backgroundColor: ACCENT },
  confirmText: { color: BG, fontSize: 14, fontWeight: '700', marginLeft: 105 },
  detailImage: {
    width: '100%',
    height: 350,
    resizeMode: 'contain',
    borderRadius: 10,
    backgroundColor: BG,
    marginBottom: 12
  },
  detailText: {
    color: TEXT_PRIMARY,
    marginBottom: 8,
    fontSize: 14,
    lineHeight: 20
  },
  detailLabel: { fontWeight: '700', color: TEXT_PRIMARY },
  genBtn: {
    backgroundColor: ACCENT,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    
    marginVertical: 16,
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
    elevation: 4
  },
  genBtnText: {
    color: BG,
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center'
  },
recipeBtn: {
  position: 'absolute',
  top: 16,
  right: 16,
  backgroundColor: BG,
  padding: 10,
  borderRadius: 25,
  shadowColor: '#FFF',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.3,
  shadowRadius: 4,
  elevation: 4,
  zIndex: 999,
},
recipeBtnText: {
  fontSize: 40,
  color: '#000',
  fontWeight: 'bold',
},

});