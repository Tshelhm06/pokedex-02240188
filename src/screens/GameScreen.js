import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { artworkUrl, fetchAllNames } from '../api/pokeapi';
import { useTheme } from '../context/ThemeContext';
import AppButton from '../components/AppButton';
import ErrorView from '../components/ErrorView';
import ScreenHeader from '../components/ScreenHeader';
import { formatName } from '../utils/format';

const GAME_POOL = 151; // first generation only
const BEST_STREAK_KEY = 'pokedex:bestStreak';

const shuffle = (array) => {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

// Picks the right answer plus three different wrong ones, in random order.
function createRound(pool, previousId) {
  let answer = pool[Math.floor(Math.random() * pool.length)];
  while (answer.id === previousId) {
    answer = pool[Math.floor(Math.random() * pool.length)];
  }
  const wrong = shuffle(pool.filter((p) => p.id !== answer.id)).slice(0, 3);
  return { answer, options: shuffle([answer, ...wrong]) };
}

export default function GameScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [round, setRound] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [correctCount, setCorrectCount] = useState(0);
  const [played, setPlayed] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);

  const previousIdRef = useRef(null);

  // The best streak is remembered between launches.
  useEffect(() => {
    AsyncStorage.getItem(BEST_STREAK_KEY)
      .then((value) => {
        const saved = parseInt(value, 10);
        if (!Number.isNaN(saved)) setBestStreak(saved);
      })
      .catch(() => {});
  }, []);

  const startRound = useCallback(async () => {
    setLoading(true);
    setError('');
    setSelectedId(null);

    try {
      const all = await fetchAllNames();
      const next = createRound(all.slice(0, GAME_POOL), previousIdRef.current);
      // Download the picture first so the silhouette never flashes in half-loaded.
      await Image.prefetch(artworkUrl(next.answer.id)).catch(() => {});
      previousIdRef.current = next.answer.id;
      setRound(next);
    } catch (err) {
      setError(err.message || 'Could not start a round.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    startRound();
  }, [startRound]);

  const answered = selectedId !== null;

  const handleAnswer = (id) => {
    if (answered || !round) return;
    setSelectedId(id);
    setPlayed((n) => n + 1);

    if (id === round.answer.id) {
      const newStreak = streak + 1;
      setCorrectCount((n) => n + 1);
      setStreak(newStreak);
      if (newStreak > bestStreak) {
        setBestStreak(newStreak);
        AsyncStorage.setItem(BEST_STREAK_KEY, String(newStreak)).catch(() => {});
      }
    } else {
      setStreak(0);
    }
  };

  const optionStyle = (id) => {
    if (!answered) return [styles.option];
    if (id === round.answer.id) return [styles.option, styles.optionCorrect]; // green
    if (id === selectedId) return [styles.option, styles.optionWrong]; // red
    return [styles.option, styles.optionDim];
  };

  const optionTextStyle = (id) => {
    if (answered && (id === round.answer.id || id === selectedId)) {
      return [styles.optionText, styles.optionTextOnColor];
    }
    return [styles.optionText];
  };

  const wasCorrect = answered && round && selectedId === round.answer.id;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScreenHeader title="Who's That Pokémon?" subtitle="Guess from the silhouette" />

      <View style={styles.scoreRow}>
        <View style={styles.scoreBox}>
          <Text style={styles.scoreValue}>
            {correctCount}/{played}
          </Text>
          <Text style={styles.scoreLabel}>Score</Text>
        </View>
        <View style={styles.scoreBox}>
          <Text style={styles.scoreValue}>🔥 {streak}</Text>
          <Text style={styles.scoreLabel}>Streak</Text>
        </View>
        <View style={styles.scoreBox}>
          <Text style={styles.scoreValue}>🏆 {bestStreak}</Text>
          <Text style={styles.scoreLabel}>Best streak</Text>
        </View>
      </View>

      {error ? (
        <ErrorView message={error} onRetry={startRound} />
      ) : loading && !round ? (
        <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.stage}>
            {round ? (
              <Image
                source={{ uri: artworkUrl(round.answer.id) }}
                // A black tint turns the artwork into a silhouette until answered.
                style={[styles.image, !answered && styles.silhouette]}
              />
            ) : null}
            {loading ? (
              <ActivityIndicator color={colors.primary} style={styles.stageLoader} />
            ) : null}
          </View>

          {answered ? (
            <Text style={[styles.result, wasCorrect ? styles.resultCorrect : styles.resultWrong]}>
              {wasCorrect
                ? `Correct! It's ${formatName(round.answer.name)}!`
                : `Oops! It was ${formatName(round.answer.name)}.`}
            </Text>
          ) : (
            <Text style={styles.question}>Who's that Pokémon?</Text>
          )}

          {round
            ? round.options.map((option) => (
                <Pressable
                  key={option.id}
                  style={optionStyle(option.id)}
                  disabled={answered || loading}
                  onPress={() => handleAnswer(option.id)}
                  accessibilityRole="button"
                >
                  <Text style={optionTextStyle(option.id)}>{formatName(option.name)}</Text>
                </Pressable>
              ))
            : null}

          {answered ? (
            <AppButton title="Next" onPress={startRound} disabled={loading} style={styles.next} />
          ) : null}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background, paddingHorizontal: 16 },
    loader: { marginTop: 60 },
    content: { paddingBottom: 30 },
    scoreRow: { flexDirection: 'row', marginBottom: 14 },
    scoreBox: {
      flex: 1,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 14,
      alignItems: 'center',
      paddingVertical: 10,
      marginHorizontal: 4,
    },
    scoreValue: { color: colors.text, fontSize: 18, fontWeight: 'bold' },
    scoreLabel: { color: colors.subtext, fontSize: 12, marginTop: 2 },
    stage: {
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.stage, // always light so the black silhouette is visible
      borderRadius: 20,
      height: 250,
    },
    image: { width: 220, height: 220, resizeMode: 'contain' },
    silhouette: { tintColor: '#000000' },
    stageLoader: { position: 'absolute' },
    question: {
      textAlign: 'center',
      color: colors.text,
      fontSize: 20,
      fontWeight: 'bold',
      marginVertical: 14,
    },
    result: { textAlign: 'center', fontSize: 20, fontWeight: 'bold', marginVertical: 14 },
    resultCorrect: { color: colors.success },
    resultWrong: { color: colors.danger },
    option: {
      backgroundColor: colors.card,
      borderWidth: 2,
      borderColor: colors.border,
      borderRadius: 12,
      paddingVertical: 14,
      alignItems: 'center',
      marginBottom: 10,
    },
    optionCorrect: { backgroundColor: '#2E9E4F', borderColor: '#2E9E4F' },
    optionWrong: { backgroundColor: '#D84040', borderColor: '#D84040' },
    optionDim: { opacity: 0.5 },
    optionText: { color: colors.text, fontSize: 17, fontWeight: '600' },
    optionTextOnColor: { color: '#FFFFFF' },
    next: { marginTop: 6 },
  });
