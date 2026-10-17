import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

// Title bar used by the three tab screens, with the dark mode toggle.
export default function ScreenHeader({ title, subtitle }) {
  const { colors, isDark, toggleTheme } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.wrapper}>
      <View style={styles.textBlock}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      <Pressable
        onPress={toggleTheme}
        style={styles.toggle}
        accessibilityRole="button"
        accessibilityLabel={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        <Text style={styles.toggleIcon}>{isDark ? '☀️' : '🌙'}</Text>
      </Pressable>
    </View>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    wrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingTop: 12,
      paddingBottom: 12,
    },
    textBlock: { flex: 1 },
    title: { fontSize: 28, fontWeight: '800', color: colors.primary },
    subtitle: { fontSize: 14, color: colors.subtext, marginTop: 2 },
    toggle: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    toggleIcon: { fontSize: 20 },
  });
