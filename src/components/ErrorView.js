import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import AppButton from './AppButton';

// Error message with a Retry button.
export default function ErrorView({ message, onRetry, compact }) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={[styles.box, compact && styles.compact]}>
      <Text style={styles.icon}>⚠️</Text>
      <Text style={styles.message}>{message || 'Something went wrong.'}</Text>
      <AppButton title="Retry" onPress={onRetry} style={styles.button} />
    </View>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    box: {
      backgroundColor: colors.dangerBg,
      borderRadius: 14,
      padding: 20,
      alignItems: 'center',
      marginVertical: 24,
    },
    compact: { marginVertical: 12, padding: 14 },
    icon: { fontSize: 30, marginBottom: 6 },
    message: { color: colors.danger, textAlign: 'center', fontSize: 15, marginBottom: 14 },
    button: { minWidth: 120, paddingVertical: 10 },
  });
