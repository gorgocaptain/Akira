import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

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
        <Text style={styles.header}>My Saved Products</Text>

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
                      keyboardType="number-pad"
                      value={String(prod.quantity)}
                      onChangeText={(txt: string) => {
                        const num = parseInt(txt, 10) || 1;
                        const updated = savedProducts.map((p, i) =>
                          i === idx ? { ...p, quantity: num } : p
                        );
                        setSavedProducts(updated);
                        AsyncStorage.setItem('savedProducts', JSON.stringify(updated));
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

      {/* Product Details Modal */}
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

const ACCENT = '#FFF';
const BG = '#000';
const CARD_BG = '#2C2D2D';
const TEXT_PRIMARY = '#FFF';
const TEXT_SECONDARY = '#555';
const PLACEHOLDER_BG = '#222';

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: BG
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: BG,
    justifyContent: 'center',
    alignItems: 'center'
  },
  container: {
    padding: 16,
    paddingBottom: 40
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: ACCENT,
    marginBottom: 16,
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
    borderBottomLeftRadius: 10
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
  placeholderText: {
    color: TEXT_SECONDARY,
    fontSize: 14
  },
  cardRight: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 12
  },
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
    paddingBottom: 8,
  },
  qtyLabel: {
    color: TEXT_PRIMARY,
    fontSize: 16,
    marginRight: 8,
    marginLeft: -10,
  },
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

    marginRight: 70,
  },
  deleteButton: {
    padding: 8,
    borderRadius: 6
  },
  deleteText: {
    fontSize: 18,
    color: TEXT_SECONDARY
  },
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
  modalBody: {
    fontSize: 16,
    color: TEXT_PRIMARY,
    marginBottom: 20
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end'
  },
  modalButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginLeft: 10
  },
  cancelButton: {
    backgroundColor: '#333'
  },
  cancelText: {
    color: TEXT_SECONDARY,
    fontSize: 14
  },
  confirmButton: {
    backgroundColor: ACCENT
  },
  confirmText: {
    color: BG,
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 105,
  },
  detailImage: {
    width: '100%',
    height: 150,
    resizeMode: 'contain',
    borderRadius: 10,
    backgroundColor: PLACEHOLDER_BG,
    marginBottom: 12
  },
  detailText: {
    color: TEXT_PRIMARY,
    marginBottom: 8,
    fontSize: 14,
    lineHeight: 20
  },
  detailLabel: {
    fontWeight: '700',
    color: TEXT_PRIMARY
  }
});