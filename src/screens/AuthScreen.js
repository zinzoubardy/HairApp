import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Image
} from "react-native";
import theme from "../styles/theme";
import { useAuth } from "../contexts/AuthContext";
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from '../i18n';

const AuthScreen = () => {
  const { signUp, signIn, loadingAuthAction } = useAuth(); // Use the context
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const navigation = useNavigation();
  const { t } = useTranslation();

  console.log('DEBUG: signIn from useAuth:', signIn, typeof signIn);

  const handleAuthAction = async () => {
    console.log('handleAuthAction called');
    console.log('Email:', email);
    console.log('Password length:', password.length);
    console.log('isSignUpMode:', isSignUpMode);
    console.log('signIn function:', signIn);
    console.log('signIn.toString():', signIn.toString());
    if (!email || !password) {
      Alert.alert(t('fill_all_fields'));
      return;
    }
    try {
      if (isSignUpMode) {
        console.log('Attempting sign up...');
        await signUp(email, password);
      } else {
        console.log('Attempting sign in...');
        await signIn(email, password);
      }
    } catch (error) {
      Alert.alert(t('error'), error.message || t('system_error'));
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.outerContainer}
    >
      <View style={styles.container}>
        <View style={styles.logoContainer}>
          <Image 
            source={require('../../assets/splash.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.title}>
          {isSignUpMode ? t('create_account') : t('welcome_back')}
        </Text>
        <Text style={styles.subtitle}>
          {isSignUpMode ? "Join Root & Glow today!" : "Sign in to continue."}
        </Text>

        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, {textAlign: 'left', writingDirection: 'ltr'}]}
              placeholder={t('email')}
              placeholderTextColor={theme.colors.textSecondary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              returnKeyType="next"
              editable={!loadingAuthAction}
            />
          </View>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder={t('password')}
              placeholderTextColor={theme.colors.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              returnKeyType="done"
              editable={!loadingAuthAction}
              onSubmitEditing={handleAuthAction}
            />
          </View>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => {
              console.log("Button pressed!");
              handleAuthAction();
            }}
            disabled={loadingAuthAction}
          >
            {loadingAuthAction ? (
              <ActivityIndicator size="small" color={theme.colors.textPrimary} />
            ) : (
              <Text style={styles.primaryButtonText}>
                {isSignUpMode ? t('sign_up') : t('sign_in')}
              </Text>
            )}
          </TouchableOpacity>

          <View style={styles.toggleContainer}>
            <Text style={styles.toggleText}>
              {isSignUpMode ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
            </Text>
            <TouchableOpacity
              style={styles.toggleButton}
              onPress={() => setIsSignUpMode(!isSignUpMode)}
              disabled={loadingAuthAction}
            >
              <Text style={styles.toggleButtonText}>
                {isSignUpMode ? t('sign_in') : t('sign_up')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.glow,
  },
  title: {
    fontSize: theme.fontSizes.xxl,
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.title,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.body,
    textAlign: 'center',
    marginBottom: 40,
  },
  formContainer: {
    width: '100%',
    maxWidth: 320,
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: theme.fontSizes.md,
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.body,
    borderWidth: 1,
    borderColor: theme.colors.accentGlow,
    ...theme.shadows.soft,
  },
  inputFocused: {
    borderColor: theme.colors.accent,
    ...theme.shadows.medium,
  },
  inputError: {
    borderColor: theme.colors.error,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: theme.fontSizes.sm,
    fontFamily: theme.fonts.body,
    marginTop: 4,
    marginLeft: 4,
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.lg,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginBottom: 16,
    ...theme.shadows.medium,
    borderWidth: 1,
    borderColor: theme.colors.accentGlow,
  },
  primaryButtonText: {
    color: theme.colors.textPrimary,
    fontSize: theme.fontSizes.md,
    fontWeight: 'bold',
    fontFamily: theme.fonts.body,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderRadius: theme.borderRadius.lg,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: theme.colors.accent,
    ...theme.shadows.soft,
  },
  secondaryButtonText: {
    color: theme.colors.accent,
    fontSize: theme.fontSizes.md,
    fontWeight: 'bold',
    fontFamily: theme.fonts.body,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.border,
  },
  dividerText: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSizes.sm,
    fontFamily: theme.fonts.body,
    marginHorizontal: 16,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.accentGlow,
    ...theme.shadows.soft,
  },
  socialButtonText: {
    color: theme.colors.textPrimary,
    fontSize: theme.fontSizes.md,
    fontWeight: '600',
    fontFamily: theme.fonts.body,
    marginLeft: 12,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  toggleText: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSizes.md,
    fontFamily: theme.fonts.body,
  },
  toggleButton: {
    marginLeft: 8,
  },
  toggleButtonText: {
    color: theme.colors.accent,
    fontSize: theme.fontSizes.md,
    fontWeight: 'bold',
    fontFamily: theme.fonts.body,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(26, 28, 29, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingText: {
    color: theme.colors.textPrimary,
    fontSize: theme.fontSizes.md,
    fontFamily: theme.fonts.body,
    marginTop: 16,
  },
});

export default AuthScreen;
