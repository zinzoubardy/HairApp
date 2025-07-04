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
  ScrollView,
} from 'react-native';
import { getAIHairstyleAdvice } from '../services/AIService';
import theme from '../styles/theme';
import { useTranslation } from '../i18n';
import { I18nManager } from 'react-native';

const HairAIScreen = () => {
  const { t } = useTranslation();
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Helper function to get text direction based on content
  const getTextDirection = (text) => {
    if (!text) return 'ltr';
    // Check if text contains Arabic characters
    const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
    return arabicRegex.test(text) ? 'rtl' : 'ltr';
  };

  const handleGetAdvice = async () => {
    if (!prompt.trim()) {
      Alert.alert(t('validation_error'), t('validation_error'));
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
        Alert.alert(t('ai_error'), result.error || t('ai_error'));
      }
    } catch (e) {
      const errorMessage = e.message || "An unexpected error occurred.";
      setError(errorMessage);
      Alert.alert(t('system_error'), errorMessage);
    }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />
      
      <View style={styles.centralLogoContainer}>
        <Image source={require('../../assets/splash.png')} style={styles.bigLogo} />
      </View>

      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>{t('ai_advisor')}</Text>
        <Text style={styles.headerSubtitle}>
          {t('ai_advisor_subtitle')}
        </Text>
      </View>

      <View style={styles.content}>
        <TextInput
          style={[styles.input, { textAlign: getTextDirection(prompt) }]}
          placeholder={t('enter_hair_question')}
          placeholderTextColor={theme.colors.textSecondary}
          value={prompt}
          onChangeText={setPrompt}
          multiline
          numberOfLines={4}
          editable={!loading}
          textAlignVertical="top"
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.disabledButton]}
          onPress={handleGetAdvice}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={theme.colors.textPrimary} />
          ) : (
            <Text style={styles.buttonText}>{t('get_advice')}</Text>
          )}
        </TouchableOpacity>

        {error && (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>Error: {error}</Text>
          </View>
        )}
        
        {response && (
          <ScrollView style={{ maxHeight: 300, marginBottom: 20 }}>
            <View style={styles.responseCard}>
              <Text style={styles.responseTextLabel}>{t('ai_advice')}</Text>
              <Text style={[styles.responseText, { textAlign: getTextDirection(response) }]}>{response}</Text>
            </View>
          </ScrollView>
        )}
      </View>

      {/* Large faded logo at the bottom, below Get Advice button */}
      <Image source={require('../../assets/splash.png')} style={styles.bottomFadedLogo} />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  centralLogoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
    marginBottom: 0,
  },
  bigLogo: {
    width: 180,
    height: 180,
    borderRadius: 90,
    alignSelf: 'center',
    marginBottom: 0,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.colors.primary,
    fontFamily: theme.fonts.heading,
    textAlign: 'center',
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 15,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 0,
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
  bottomFadedLogo: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    width: '100%',
    height: 220,
    opacity: 0.08,
    resizeMode: 'contain',
    zIndex: -1,
    alignSelf: 'center',
  },
});

export default HairAIScreen;
