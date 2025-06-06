import React from "react"; // Still need React for the component
import { AppRegistry, View, Text, StyleSheet } from "react-native";
import { name as appName } from "./app.json";

// Define a dead-simple component inline
const MinimalAppForIndex = () => (
  <View style={styles.container}>
    <Text style={styles.text}>Minimal Index.js Loaded!</Text>
    <Text style={styles.text}>If you see this, AppRegistry is working.</Text>
    <Text style={styles.text}>The issue might be with how App.tsx is imported or structured, or a deeper Metro/RN bug.</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#D3D3D3" }, // LightGray
  text: { fontSize: 16, color: "#000000", textAlign: "center", marginVertical: 8 },
});

// Register the inline component
AppRegistry.registerComponent(appName, () => MinimalAppForIndex);

// Comment out original App.tsx import and registration for this test
// import App from "./src/App";
// AppRegistry.registerComponent(appName, () => App);

// Comment out polyfills for this minimal test too
// import 'react-native-url-polyfill/auto';
// import 'react-native-gesture-handler';
