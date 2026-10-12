
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import { fetchPokemonBatch } from './src/api/pokeapi';

const PAGE_SIZE = 20;
const INITIAL_OFFSET = 188;

export default function App() {
  const [pokemon, setPokemon] = useState([]);
  const [offset, setOffset] = useState(INITIAL_OFFSET);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasMore, setHasMore] = useState(true);

  const loadPokemon = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    setError('');

    try {
      const batch = await fetchPokemonBatch(offset, PAGE_SIZE);

      setPokemon((previous) => {
        // Prevent duplicate Pokémon if the list requests a batch twice.
        const existingIds = new Set(previous.map((item) => item.id));
        const newItems = batch.filter(
          (item) => !existingIds.has(item.id)
        );
        return [...previous, ...newItems];
      });

      setOffset((previous) => previous + PAGE_SIZE);
      setHasMore(batch.length === PAGE_SIZE);
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }, [offset, loading, hasMore]);

  useEffect(() => {
    loadPokemon();
  }, []);

  const renderPokemon = ({ item }) => (
    <View style={styles.card}>
      {item.image ? (
        <Image source={{ uri: item.image }} style={styles.image} />
      ) : (
        <View style={styles.imagePlaceholder}>
          <Text>No image</Text>
        </View>
      )}

      <Text style={styles.number}>
        #{String(item.id).padStart(3, '0')}
      </Text>

      <Text style={styles.name}>
        {item.name.charAt(0).toUpperCase() + item.name.slice(1)}
      </Text>

      <Text style={styles.types}>{item.types.join(' · ')}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.heading}>Pokédex</Text>
      <Text style={styles.subtitle}>Discover your Pokémon</Text>

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable style={styles.retryButton} onPress={loadPokemon}>
            <Text style={styles.retryText}>Try again</Text>
          </Pressable>
        </View>
      ) : null}

      <FlatList
        data={pokemon}
        renderItem={renderPokemon}
        keyExtractor={(item) => String(item.id)}
        numColumns={2}
        contentContainerStyle={styles.list}
        columnWrapperStyle={styles.row}
        onEndReached={loadPokemon}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          loading && !error ? (
            <ActivityIndicator size="large" style={styles.loader} />
          ) : null
        }
        ListFooterComponent={
          loading && pokemon.length > 0 ? (
            <ActivityIndicator size="small" style={styles.footerLoader} />
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6FA',
    paddingHorizontal: 16,
  },
  heading: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#24324A',
    marginTop: 16,
  },
  subtitle: {
    fontSize: 15,
    color: '#69758A',
    marginTop: 4,
    marginBottom: 16,
  },
  list: {
    paddingBottom: 24,
  },
  row: {
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    marginBottom: 14,
    elevation: 2,
  },
  image: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
  },
  imagePlaceholder: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  number: {
    color: '#7A8496',
    fontSize: 12,
    marginTop: 4,
  },
  name: {
    color: '#24324A',
    fontSize: 17,
    fontWeight: 'bold',
    marginTop: 3,
  },
  types: {
    color: '#69758A',
    fontSize: 12,
    marginTop: 5,
    textTransform: 'capitalize',
  },
  loader: {
    marginTop: 60,
  },
  footerLoader: {
    marginVertical: 20,
  },
  errorBox: {
    backgroundColor: '#FDECEC',
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
  },
  errorText: {
    color: '#A52222',
    marginBottom: 8,
  },
  retryButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#24324A',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  retryText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});