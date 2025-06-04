import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { AuthProvider, useAuth } from "./contexts/AuthContext"; // Corrected path
import AppNavigator from "./navigation/AppNavigator";   // Corrected path
import AuthScreen from "./screens/AuthScreen";     // Corrected path
import { View, ActivityIndicator, Text, StyleSheet } from "react-native";
import theme from "./styles/theme";                  // Corrected path

// Initial loading screen component
const InitialLoadingScreen = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color={theme.colors.primary} />
    <Text style={styles.loadingText}>Loading Application...</Text>
  </View>
);

// Component to decide which navigator to show
const AppContent = () => {
  const { session, user, loadingInitial } = useAuth();

  if (loadingInitial) {
    return <InitialLoadingScreen />;
  }

  // If session and user exist, user is logged in
  if (session && user) {
    return <AppNavigator />;
  }

  // Otherwise, user is not logged in, show AuthScreen
  return <AuthScreen />;
};

export default function App() {
  return (
    // AuthProvider now wraps NavigationContainer to ensure context is available everywhere
    // and NavigationContainer is only rendered once AuthProvider is ready (implicitly)
    <AuthProvider>
      <NavigationContainer>
        <AppContent />
      </NavigationContainer>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: theme.fontSizes.md,
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.body,
  },
});
