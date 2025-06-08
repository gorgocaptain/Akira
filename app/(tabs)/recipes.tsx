import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = 300;
const SPACING = 20;

export default function SavedRecipesScreen() {
  const [recipes, setRecipes] = useState<any[]>([]);
    const [trecipes, setTRecipes] = useState<any[]>([]);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<any | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const scrollX = useRef(new Animated.Value(0)).current;
  const [dailyRecipes, setDailyRecipes] = useState<any[]>([]);
const [totalMacros, setTotalMacros] = useState<{ calories: number; protein: number; carbs: number; fat: number }>({
  calories: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
});

 const saveAsTodayRecipe = async (recipe: any) => {
  const today = new Date().toISOString().split('T')[0];
  const storageKey = 'todayRecipes';

  try {
    const raw = await AsyncStorage.getItem(storageKey);
    const existing = raw ? JSON.parse(raw) : [];

    const alreadyExists = existing.some(r => r.id === recipe.id);
    if (!alreadyExists) {
      const updated = [...existing, { ...recipe, savedAt: today }];
      await AsyncStorage.setItem(storageKey, JSON.stringify(updated));
      setTRecipes(updated);

      // Store and update UI
      await storeCombinedMacrosForToday();

      // Load updated macros and update UI state
      const updatedMacros = await getCombinedMacrosForToday();
      setTotalMacros(updatedMacros);
    }
  } catch (e) {
    console.error('Failed to save today’s recipe:', e);
  }
};

const getCombinedMacrosForToday = async () => {
  const today = new Date().toISOString().split("T")[0];
  try {
    const raw = await AsyncStorage.getItem(`macros_total_${today}`);
    return raw ? JSON.parse(raw) : { calories: 0, protein: 0, carbs: 0, fat: 0 };
  } catch (e) {
    console.error("Failed to load combined macros:", e);
    return { calories: 0, protein: 0, carbs: 0, fat: 0 };
  }
};

  const storeCombinedMacrosForToday = async () => {
  const today = new Date().toISOString().split("T")[0];
  const key = "todayRecipes";

  try {
    const raw = await AsyncStorage.getItem(key);
    const todayRecipes: any[] = raw ? JSON.parse(raw) : [];

    type MacroTotals = {
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
    };

    const totalMacros = todayRecipes.reduce<MacroTotals>(
      (acc, recipe) => {
        acc.calories += recipe.macros?.calories || 0;
        acc.protein += recipe.macros?.protein || 0;
        acc.carbs += recipe.macros?.carbs || 0;
        acc.fat += recipe.macros?.fat || 0;
        return acc;
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );

    await AsyncStorage.setItem(`macros_total_${today}`, JSON.stringify(totalMacros));
    console.log("Stored total macros:", totalMacros);
  } catch (e) {
    console.error("Failed to compute/store total macros:", e);
  }
};

  useFocusEffect(
  useCallback(() => {
    const fetchRecipes = async () => {
      try {
        const rawSaved = await AsyncStorage.getItem('savedRecipes');
        const parsedSaved = rawSaved ? JSON.parse(rawSaved) : [];
        parsedSaved.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        setRecipes(parsedSaved);

        const rawToday = await AsyncStorage.getItem('todayRecipes');
        const parsedToday = rawToday ? JSON.parse(rawToday) : [];
        const today = new Date().toISOString().split('T')[0];
        const filteredToday = parsedToday.filter(r => r.savedAt === today);
        filteredToday.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        setTRecipes(filteredToday);
      } catch (e) {
        console.error('Failed to load recipes:', e);
      }

      await getCombinedMacrosForToday();
    };

    fetchRecipes();
  }, [])
);
  const storeMacros = async (macros: any) => {
    if(!macros) return;

    const today = new Date().toISOString().split('T')[0];
    const storageKey = `macros_${today}`;

    try{
      const existing = await AsyncStorage.getItem(storageKey);
      const existingMacros = existing ? JSON.parse(existing) : [];

      const updatedMacros = [...existingMacros, macros];
      await AsyncStorage.setItem(storageKey, JSON.stringify(updatedMacros));

    }
    catch (e) {

    }
  };
  const getTodayRecipes = async () => {
  const today = new Date().toISOString().split("T")[0];
  const key = "todayRecipes";
  try {
    const raw = await AsyncStorage.getItem(key);
    const todayRecipes = raw ? JSON.parse(raw) : [];
    return todayRecipes.filter(r => r.savedAt === today);
  } catch (e) {
    console.error("Couldn't load today's recipes", e);
    return [];
  }
};

  const deleteRecipe = async (index: number) => {
    const updatedRecipes = [...recipes];
    updatedRecipes.splice(index, 1);
    setRecipes(updatedRecipes);
     setTRecipes(updatedRecipes);
    try {
      await AsyncStorage.setItem('savedRecipes', JSON.stringify(updatedRecipes));
    } catch (e) {
      console.error('Failed to delete recipe:', e);
    }
  };

  // Update a recipe's rating in state and AsyncStorage
  const updateRecipeRating = async (recipeIndex: number, rating: number) => {
    const updatedRecipes = [...recipes];
    updatedRecipes[recipeIndex].rating = rating;
    // Resort after rating update
    updatedRecipes.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    setRecipes(updatedRecipes);
    try {
      await AsyncStorage.setItem('savedRecipes', JSON.stringify(updatedRecipes));
    } catch (e) {
      console.error('Failed to update rating:', e);
    }
  };

  // Find the index of the selected recipe in the recipes array for rating update
  const selectedRecipeIndex = selectedRecipe ? recipes.findIndex(r => r.id === selectedRecipe.id) : -1;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>My Recipes</Text>

      {recipes.length === 0 ? (
        <Text style={styles.emptyText}>No saved recipes found.</Text>
      ) : (
        <Animated.FlatList
          data={recipes}
          keyExtractor={(item, index) => item.id || index.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.carouselContent}
          snapToInterval={ITEM_WIDTH + SPACING}
          decelerationRate="fast"
          bounces={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: true }
          )}
          renderItem={({ item, index }) => {
            let parsedRecipe;
            try {
              parsedRecipe = typeof item.text === 'string' ? JSON.parse(item.text) : item.text;
            } catch (e) {
              console.error('Error parsing recipe JSON:', e);
              parsedRecipe = { name: 'Invalid Recipe', description: '' };
            }

            const inputRange = [
              (index - 1) * (ITEM_WIDTH + SPACING),
              index * (ITEM_WIDTH + SPACING),
              (index + 1) * (ITEM_WIDTH + SPACING),
            ];

            const translateY = scrollX.interpolate({
              inputRange,
              outputRange: [30, 0, 30],
              extrapolate: 'clamp',
            });

            const scale = scrollX.interpolate({
              inputRange,
              outputRange: [0.9, 1, 0.9],
              extrapolate: 'clamp',
            });

            // Display stars for rating
            const rating = item.rating || 0;
            const stars = [];
            for (let i = 1; i <= 5; i++) {
              stars.push(
                <Text key={i} style={[styles.star, i <= rating ? styles.filledStar : styles.emptyStar]}>
                  ★
                </Text>
              );
            }

            return (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  setSelectedRecipe(item);
                  setModalVisible(true);
                }}
              >
                <Animated.View
                  style={[
                    styles.recipeBox,
                    {
                      transform: [{ translateY }, { scale }],
                    },
                  ]}
                >
                  <Text style={styles.recipeTitle}>{parsedRecipe.name || 'Untitled Recipe'}</Text>
                  <View style={styles.ratingRow}>{stars}</View>
                  <Text style={styles.recipeText} numberOfLines={3}>
                    {parsedRecipe.description || JSON.stringify(parsedRecipe, null, 2)}
                  </Text>
                  <TouchableOpacity
                    onPress={() => deleteRecipe(index)}
                    style={styles.deleteButton}
                  >
                    <Text style={styles.deleteButtonText}>Delete</Text>
                  </TouchableOpacity>
                </Animated.View>
              </TouchableOpacity>
            );
          }}
        />
      )}
      

      <Text style={styles.header}>Today's Recipes</Text>
      <View style={styles.macroContainer}>
  <Text style={styles.macroHeader}>Today's Macros</Text>
  <Text style={styles.macroText}>Calories: {totalMacros.calories}</Text>
  <Text style={styles.macroText}>Protein: {totalMacros.protein}g</Text>
  <Text style={styles.macroText}>Carbs: {totalMacros.carbs}g</Text>
  <Text style={styles.macroText}>Fat: {totalMacros.fat}g</Text>
