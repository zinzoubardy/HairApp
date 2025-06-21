import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  StatusBar,
  Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getAIHairstyleAdvice } from '../services/AIService.js';
import theme from '../styles/theme.js';

const HairAIScreen = () => {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGetAdvice = async () => {
    if (!prompt.trim()) {
      Alert.alert("Validation Error", "Please enter a question or describe your hair concern.");
      return;
    }
    setLoading(true);
    setError(null);
    setResponse(null);
    try {
      const result = await getAIHairstyleAdvice(prompt);
      if (result.success) {
        setResponse(result.data);
      } else {
        setError(result.error);
        Alert.alert("AI Error", result.error || "Could not fetch advice.");
      }
    } catch (e) {
      const errorMessage = e.message || "An unexpected error occurred.";
      setError(errorMessage);
      Alert.alert("System Error", errorMessage);
    }
    setLoading(false);
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />
      <Text style={styles.title}>AI Hair Advisor</Text>
      <Text style={styles.description}>
        Ask our AI for hairstyle advice, color suggestions, or product recommendations!
      </Text>

      <TextInput
        style={styles.input}
        placeholder="e.g., What hairstyle suits a round face with curly hair?"
        placeholderTextColor={theme.colors.textSecondary}
        value={prompt}
        onChangeText={setPrompt}
        multiline
        editable={!loading}
      />

      <TouchableOpacity
        style={styles.buttonContainer}
        onPress={handleGetAdvice}
        disabled={loading}
      >
        <LinearGradient
          colors={loading ? [theme.colors.textSecondary, theme.colors.border] : [theme.colors.primary, theme.colors.secondary]}
          style={styles.buttonGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {loading ? (
            <ActivityIndicator color={"#FFFFFF"} />
          ) : (
            <Text style={styles.buttonText}>Get Advice</Text>
          )}
        </LinearGradient>
      </TouchableOpacity>

      {error && (
        <View style={styles.errorCard}>
          <Text style={styles.errorText}>Error: {error}</Text>
        </View>
      )}
      {response && (
        <View style={styles.responseCard}>
          <Text style={styles.responseTextLabel}>AI's Advice:</Text>
          <Text style={styles.responseText}>{response}</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.md,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + theme.spacing.md : theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
  },
  title: {
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.title,
    fontSize: theme.fontSizes.xl, // Kept xl as it's a screen title
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  description: {
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.body,
    fontSize: theme.fontSizes.md,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  input: {
    color: theme.colors.textPrimary,
    backgroundColor: theme.colors.card,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: theme.borderRadius.lg, // More pronounced curve
    padding: theme.spacing.md,
    fontSize: theme.fontSizes.md,
    marginBottom: theme.spacing.md, // Reduced margin slightly
    minHeight: 120, // Increased height for better multiline input
    textAlignVertical: 'top',
    placeholderTextColor: theme.colors.textSecondary,
  },
  buttonContainer: {
    borderRadius: theme.borderRadius.lg,
    marginVertical: theme.spacing.lg,
    // Optional: Adding shadow similar to HomeScreen cards
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 6,
  },
  buttonGradient: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg, // More horizontal padding
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50, // Ensure a good tap target height
  },
  buttonText: {
    color: "#FFFFFF", // White text for contrast on gradient
    fontFamily: theme.fonts.title, // Using title font for button
    fontSize: theme.fontSizes.md,
    fontWeight: 'bold',
  },
  responseCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    borderColor: theme.colors.border,
    borderWidth: 1,
    padding: theme.spacing.lg, // More padding
    marginTop: theme.spacing.lg,
    // Optional: Shadow
    shadowColor: theme.colors.secondary, // Using secondary for response card shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  responseTextLabel: {
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.title,
    fontSize: theme.fontSizes.lg,
    marginBottom: theme.spacing.sm,
  },
  responseText: {
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.body,
    fontSize: theme.fontSizes.md,
    lineHeight: theme.fontSizes.md * 1.6, // Increased line height
  },
  errorCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    borderColor: theme.colors.error, // Error color for border
    borderWidth: 1,
    padding: theme.spacing.md,
    marginTop: theme.spacing.lg,
    // Optional: Shadow
    shadowColor: theme.colors.error,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  errorText: {
    color: theme.colors.error,
    fontFamily: theme.fonts.body,
    fontSize: theme.fontSizes.md,
    textAlign: 'center',
  }
});

export default HairAIScreen;
