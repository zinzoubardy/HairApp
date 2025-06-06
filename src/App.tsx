import React from "react";
import { View, Text, StyleSheet } from "react-native";

const App = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Minimal App Loaded!</Text>
      <Text style={styles.text}>If you see this, the basic registration is working.</Text>
      <Text style={styles.text}>The error is likely in the original App.tsx content (Navigation, Contexts, etc.).</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E0E0E0" // Using a slightly different background for clarity
  },
  text: {
    fontSize: 18,
    color: "#111111", // Darker text
    textAlign: "center",
    marginVertical: 10
  },
});

export default App;
