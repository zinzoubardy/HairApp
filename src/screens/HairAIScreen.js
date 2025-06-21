import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
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
      setError(e.message || "An unexpected error occurred.");
      Alert.alert("System Error", e.message || "An unexpected error occurred.");
    }
    setLoading(false);
  };

  return (
    <ScrollView contentContainerStyle={{...styles.container, backgroundColor: theme.colors.background}}>
      <Text style={{...styles.title, color: theme.colors.textPrimary, fontFamily: theme.fonts.title}}>AI Hair Advisor</Text>
      <Text style={{...styles.description, color: theme.colors.textSecondary, fontFamily: theme.fonts.body}}>
        Ask our AI for hairstyle advice, color suggestions, or product recommendations!
      </Text>
      <TextInput
        style={{...styles.input, color: theme.colors.textPrimary, backgroundColor: theme.colors.card, borderColor: theme.colors.border}}
        placeholder="e.g., What hairstyle suits a round face with curly hair?"
        placeholderTextColor={theme.colors.textSecondary}
        value={prompt}
        onChangeText={setPrompt}
        multiline
      />
      <TouchableOpacity
        style={{...styles.button, backgroundColor: loading ? theme.colors.secondary : theme.colors.primary}}
        onPress={handleGetAdvice}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={theme.colors.background} />
        ) : (
          <Text style={{...styles.buttonText, color: theme.colors.background, fontFamily: theme.fonts.body}}>Get Advice</Text>
        )}
      </TouchableOpacity>

      {error && (
        <View style={styles.responseContainer}>
          <Text style={{...styles.errorText, color: theme.colors.error}}>Error: {error}</Text>
        </View>
      )}
      {response && (
        <View style={{...styles.responseContainer, backgroundColor: theme.colors.card}}>
          <Text style={{...styles.responseTextLabel, color: theme.colors.textPrimary, fontFamily: theme.fonts.title}}>AI's Advice:</Text>
          <Text style={{...styles.responseText, color: theme.colors.textPrimary, fontFamily: theme.fonts.body}}>{response}</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: theme.spacing.md,
  },
  title: {
    fontSize: theme.fontSizes.xl,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  description: {
     fontSize: theme.fontSizes.md,
     textAlign: 'center',
     marginBottom: theme.spacing.lg,
  },
  input: {
    borderWidth: 1,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: theme.fontSizes.md,
    marginBottom: theme.spacing.lg,
    minHeight: 100,
    textAlignVertical: 'top', // For multiline
  },
  button: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
    marginBottom: theme.spacing.lg,
  },
  buttonText: {
    fontSize: theme.fontSizes.md,
    fontWeight: 'bold',
  },
  responseContainer: {
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginTop: theme.spacing.md,
  },
   responseTextLabel: {
     fontSize: theme.fontSizes.lg,
     fontWeight: 'bold',
     marginBottom: theme.spacing.sm,
   },
  responseText: {
    fontSize: theme.fontSizes.md,
    lineHeight: theme.fontSizes.md * 1.5, // For better readability
  },
  errorText: {
    fontSize: theme.fontSizes.md,
    textAlign: 'center',
  }
});

export default HairAIScreen;
