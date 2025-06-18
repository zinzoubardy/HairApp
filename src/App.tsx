import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const App = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Minimal App.tsx Loaded!</Text>
      <Text style={styles.text}>If you see this, basic registration is working.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFE0', // Light yellow for easy identification
  },
  text: {
    fontSize: 18,
    color: '#000000',
    textAlign: 'center',
    marginVertical: 10,
  },
});

export default App;
