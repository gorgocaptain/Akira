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
                    <Text style={styles.qtyDisplay}>Quantity: {prod.quantity}</Text>

                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => setDeletingProduct(prod)}
                    >
                      <Text style={styles.deleteText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Delete Confirmation Modal */}
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

const styles = StyleSheet.create({
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
    flexDirection: 'row',
    height: 100,
  },
  cardImage: {
    width: 100,
    height: 100,
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
  cardRight: {
    flex: 1,
    justifyContent: 'space-between',
    paddingRight: 12,
  },
  cardTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    paddingHorizontal: 12,
    paddingTop: 10,
    lineHeight: 22,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  qtyDisplay: {
    color: '#ccc',
    fontSize: 16,
  },
  deleteButton: {
    paddingLeft: 16,
  },
  deleteText: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.6)',
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
  },
  detailImage: {
    width: '100%',
    height: 150,
    resizeMode: 'contain',
    borderRadius: 10,
    backgroundColor: '#222',
  },
  detailText: {
    color: '#ddd',
    marginBottom: 8,
    fontSize: 14,
  },
  detailLabel: {
    fontWeight: '700',
    color: '#00C853',
  },
});
