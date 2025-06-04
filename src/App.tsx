import React from "react";
import AppNavigator from "./navigation/AppNavigator"; // Corrected path relative to src
import { NavigationContainer } from "@react-navigation/native";

export default function App() {
  return (
    <NavigationContainer>
      <AppNavigator />
    </NavigationContainer>
  );
}
