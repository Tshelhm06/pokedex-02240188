import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { TYPE_COLORS } from '../theme';
import { formatName } from '../utils/format';

export default function TypeBadge({ type }) {
  return (
    <View style={[styles.badge, { backgroundColor: TYPE_COLORS[type] || '#777' }]}>
      <Text style={styles.text}>{formatName(type)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 14,
    marginHorizontal: 4,
  },
  text: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 13 },
});
