<<<<<<< HEAD
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function Product() {
  const { name, brands, ingredients, image } = useLocalSearchParams();
  const router = useRouter();

  // Set up local state for the product
  const [product, setProduct] = useState({
    name: name || '',
    brands: brands || '',
    ingredients: ingredients || '',
    image: image || '',
  });

  // Reset product data on component unmount (when the user navigates away)
  useEffect(() => {
    // This will reset the product state whenever the component is unmounted
    return () => {
      setProduct({
        name: '',
        brands: '',
        ingredients: '',
        image: '',
      });
    };
  }, []); // Empty dependency array to run only on mount/unmount

  // Optional: Clear the product data if you navigate away or scan a new product
  useEffect(() => {
    setProduct({
      name: name || '',
      brands: brands || '',
      ingredients: ingredients || '',
      image: image || '',
    });
  }, [name, brands, ingredients, image]);

  return (
    <ScrollView contentContainerStyle={styles.container} style={{ backgroundColor: '#000' }}>
      <Text style={styles.title}>{product.name || 'No product name found'}</Text>
      {product.image ? (
        <Image source={{ uri: product.image.toString() }} style={styles.image} />
      ) : (
        <Text style={styles.text}>No image available</Text>
      )}
      <View style={styles.infoBlock}>
        <Text style={styles.label}>Brands:</Text>
        <Text style={styles.text}>{product.brands || 'Not available'}</Text>
      </View>
      <View style={styles.infoBlock}>
        <Text style={styles.label}>Ingredients:</Text>
        <Text style={styles.text}>{product.ingredients || 'Not available'}</Text>
      </View>
    </ScrollView>
=======
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
  TouchableOpacity,
  View
} from 'react-native';

interface Product {
  name: string;
  brands: string;
  ingredients: string;
  image: string;
}

export default function ProductList() {
  const router = useRouter();
  const [savedProducts, setSavedProducts] = useState<Product[] | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

  // Reload on focus
  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      (async () => {
        const raw = await AsyncStorage.getItem('savedProducts');
        if (!isActive) return;
        setSavedProducts(raw ? JSON.parse(raw) : []);
      })();
      return () => {
        isActive = false;
      };
    }, [])
  );

  // Confirm deletion
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
            <View key={idx} style={styles.card}>
              {prod.image ? (
                <Image source={{ uri: prod.image }} style={styles.cardImage} />
              ) : (
                <View style={[styles.cardImage, styles.imagePlaceholder]}>
                  <Text style={styles.placeholderText}>No Image</Text>
                </View>
              )}

              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {prod.brands.split(',')[0] || 'Unknown'}
                </Text>
              </View>

              <Text style={styles.cardTitle} numberOfLines={2}>
                {prod.name}
              </Text>

              <View style={styles.cardFooter}>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => setDeletingProduct(prod)}
                >
                  <Text style={styles.deleteText}>✕</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.viewButton}
                  onPress={() =>
                    router.push({
                      pathname: '/product',
                      params: prod as unknown as Record<string, string>,
                    })
                  }
                >
                  <Text style={styles.viewIcon}>{'>'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Confirmation Modal */}
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
    </View>
>>>>>>> 02f8f5e (Hi)
  );
}

const styles = StyleSheet.create({
<<<<<<< HEAD
  container: {
    padding: 16,
    paddingBottom: 40,
    flexGrow: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
    textAlign: 'center',
  },
  image: {
    width: '100%',
    height: 200,
    marginBottom: 20,
    borderRadius: 8,
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFA500',
    marginBottom: 4,
  },
  text: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 20,
  },
  infoBlock: {
    marginBottom: 16,
=======
  screen: { flex: 1, backgroundColor: '#000' },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
  },
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00C853',
    marginBottom: 16,
    textAlign: 'left',
  },
  emptyText: {
    color: '#555',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 40,
  },
  card: {
    backgroundColor: '#111',
    borderRadius: 10,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#00C853',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  cardImage: {
    width: '100%',
    height: 140,
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    backgroundColor: '#222',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#666',
    fontSize: 14,
  },
  badge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#00C853',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#000',
    fontSize: 12,
    fontWeight: '600',
  },
  cardTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    paddingHorizontal: 12,
    paddingVertical: 10,
    lineHeight: 22,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  deleteButton: {
    padding: 4,
  },
  deleteText: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.6)',
  },
  viewButton: {
    backgroundColor: 'rgba(0,200,83,0.15)',
    borderRadius: 12,
    padding: 6,
  },
  viewIcon: {
    fontSize: 16,
    color: '#00C853',
    fontWeight: '700',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#111',
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#00C853',
    marginBottom: 8,
  },
  modalBody: {
    fontSize: 16,
    color: '#ddd',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  modalButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginLeft: 10,
  },
  cancelButton: {
    backgroundColor: '#333',
  },
  confirmButton: {
    backgroundColor: '#00C853',
  },
  cancelText: {
    color: '#aaa',
    fontSize: 14,
  },
  confirmText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '700',
>>>>>>> 02f8f5e (Hi)
  },
});
