import React, { useMemo } from 'react';
import { ActivityIndicator, Text } from 'react-native';
import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { TeamProvider, useTeam } from './src/context/TeamContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import PokedexScreen from './src/screens/PokedexScreen';
import DetailScreen from './src/screens/DetailScreen';
import TeamScreen from './src/screens/TeamScreen';
import GameScreen from './src/screens/GameScreen';
import { padId } from './src/utils/format';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const tabIcon = (emoji) => ({ focused }) => (
  <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.55 }}>{emoji}</Text>
);

// Three bottom tabs: Pokédex, My Team, Game.
function Tabs() {
  const { colors } = useTheme();
  const { team } = useTeam();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false, // each screen draws its own header
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.subtext,
        tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.border },
        tabBarBadgeStyle: { backgroundColor: colors.primary, color: colors.onPrimary },
      }}
    >
      <Tab.Screen
        name="Pokédex"
        component={PokedexScreen}
        options={{ tabBarIcon: tabIcon('📖') }}
      />
      <Tab.Screen
        name="My Team"
        component={TeamScreen}
        options={{
          tabBarIcon: tabIcon('⭐'),
          tabBarBadge: team.length > 0 ? team.length : undefined,
        }}
      />
      <Tab.Screen name="Game" component={GameScreen} options={{ tabBarIcon: tabIcon('🎮') }} />
    </Tab.Navigator>
  );
}

// Detail screen opens on top of the tabs (native stack).
function Root() {
  const { colors, isDark } = useTheme();
  const { loaded } = useTeam();

  const navTheme = useMemo(() => {
    const base = isDark ? DarkTheme : DefaultTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        primary: colors.primary,
        background: colors.background,
        card: colors.card,
        text: colors.text,
        border: colors.border,
      },
    };
  }, [colors, isDark]);

  return (
    <NavigationContainer theme={navTheme}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      {!loaded ? (
        <ActivityIndicator
          size="large"
          color={colors.primary}
          style={{ flex: 1, backgroundColor: colors.background }}
        />
      ) : (
        <Stack.Navigator>
          <Stack.Screen name="Tabs" component={Tabs} options={{ headerShown: false }} />
          <Stack.Screen
            name="Detail"
            component={DetailScreen}
            options={({ route }) => ({
              title: `#${padId(route.params.id)}`,
              headerTintColor: colors.primary,
              headerTitleStyle: { color: colors.text },
              headerStyle: { backgroundColor: colors.card },
              headerBackTitle: 'Back',
            })}
          />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <TeamProvider>
          <Root />
        </TeamProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
