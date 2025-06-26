import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  StatusBar,
  Platform,
  KeyboardAvoidingView,
  Image,
} from 'react-native';
import { getAIHairstyleAdvice } from '../services/AIService';
import theme from '../styles/theme';

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
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />
      
      {/* Logo in top right */}
      <View style={styles.logoContainer}>
        <Image source={require('../../assets/splash.png')} style={styles.splashImage} />
      </View>

      <View style={styles.header}>
        <Text style={styles.headerTitle}>AI Hair Advisor</Text>
        <Text style={styles.headerSubtitle}>
          Ask our AI for hairstyle advice, color suggestions, or product recommendations!
        </Text>
      </View>

      <View style={styles.content}>
        <TextInput
          style={styles.input}
          placeholder="e.g., What hairstyle suits a round face with curly hair?"
          placeholderTextColor={theme.colors.textSecondary}
          value={prompt}
          onChangeText={setPrompt}
          multiline
          numberOfLines={4}
          editable={!loading}
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.disabledButton]}
          onPress={handleGetAdvice}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={theme.colors.textPrimary} />
          ) : (
            <Text style={styles.buttonText}>Get Advice</Text>
          )}
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
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  logoContainer: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 10,
  },
  splashImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  header: {
    backgroundColor: theme.colors.surface,
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    ...theme.shadows.medium,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.accentGlow,
  },
  headerTitle: {
    fontSize: theme.fontSizes.xl,
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.title,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.body,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: 16,
    fontSize: theme.fontSizes.md,
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.body,
    borderWidth: 1,
    borderColor: theme.colors.accentGlow,
    marginBottom: 20,
    minHeight: 100,
    textAlignVertical: 'top',
    ...theme.shadows.soft,
  },
  button: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.lg,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginBottom: 20,
    ...theme.shadows.medium,
    borderWidth: 1,
    borderColor: theme.colors.accentGlow,
  },
  disabledButton: {
    backgroundColor: theme.colors.border,
    opacity: 0.6,
  },
  buttonText: {
    color: theme.colors.textPrimary,
    fontSize: theme.fontSizes.md,
    fontWeight: 'bold',
    fontFamily: theme.fonts.body,
  },
  errorCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.colors.error,
    ...theme.shadows.soft,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: theme.fontSizes.md,
    fontFamily: theme.fonts.body,
    textAlign: 'center',
  },
  responseCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: 20,
    ...theme.shadows.medium,
    borderWidth: 1,
    borderColor: theme.colors.accentGlow,
  },
  responseTextLabel: {
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.title,
    fontSize: theme.fontSizes.lg,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  responseText: {
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.body,
    fontSize: theme.fontSizes.md,
    lineHeight: 24,
  },
});

export default HairAIScreen;
