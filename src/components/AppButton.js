import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { useTheme } from '../context/ThemeContext';

// variant: 'primary' (filled) | 'danger' (red outline) | 'outline'
export default function AppButton({ title, onPress, disabled, variant = 'primary', style }) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
        style,
      ]}
    >
      <Text style={[styles.text, styles[`${variant}Text`], disabled && styles.disabledText]}>
        {title}
      </Text>
    </Pressable>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    base: {
      paddingVertical: 14,
      paddingHorizontal: 20,
      borderRadius: 12,
      alignItems: 'center',
      borderWidth: 2,
    },
    primary: { backgroundColor: colors.primary, borderColor: colors.primary },
    danger: { backgroundColor: 'transparent', borderColor: colors.danger },
    outline: { backgroundColor: 'transparent', borderColor: colors.primary },
    disabled: { backgroundColor: colors.disabled, borderColor: colors.disabled },
    pressed: { opacity: 0.8 },
    text: { fontSize: 16, fontWeight: 'bold' },
    primaryText: { color: colors.onPrimary },
    dangerText: { color: colors.danger },
    outlineText: { color: colors.primary },
    disabledText: { color: '#FFFFFF' },
  });
