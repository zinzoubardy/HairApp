import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { AuthProvider, useAuth } from "./contexts/AuthContext"; // Corrected path if necessary
import AppNavigator from "./navigation/AppNavigator"; // Corrected path if necessary
import AuthScreen from "./screens/AuthScreen"; // Corrected path if necessary
import { StatusBar } from "expo-status-bar";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import theme from "./styles/theme"; // Assuming theme.js is in src/styles

const AppContent = () => {
  const { user, loadingInitial } = useAuth();

  if (loadingInitial) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return user ? <AppNavigator /> : <AuthScreen />;
};

const App = () => {
  return (
    <NavigationContainer>
      <AuthProvider>
        <StatusBar style="auto" />
        <AppContent />
      </AuthProvider>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.background, // Optional: use a background color from theme
  },
});

export default App;
