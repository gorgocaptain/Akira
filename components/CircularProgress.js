// @/components/CircularProgress.js
import { StyleSheet, Text, View } from 'react-native';
import { Circle, Svg } from 'react-native-svg';

export default function CircularProgress({ value, maxValue, label, color, size }) {

  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(value / maxValue, 1);
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <View style={styles.container}>
      <Svg width={size} height={size}>
        <Circle
          stroke="#eee"
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          
        />
        <Circle
          stroke={color}
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value} / {maxValue}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    display: 'inline',
    alignItems: 'center',
    margin: 16,
  },
  label: {
    marginTop: 0,
    fontWeight: 'bold',
    fontSize: 16,
  },
  value: {
    fontSize: 14,
    color: '#666',
  },
  
});
