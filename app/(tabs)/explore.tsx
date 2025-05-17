<<<<<<< HEAD
import { CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Button, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
export default function App() {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  const router = useRouter();

  if (!permission) return <View />;
=======
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Button,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// Reusable modal for choices
function ChoiceModal({
  visible,
  title,
  options,
  onClose,
}: {
  visible: boolean;
  title: string;
  options: { label: string; style?: any; onPress: () => void }[];
  onClose: () => void;
}) {
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalBox}>
          <Text style={styles.modalTitle}>{title}</Text>
          {options.map((opt, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.modalBtn, opt.style]}
              onPress={() => {
                opt.onPress();
                onClose();
              }}
            >
              <Text style={styles.modalBtnText}>{opt.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </Modal>
  );
}

export default function App() {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [productChoices, setProductChoices] = useState<any>(null);
  const [ready, setReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (permission?.granted) setReady(true);
  }, [permission]);

  if (!permission)
    return (
      <View style={styles.container}>
        <ActivityIndicator color="#888" size="large" />
      </View>
    );
>>>>>>> 02f8f5e (Hi)

  if (!permission.granted) {
    return (
      <View style={styles.container}>
<<<<<<< HEAD
        <Text style={styles.message}>We need your permission to show the camera</Text>
=======
        <Text style={styles.message}>We need camera permission</Text>
>>>>>>> 02f8f5e (Hi)
        <Button onPress={requestPermission} title="Grant Permission" />
      </View>
    );
  }

<<<<<<< HEAD
  function toggleCameraFacing() {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  }

  const handleBarcodeScanned = ({ type, data }: any) => {
    if (scanned) return;
    setScanned(true);
   
    fetch(`https://us.openfoodfacts.org/api/v0/product/${data}.json`)
      .then(response => response.json())
      .then(data => {
        if (data.status === 1) {
          router.push({
            pathname: '/product',
            params: {
              name: data.product.product_name ?? '',
              brands: data.product.brands ?? '',
              ingredients: data.product.ingredients_text ?? '',
              image: data.product.image_url ?? '',
            },
          })
        } else {
          Alert.alert('Product not found');
          setScanned(false);
        }
      })
      .catch(error => {
        console.error('Fetch error:', error);
        Alert.alert('Error fetching product data');
      });
=======
  function toggleFacing() {
    setFacing((f) => (f === 'back' ? 'front' : 'back'));
  }

  const handleBarcodeScanned = async ({ data }: any) => {
    if (scannedData) return;
    setScannedData(data);

    const res = await fetch(`https://us.openfoodfacts.org/api/v0/product/${data}.json`);
    const json = await res.json();
    if (json.status !== 1) {
      // simple alert fallback
      return Alert.alert('Product not found');
    }

    const prod = {
      name: json.product.product_name || 'Unnamed',
      brands: json.product.brands || '',
      ingredients: json.product.ingredients_text || '',
      image: json.product.image_url || '',
    };

    setProductChoices(prod);
  };

  const addToList = async () => {
    const prod = productChoices!;
    const raw = await AsyncStorage.getItem('savedProducts');
    const list = raw ? JSON.parse(raw) : [];
    if (!list.some((p: any) => p.name === prod.name)) {
      list.push(prod);
      await AsyncStorage.setItem('savedProducts', JSON.stringify(list));
    }
    setScannedData(null);
    setProductChoices(null);
  };

  const viewDetails = () => {
    router.push({
      pathname: '/product',
      params: productChoices,
    });
    setScannedData(null);
    setProductChoices(null);
>>>>>>> 02f8f5e (Hi)
  };

  return (
    <View style={styles.container}>
<<<<<<< HEAD
      <CameraView
        style={styles.camera}
        facing={facing}
        onBarcodeScanned={handleBarcodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['upc_a'],
        }}
      >
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
            <Text style={styles.text}>Flip Camera</Text>
          </TouchableOpacity>
        </View>

   
      </CameraView>
=======
      {ready && (
        <CameraView
          key={facing}
          active
          style={styles.camera}
          facing={facing}
          onBarcodeScanned={handleBarcodeScanned}
          barcodeScannerSettings={{ barcodeTypes: ['upc_a'] }}
        >
          <TouchableOpacity style={styles.flipBtn} onPress={toggleFacing}>
            <Text style={styles.flipText}>↺ Flip</Text>
          </TouchableOpacity>
        </CameraView>
      )}

      {/* Product choice modal */}
      {productChoices && (
        <ChoiceModal
          visible={true}
          title={productChoices.name}
          options={[
            { label: 'Add to My List', style: styles.modalAdd, onPress: addToList },
            { label: 'View Details', style: styles.modalView, onPress: viewDetails },
            { label: 'Cancel', style: styles.modalCancel, onPress: () => setProductChoices(null) },
          ]}
          onClose={() => {
            setScannedData(null);
            setProductChoices(null);
          }}
        />
      )}
>>>>>>> 02f8f5e (Hi)
    </View>
  );
}

const styles = StyleSheet.create({
<<<<<<< HEAD
  container: {
    flex: 1,
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    margin: 64,
  },
  button: {
    flex: 1,
    alignSelf: 'flex-end',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  overlay: {
    position: 'absolute',
    bottom: 20,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 12,
    borderRadius: 8,
  },
  overlayText: {
    color: 'white',
    fontSize: 16,
    marginBottom: 4,
  },
=======
  container: { flex: 1, backgroundColor: '#000' },
  message: { color: '#ccc', textAlign: 'center', marginBottom: 12 },
  camera: { flex: 1 },
  flipBtn: {
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
    backgroundColor: '#222',
    padding: 12,
    borderRadius: 24,
  },
  flipText: { color: '#eee', fontSize: 16 },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    padding: 32,
  },
  modalBox: {
    backgroundColor: '#222',
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalBtn: {
    backgroundColor: '#333',
    borderRadius: 6,
    paddingVertical: 12,
    marginTop: 8,
  },
  modalBtnText: {
    color: '#ddd',
    fontSize: 16,
    textAlign: 'center',
  },
  modalAdd: { backgroundColor: '#444' },
  modalView: { backgroundColor: '#444' },
  modalCancel: { backgroundColor: '#111' },
>>>>>>> 02f8f5e (Hi)
});
