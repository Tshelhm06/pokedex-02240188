import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

// Colour of the bar depends on how strong the stat is.
const barColor = (ratio) => {
  if (ratio < 0.25) return '#E5534B';
  if (ratio < 0.4) return '#F4A93A';
  if (ratio < 0.6) return '#E8C81B';
  return '#4CAF50';
};

// One horizontal stat bar. `max` is the value that fills the whole bar.
export default function StatBar({ label, value, max = 255, color }) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const ratio = Math.max(0, Math.min(1, value / max));

  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
      <View style={styles.track}>
        <View
          style={[
            styles.fill,
            { width: `${ratio * 100}%`, backgroundColor: color || barColor(ratio) },
          ]}
        />
      </View>
    </View>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    label: { width: 62, color: colors.subtext, fontSize: 13, fontWeight: '600' },
    value: {
      width: 44,
      color: colors.text,
      fontSize: 14,
      fontWeight: 'bold',
      textAlign: 'right',
      marginRight: 10,
    },
    track: {
      flex: 1,
      height: 10,
      borderRadius: 5,
      backgroundColor: colors.track,
      overflow: 'hidden',
    },
    fill: { height: '100%', borderRadius: 5 },
  });
