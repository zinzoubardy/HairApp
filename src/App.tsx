import React, { useEffect, useState } from "react";
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ActivityIndicator, View, StyleSheet } from 'react-native';
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

  useEffect(() => {
    // Initialize i18n when the app starts
    const initApp = async () => {
      try {
        await initializeI18n();
        setLanguageReady(true);
      } catch (error) {
        console.log('Error initializing i18n in App:', error);
        setLanguageReady(true); // Continue anyway
      }
    };
    
    initApp();
  }, []);

  if (loadingInitial || !languageReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.accent} />
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