import React, { memo, useMemo, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { artworkUrl } from '../api/pokeapi';
import { formatName, padId } from '../utils/format';

// Grid card: artwork, number and name. Reused by the Pokédex and search.
function PokemonCard({ id, name, onPress }) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      onPress={() => onPress(id)}
      accessibilityRole="button"
      accessibilityLabel={`${formatName(name)}, number ${id}`}
    >
      {imageFailed ? (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>No image</Text>
        </View>
      ) : (
        <Image
          source={{ uri: artworkUrl(id) }}
          style={styles.image}
          onError={() => setImageFailed(true)}
        />
      )}
      <Text style={styles.number}>#{padId(id)}</Text>
      <Text style={styles.name} numberOfLines={1}>
        {formatName(name)}
      </Text>
    </Pressable>
  );
}

export default memo(PokemonCard);

const createStyles = (colors) =>
  StyleSheet.create({
    card: {
      width: '48%',
      backgroundColor: colors.card,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 12,
      alignItems: 'center',
      marginBottom: 14,
    },
    pressed: { opacity: 0.7 },
    image: { width: 120, height: 120, resizeMode: 'contain' },
    placeholder: {
      width: 120,
      height: 120,
      alignItems: 'center',
      justifyContent: 'center',
    },
    placeholderText: { color: colors.subtext },
    number: { color: colors.subtext, fontSize: 12, marginTop: 4 },
    name: { color: colors.text, fontSize: 17, fontWeight: 'bold', marginTop: 3 },
  });
