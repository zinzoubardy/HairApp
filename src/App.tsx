import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import AppNavigator from "./navigation/AppNavigator";
import AuthScreen from "./screens/AuthScreen";
import { StatusBar } from "expo-status-bar";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import theme from "./styles/theme";

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
    backgroundColor: theme && theme.colors && theme.colors.background ? theme.colors.background : '#FFFFFF',
  },
});

export default App;