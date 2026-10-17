import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, View } from 'react-native';

import { fetchPokemonDetail } from '../api/pokeapi';
import { MAX_TEAM } from '../config';
import { useTeam } from '../context/TeamContext';
import { useTheme } from '../context/ThemeContext';
import AppButton from '../components/AppButton';
import ErrorView from '../components/ErrorView';
import StatBar from '../components/StatBar';
import TypeBadge from '../components/TypeBadge';
import { formatName, padId } from '../utils/format';

export default function DetailScreen({ route, navigation }) {
  const { id } = route.params; // the Pokémon's id comes through route params
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { team, loaded, isFull, isInTeam, addMember, removeMember } = useTeam();

  const [pokemon, setPokemon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tick, setTick] = useState(0); // bump to retry

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');

    fetchPokemonDetail(id)
      .then((data) => {
        if (cancelled) return;
        setPokemon(data);
        navigation.setOptions({ title: formatName(data.name) });
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Could not load this Pokémon.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id, tick, navigation]);

  const retry = useCallback(() => setTick((t) => t + 1), []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error || !pokemon) {
    return (
      <View style={styles.centerPadded}>
        <ErrorView message={error} onRetry={retry} />
      </View>
    );
  }

  const inTeam = isInTeam(pokemon.id);
  const blocked = !inTeam && isFull; // add button disabled when team is full

  let buttonTitle = 'Add to team';
  if (inTeam) buttonTitle = 'Remove from team';
  else if (isFull) buttonTitle = `Team is full (${MAX_TEAM}/${MAX_TEAM})`;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.stage}>
        <Image source={{ uri: pokemon.image }} style={styles.image} />
      </View>

      <Text style={styles.number}>#{padId(pokemon.id)}</Text>
      <Text style={styles.name}>{formatName(pokemon.name)}</Text>

      <View style={styles.types}>
        {pokemon.types.map((type) => (
          <TypeBadge key={type} type={type} />
        ))}
      </View>

      <View style={styles.measures}>
        <View style={styles.measure}>
          <Text style={styles.measureValue}>{pokemon.height.toFixed(1)} m</Text>
          <Text style={styles.measureLabel}>Height</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.measure}>
          <Text style={styles.measureValue}>{pokemon.weight.toFixed(1)} kg</Text>
          <Text style={styles.measureLabel}>Weight</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Base stats</Text>
        {pokemon.stats.map((stat) => (
          <StatBar key={stat.key} label={stat.label} value={stat.value} />
        ))}
      </View>

      <AppButton
        title={buttonTitle}
        variant={inTeam ? 'danger' : 'primary'}
        disabled={!loaded || blocked}
        onPress={() => (inTeam ? removeMember(pokemon.id) : addMember(pokemon))}
      />
      <Text style={styles.teamHint}>
        Your team: {team.length}/{MAX_TEAM}
      </Text>
    </ScrollView>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { padding: 16, paddingBottom: 40 },
    center: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.background,
    },
    centerPadded: {
      flex: 1,
      justifyContent: 'center',
      padding: 20,
      backgroundColor: colors.background,
    },
    stage: {
      alignSelf: 'stretch',
      alignItems: 'center',
      backgroundColor: colors.stage,
      borderRadius: 20,
      paddingVertical: 16,
    },
    image: { width: 240, height: 240, resizeMode: 'contain' },
    number: { textAlign: 'center', color: colors.subtext, marginTop: 14, fontSize: 14 },
    name: {
      textAlign: 'center',
      color: colors.text,
      fontSize: 30,
      fontWeight: '800',
      marginTop: 2,
    },
    types: { flexDirection: 'row', justifyContent: 'center', marginTop: 10 },
    measures: {
      flexDirection: 'row',
      backgroundColor: colors.card,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      paddingVertical: 14,
      marginTop: 18,
    },
    measure: { flex: 1, alignItems: 'center' },
    measureValue: { color: colors.text, fontSize: 20, fontWeight: 'bold' },
    measureLabel: { color: colors.subtext, fontSize: 13, marginTop: 2 },
    divider: { width: 1, backgroundColor: colors.border },
    card: {
      backgroundColor: colors.card,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 16,
      marginVertical: 18,
    },
    sectionTitle: { color: colors.text, fontSize: 18, fontWeight: 'bold', marginBottom: 14 },
    teamHint: { textAlign: 'center', color: colors.subtext, marginTop: 10 },
  });
