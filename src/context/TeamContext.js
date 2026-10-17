import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MAX_TEAM } from '../config';

const STORAGE_KEY = 'pokedex:team:v1';
const TeamContext = createContext(null);

// Only keep what the app needs, so the saved data stays small and valid.
const toMember = (p) => ({
  id: p.id,
  name: p.name,
  types: p.types,
  stats: p.stats,
});

const isValidMember = (m) =>
  m && typeof m.id === 'number' && typeof m.name === 'string' && Array.isArray(m.stats);

export function TeamProvider({ children }) {
  const [team, setTeam] = useState([]);
  const [loaded, setLoaded] = useState(false);

  // Load the saved team once when the app starts.
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw && alive) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            setTeam(parsed.filter(isValidMember).slice(0, MAX_TEAM));
          }
        }
      } catch (err) {
        // A corrupt or unreadable save simply starts an empty team.
      } finally {
        if (alive) setLoaded(true);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // Save every change (but only after the first load, so we never
  // overwrite the saved team with an empty one).
  useEffect(() => {
    if (!loaded) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(team)).catch(() => {});
  }, [team, loaded]);

  const addMember = useCallback((pokemon) => {
    setTeam((previous) => {
      if (previous.length >= MAX_TEAM) return previous; // team full
      if (previous.some((m) => m.id === pokemon.id)) return previous; // no duplicates
      return [...previous, toMember(pokemon)];
    });
  }, []);

  const removeMember = useCallback((id) => {
    setTeam((previous) => previous.filter((m) => m.id !== id));
  }, []);

  const value = useMemo(
    () => ({
      team,
      loaded,
      isFull: team.length >= MAX_TEAM,
      isInTeam: (id) => team.some((m) => m.id === id),
      addMember,
      removeMember,
    }),
    [team, loaded, addMember, removeMember]
  );

  return <TeamContext.Provider value={value}>{children}</TeamContext.Provider>;
}

export const useTeam = () => useContext(TeamContext);
