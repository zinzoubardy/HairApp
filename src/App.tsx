import React, { useEffect, useState } from "react";
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ActivityIndicator, View, StyleSheet, Text } from 'react-native';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AppNavigator from "./navigation/AppNavigator";
import theme from './styles/theme';
import { initializeI18n } from './i18n';

// Add linking config for deep linking
const linking = {
  prefixes: ['rootandglow://', 'https://rootandglow.com'],
  config: {
    screens: {
      Splash: 'Splash',
      Auth: 'Auth',
      OnboardingCarousel: 'OnboardingCarousel',
      MainTabs: {
        screens: {
          Dashboard: 'dashboard',
          Routines: 'routines',
          Analyse: 'analyse',
          AIAdvisor: 'ai_advisor',
          Profile: 'profile',
        },
      },
      Upload: 'upload',
      AnalysisResult: 'analysis-result',
      PrivacyPolicy: 'privacy-policy',
    },
  },
};

function Root() {
  const { user, loadingInitial } = useAuth() || { user: null, loadingInitial: false };
  const [languageReady, setLanguageReady] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Initialize i18n when the app starts
    const initApp = async () => {
      try {
        console.log('App: Starting initialization...');
        await initializeI18n();
        console.log('App: i18n initialization complete');
        setLanguageReady(true);
      } catch (error) {
        console.error('Error initializing i18n in App:', error);
        setError(error.message);
        setLanguageReady(true); // Continue anyway
      }
    };
    
    initApp();
  }, []);

  console.log('App: Root render - loadingInitial:', loadingInitial, 'languageReady:', languageReady, 'error:', error);

  if (error) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={{ color: 'red', textAlign: 'center', margin: 20 }}>
          Error: {error}
        </Text>
      </View>
    );
  }

  if (loadingInitial || !languageReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.accent} />
        <Text style={{ marginTop: 10, color: theme.colors.textSecondary }}>
          Loading...
        </Text>
      </View>
    );
  }

  return (
    <NavigationContainer linking={linking} fallback={null}>
      <AppNavigator />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <AuthProvider>
        <Root />
      </AuthProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
});