</View>
      {trecipes.length === 0 ? (
        <Text style={styles.emptyText}>No saved recipes found.</Text>
      ) : (
        <Animated.FlatList
          data={trecipes}
          keyExtractor={(item, index) => item.id || index.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.carouselContent}
          snapToInterval={ITEM_WIDTH + SPACING}
          decelerationRate="fast"
          bounces={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: true }
          )}
          renderItem={({ item, index }) => {
            let parsedRecipe;
            try {
              parsedRecipe = typeof item.text === 'string' ? JSON.parse(item.text) : item.text;
            } catch (e) {
              console.error('Error parsing recipe JSON:', e);
              parsedRecipe = { name: 'Invalid Recipe', description: '' };
            }

            const inputRange = [
              (index - 1) * (ITEM_WIDTH + SPACING),
              index * (ITEM_WIDTH + SPACING),
              (index + 1) * (ITEM_WIDTH + SPACING),
            ];

            const translateY = scrollX.interpolate({
              inputRange,
              outputRange: [30, 0, 30],
              extrapolate: 'clamp',
            });

            const scale = scrollX.interpolate({
              inputRange,
              outputRange: [0.9, 1, 0.9],
              extrapolate: 'clamp',
            });

           

            return (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  setSelectedRecipe(item);
                  setModalVisible(true);
                }}
              >
                <Animated.View
                  style={[
                    styles.recipeTBox,
                    {
                      transform: [{ translateY }, { scale }],
                    },
                  ]}
                >
                  <Text style={styles.recipeTitle}>{parsedRecipe.name || 'Untitled Recipe'}</Text>
                  
                  <Text style={styles.recipeText} numberOfLines={3}>
                    {parsedRecipe.description || JSON.stringify(parsedRecipe, null, 2)}
                  </Text>
                  
                </Animated.View>
              </TouchableOpacity>
            );
          }}
        />
      )}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView>
               <View style={styles.ratingRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    onPress={() => {
                      if (selectedRecipeIndex !== -1) {
                        updateRecipeRating(selectedRecipeIndex, star);
                        // Update selectedRecipe rating locally for modal display
                        setSelectedRecipe(prev => ({ ...prev, rating: star }));
                      }
                    }}
                  >
                    <Text style={[
                      styles.star,
                      (selectedRecipe?.rating || 0) >= star ? styles.filledStar : styles.emptyStar,
                    ]}>
                      ★
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.modalTitle}>
                {selectedRecipe?.text ? JSON.parse(selectedRecipe.text).name : selectedRecipe?.name || 'Untitled Recipe'}
              </Text>
             
              <Text style={styles.modalText}>
                {selectedRecipe?.text
                  ? JSON.parse(selectedRecipe.text).description
                  : selectedRecipe?.description || JSON.stringify(selectedRecipe, null, 2)}
              </Text>
              <Text></Text>
              <Text style={styles.modalText}>
                {selectedRecipe?.text
                  ? JSON.parse(selectedRecipe.text).steps
                  : selectedRecipe?.steps || JSON.stringify(selectedRecipe, null, 2)}
              </Text>
              <Text></Text>
              <Text style={styles.modalText}>
                Calories: {selectedRecipe?.text
                  ? JSON.parse(selectedRecipe.text).macro_nutrients.calories
                  : selectedRecipe?.macro_nutrients.calories || JSON.stringify(selectedRecipe, null, 2)}cal
              </Text>
               <Text style={styles.modalText}>
                Protein: {selectedRecipe?.text
                  ? JSON.parse(selectedRecipe.text).macro_nutrients.protein
                  : selectedRecipe?.macro_nutrients.protein || JSON.stringify(selectedRecipe, null, 2)}g
              </Text>
              <Text style={styles.modalText}>
                Carbs: {selectedRecipe?.text
                  ? JSON.parse(selectedRecipe.text).macro_nutrients.carbs
                  : selectedRecipe?.macro_nutrients.carbs || JSON.stringify(selectedRecipe, null, 2)}g
              </Text>
              <Text style={styles.modalText}>
                Fats: {selectedRecipe?.text
                  ? JSON.parse(selectedRecipe.text).macro_nutrients.fats
                  : selectedRecipe?.macro_nutrients.fats || JSON.stringify(selectedRecipe, null, 2)}g
              </Text>
              
            </ScrollView>
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={styles.doneButton}
            >
              <TouchableOpacity
  onPress={() => saveAsTodayRecipe(selectedRecipe)}
  style={styles.doneButton}
