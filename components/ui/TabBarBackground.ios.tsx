import { BlurView } from 'expo-blur';
import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function BlurTabBarBackground() {
  const { bottom } = useSafeAreaInsets();
  return (
    <BlurView
      // System chrome material automatically adapts to the system's theme
      // and matches the native tab bar appearance on iOS.
      tint="systemChromeMaterial"
      intensity={2}
      style={[StyleSheet.absoluteFill, { paddingBottom: bottom }]}
    />
  );
}

export function useBottomTabOverflow() {
  return useSafeAreaInsets().bottom;
}
