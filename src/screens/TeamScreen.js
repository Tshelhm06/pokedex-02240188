import React, { useMemo } from 'react';
import { ActivityIndicator, FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { artworkUrl } from '../api/pokeapi';
import { MAX_TEAM } from '../config';
import { useTeam } from '../context/TeamContext';
import { useTheme } from '../context/ThemeContext';
import AppButton from '../components/AppButton';
import ScreenHeader from '../components/ScreenHeader';
import StatBar from '../components/StatBar';
import TypeBadge from '../components/TypeBadge';
import { formatName, padId } from '../utils/format';
import { combineStats } from '../utils/stats';

export default function TeamScreen({ navigation }) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { team, loaded, removeMember } = useTeam();

  const { totals, grandTotal } = useMemo(() => combineStats(team), [team]);

  const renderMember = ({ item }) => (
    <Pressable
      style={styles.member}
      onPress={() => navigation.navigate('Detail', { id: item.id })}
      accessibilityRole="button"
    >
      <Image source={{ uri: artworkUrl(item.id) }} style={styles.memberImage} />
      <View style={styles.memberInfo}>
        <Text style={styles.memberNumber}>#{padId(item.id)}</Text>
        <Text style={styles.memberName}>{formatName(item.name)}</Text>
        <View style={styles.memberTypes}>
          {item.types.map((t) => (
            <TypeBadge key={t} type={t} />
          ))}
        </View>
      </View>
      <AppButton
        title="Remove"
        variant="danger"
        onPress={() => removeMember(item.id)}
        style={styles.removeButton}
      />
    </Pressable>
  );

  const header = (
    <View>
      <View style={styles.summary}>
        <View style={styles.countBox}>
          <Text style={styles.count}>
            {team.length}/{MAX_TEAM}
          </Text>
          <Text style={styles.countLabel}>members</Text>
        </View>
        <View style={styles.countBox}>
          <Text style={styles.count}>{grandTotal}</Text>
          <Text style={styles.countLabel}>total base stats</Text>
        </View>
      </View>

      {team.length > 0 ? (
        <View style={styles.statsCard}>
          <Text style={styles.sectionTitle}>Combined base stats</Text>
          {totals.map((stat) => (
            <StatBar
              key={stat.key}
              label={stat.label}
              value={stat.value}
              max={255 * team.length}
              color={colors.primary}
            />
          ))}
        </View>
      ) : null}

      {team.length > 0 ? <Text style={styles.sectionTitle}>Your team</Text> : null}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScreenHeader title="My Team" subtitle="Choose up to six Pokémon" />

      {!loaded ? (
        <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
      ) : (
        <FlatList
          data={team}
          renderItem={renderMember}
          keyExtractor={(item) => String(item.id)}
          ListHeaderComponent={header}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Text style={styles.emptyIcon}>🎒</Text>
              <Text style={styles.emptyText}>
                Your team is empty. Open a Pokémon in the Pokédex and tap “Add to team”.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background, paddingHorizontal: 16 },
    loader: { marginTop: 60 },
    list: { paddingBottom: 24 },
    summary: { flexDirection: 'row', marginBottom: 14 },
    countBox: {
      flex: 1,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 16,
      alignItems: 'center',
      paddingVertical: 14,
      marginHorizontal: 4,
    },
    count: { fontSize: 28, fontWeight: '800', color: colors.primary },
    countLabel: { color: colors.subtext, fontSize: 13, marginTop: 2 },
    statsCard: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 16,
      padding: 16,
      marginBottom: 18,
    },
    sectionTitle: { color: colors.text, fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
    member: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 16,
      padding: 10,
      marginBottom: 12,
    },
    memberImage: { width: 72, height: 72, resizeMode: 'contain' },
    memberInfo: { flex: 1, marginLeft: 8 },
    memberNumber: { color: colors.subtext, fontSize: 12 },
    memberName: { color: colors.text, fontSize: 17, fontWeight: 'bold' },
    memberTypes: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 4, marginLeft: -4 },
    removeButton: { paddingVertical: 8, paddingHorizontal: 12 },
    emptyBox: { alignItems: 'center', marginTop: 30, paddingHorizontal: 20 },
    emptyIcon: { fontSize: 44, marginBottom: 10 },
    emptyText: { color: colors.subtext, fontSize: 16, textAlign: 'center' },
  });
