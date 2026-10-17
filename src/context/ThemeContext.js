import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { darkColors, lightColors } from '../theme';

const STORAGE_KEY = 'pokedex:darkMode';
const ThemeContext = createContext(null);

// Extra feature: dark mode, remembered between launches.
export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((value) => {
        if (value === 'true') setIsDark(true);
      })
      .catch(() => {});
  }, []);

  const toggleTheme = useCallback(() => {
    setIsDark((previous) => {
      AsyncStorage.setItem(STORAGE_KEY, String(!previous)).catch(() => {});
      return !previous;
    });
  }, []);

  const value = useMemo(
    () => ({ isDark, toggleTheme, colors: isDark ? darkColors : lightColors }),
    [isDark, toggleTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);
