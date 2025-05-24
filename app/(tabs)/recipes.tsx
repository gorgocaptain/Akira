import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';

export default function SavedRecipesScreen() {
  const [recipes, setRecipes] = useState<any[]>([]);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const raw = await AsyncStorage.getItem('savedRecipes');
        const parsed = raw ? JSON.parse(raw) : [];
        console.log("Loaded recipes:", parsed);
        setRecipes(parsed);
      } catch (e) {
        console.error("Failed to load recipes:", e);
      }
    };

    fetchRecipes();
  }, []);

  const toggleExpand = (index: number) => {
    setExpandedIndex(prev => (prev === index ? null : index));
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Saved Recipes</Text>
      {recipes.length === 0 ? (
        <Text style={styles.emptyText}>No saved recipes found.</Text>
      ) : (
        recipes.map((r, index) => (
          <TouchableOpacity
            key={r.id || index}
            onPress={() => toggleExpand(index)}
            style={styles.recipeBox}
          > 
            <Text style={styles.recipeTitle}>Recipe #{index + 1}</Text>
            {expandedIndex === index && (
              <Text style={styles.recipeText}>{r.text}</Text>
            )}
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#000', flex: 1 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#fff', marginBottom: 16 },
  emptyText: { color: '#888', fontSize: 16 },
  recipeBox: {
    backgroundColor: '#2C2D2D',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16
  },
  recipeTitle: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  recipeText: { color: '#FFF', fontSize: 14, marginTop: 8 }
});
