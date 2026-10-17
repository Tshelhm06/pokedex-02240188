import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { fetchAllNames, fetchPokemonPage, MAX_POKEMON } from '../api/pokeapi';
import { OWNER_NAME, PAGE_SIZE, START_OFFSET } from '../config';
import { useTheme } from '../context/ThemeContext';
import useDebounce from '../hooks/useDebounce';
import ErrorView from '../components/ErrorView';
import PokemonCard from '../components/PokemonCard';
import ScreenHeader from '../components/ScreenHeader';

export default function PokedexScreen({ navigation }) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  // ---------- Browse list (infinite scroll) ----------
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Refs hold the "live" values so quick repeated onEndReached calls
  // can never start two requests for the same page.
  const offsetRef = useRef(START_OFFSET);
  const loadingRef = useRef(false);
  const hasMoreRef = useRef(true);
  const errorRef = useRef('');

  const loadMore = useCallback(async (isRetry = false) => {
    if (loadingRef.current || !hasMoreRef.current) return;
    if (errorRef.current && !isRetry) return; // wait for the Retry button

    loadingRef.current = true;
    errorRef.current = '';
    setLoading(true);
    setError('');

    try {
      const batch = await fetchPokemonPage(offsetRef.current, PAGE_SIZE);
      offsetRef.current += PAGE_SIZE;
      hasMoreRef.current = batch.length === PAGE_SIZE && offsetRef.current < MAX_POKEMON;

      setItems((previous) => {
        // No duplicates, even if a page were ever received twice.
        const seen = new Set(previous.map((p) => p.id));
        return [...previous, ...batch.filter((p) => !seen.has(p.id))];
      });
    } catch (err) {
      errorRef.current = err.message || 'Something went wrong.';
      setError(errorRef.current);
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMore();
  }, [loadMore]);

  // ---------- Search ----------
  const [query, setQuery] = useState('');
  const trimmed = query.trim().toLowerCase();
  const debounced = useDebounce(trimmed, 400); // do not search on every keystroke
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [searchTick, setSearchTick] = useState(0); // bump to retry

  useEffect(() => {
    if (!debounced) {
      setResults([]);
      setSearching(false);
      setSearchError('');
      return undefined;
    }

    let cancelled = false;
    setSearching(true);
    setSearchError('');

    fetchAllNames()
      .then((all) => {
        if (cancelled) return;
        const byNumber = /^\d+$/.test(debounced) ? Number(debounced) : null;
        const matches = all.filter((p) =>
          byNumber !== null ? p.id === byNumber : p.name.includes(debounced)
        );
        // Names that start with the text come first.
        matches.sort(
          (a, b) =>
            Number(b.name.startsWith(debounced)) - Number(a.name.startsWith(debounced)) ||
            a.id - b.id
        );
        setResults(matches);
      })
      .catch((err) => {
        if (!cancelled) setSearchError(err.message || 'Search failed.');
      })
      .finally(() => {
        if (!cancelled) setSearching(false);
      });

    return () => {
      cancelled = true;
    };
  }, [debounced, searchTick]);

  const searchMode = trimmed.length > 0;
  const searchBusy = searchMode && (trimmed !== debounced || searching);

  const openDetail = useCallback(
    (id) => navigation.navigate('Detail', { id }),
    [navigation]
  );

  const renderItem = useCallback(
    ({ item }) => <PokemonCard id={item.id} name={item.name} onPress={openDetail} />,
    [openDetail]
  );

  // ---------- What to show under the list ----------
  let listEmpty = null;
  let listFooter = null;

  if (searchMode) {
    if (searchBusy) {
      listEmpty = <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />;
    } else if (searchError) {
      listEmpty = <ErrorView message={searchError} onRetry={() => setSearchTick((t) => t + 1)} />;
    } else {
      listEmpty = (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyIcon}>🔍</Text>
          <Text style={styles.emptyText}>No Pokémon found for “{query.trim()}”.</Text>
        </View>
      );
    }
  } else {
    if (loading && items.length === 0) {
      listEmpty = <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />;
    } else if (error && items.length === 0) {
      listEmpty = <ErrorView message={error} onRetry={() => loadMore(true)} />;
    }

    if (items.length > 0) {
      if (loading) {
        listFooter = <ActivityIndicator color={colors.primary} style={styles.footerLoader} />;
      } else if (error) {
        listFooter = <ErrorView compact message={error} onRetry={() => loadMore(true)} />;
      }
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScreenHeader
        title={`${OWNER_NAME}'s Pokédex`}
        subtitle={searchMode ? `${searchBusy ? '…' : results.length} found` : 'Discover your Pokémon'}
      />

      <View style={styles.searchBox}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name or number"
          placeholderTextColor={colors.subtext}
          value={query}
          onChangeText={setQuery}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
        />
        {query.length > 0 ? (
          <Pressable onPress={() => setQuery('')} hitSlop={10} accessibilityLabel="Clear search">
            <Text style={styles.clear}>✕</Text>
          </Pressable>
        ) : null}
      </View>

      <FlatList
        data={searchMode ? (searchBusy ? [] : results) : items}
        renderItem={renderItem}
        keyExtractor={(item) => String(item.id)}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        onEndReached={searchMode ? undefined : () => loadMore(false)}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={listEmpty}
        ListFooterComponent={listFooter}
        initialNumToRender={8}
        windowSize={7}
      />
    </SafeAreaView>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background, paddingHorizontal: 16 },
    searchBox: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingHorizontal: 12,
      marginBottom: 14,
    },
    searchIcon: { fontSize: 16, marginRight: 8 },
    searchInput: { flex: 1, paddingVertical: 12, fontSize: 16, color: colors.text },
    clear: { fontSize: 18, color: colors.subtext, paddingLeft: 8 },
    list: { paddingBottom: 24, flexGrow: 1 },
    row: { justifyContent: 'space-between' },
    loader: { marginTop: 60 },
    footerLoader: { marginVertical: 20 },
    emptyBox: { alignItems: 'center', marginTop: 60 },
    emptyIcon: { fontSize: 40, marginBottom: 10 },
    emptyText: { color: colors.subtext, fontSize: 16, textAlign: 'center' },
  });