>
  <Text style={styles.closeButtonText}>I made this Recipe!</Text>
</TouchableOpacity>


            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 80,
    backgroundColor: '#fff',
    flex: 1,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginLeft: 16,
    marginBottom: 20,
  },
  emptyText: {
    color: '#000',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 40,
  },
  carouselContent: {
    paddingHorizontal: (width - ITEM_WIDTH) / 2,
  },
  recipeBox: {
    backgroundColor: '#fff',
    width: ITEM_WIDTH,
    height: 300,
    marginRight: SPACING,
    padding: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#ccc',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
    justifyContent: 'center',
  },
  recipeTBox: {
    backgroundColor: '#fff',
    width: ITEM_WIDTH,
    height: 200,
    marginRight: SPACING,
    padding: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#ccc',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
    justifyContent: 'center',
  },
  recipeTitle: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  recipeText: {
    color: '#000',
    fontSize: 16,
  },
  deleteButton: {
    marginTop: 12,
    paddingVertical: 8,
    backgroundColor: '#ff4d4d',
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 16,
    width: width * 0.8,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#000',
  },
  modalText: {
    fontSize: 16,
    color: '#000',
  },
  closeButton: {
    marginTop: 20,
    paddingVertical: 10,
    backgroundColor: '#ff0000',
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  doneButton: {
    backgroundColor: '#55aaaa',
    marginTop: 20,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  ratingRow: {
    flexDirection: 'row',
    marginVertical: 6,
  },
  star: {
    fontSize: 24,
    marginHorizontal: 4,
  },
  filledStar: {
    color: '#ffd700', // gold
  },
  emptyStar: {
    color: '#ccc', // gray
  },
  macroContainer: {
  padding: 16,
  backgroundColor: '#f0f0f0',
  borderRadius: 10,
  marginVertical: 10,
},
macroHeader: {
  fontSize: 18,
  fontWeight: 'bold',
  marginBottom: 8,
},
macroText: {
  fontSize: 16,
},

});
