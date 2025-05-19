import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import * as NavigationBar from 'expo-navigation-bar';
import React, { useEffect } from 'react';
import { Platform, StyleSheet } from 'react-native';

export default function HomeScreen() {
  useEffect(() => {
        if (Platform.OS === 'android') {
          // set your desired nav‑bar color:
          NavigationBar.setBackgroundColorAsync('#228B22');    // a green
          // optional: choose light or dark button icons
          NavigationBar.setButtonStyleAsync('light');         // or 'dark'
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
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title" style={styles.titleText}>
          Ingredient List
        </ThemedText>
      </ThemedView>


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
  titleContainer: {
    marginTop: 16,
    marginBottom: 24,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleText: {
    fontSize: 32,
    lineHeight: 40,
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  stepContainer: {
    backgroundColor: '#fff',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: 12,
    // cross‑platform shadow
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
});
