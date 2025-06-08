import CircularProgress from '@/components/CircularProgress';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import * as NavigationBar from 'expo-navigation-bar';
import React, { useEffect } from 'react';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  useEffect(() => {
    if (Platform.OS === 'android') {
      NavigationBar.setBackgroundColorAsync('#228B22');
      NavigationBar.setButtonStyleAsync('light');
    }
  }, []);

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#228B22', dark: '#008000' }}
      headerHeight={300}
      headerImage={
        <>
          <Image
            source={require('@/images/ingredients-header.jpg')}
            style={styles.headerImage}
            contentFit="cover"
          />
          <LinearGradient
            colors={['rgba(0,0,0,0.3)', 'transparent']}
            style={styles.headerOverlay}
          />
        </>
      }
    >
      <Text style={styles.header}>Today's Macros</Text>
      <ScrollView contentContainerStyle={styles.graphsContainer}>
        <View style={styles.row}>
        <CircularProgress label="Calories" value={1800} maxValue={2500} color="#32CD32" size={120}/>
        <CircularProgress label="Protein" value={90} maxValue={150} color="#1E90FF" size={120}/>
        </View>
        <View style={styles.row}>
        <CircularProgress label="Carbs" value={180} maxValue={300} color="#FF8C00"size={60} />
        <CircularProgress label="Fats" value={60} maxValue={100} color="#FF6347" size={60}/>
        </View>
        
      </ScrollView>
      <Text style={styles.header}>Today's Recipes</Text>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
  },
  graphsContainer: { 
    
    position: 'relative',
    alignItems: 'center',
    paddingBottom: 0,
  },
   row: {
    flexDirection: 'row',      
    justifyContent: 'center', 
    alignItems: 'center',  
    gap: 20,              
    marginVertical: 10,       
  },
});
