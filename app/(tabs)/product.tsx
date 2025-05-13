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
  );
}

const styles = StyleSheet.create({
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
  },
});
