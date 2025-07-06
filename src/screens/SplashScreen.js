import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import theme from '../styles/theme';
import i18n, { setAppLanguage, loadAppLanguage, initializeI18n } from '../i18n';
import { I18nManager } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../contexts/AuthContext';

const SplashScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [isI18nReady, setIsI18nReady] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [languageSelected, setLanguageSelected] = useState(false);
  const [onboardingComplete, setOnboardingComplete] = useState(false);

  const languages = [
    { code: 'en', name: 'ENG', flag: '🇺🇸' },
    { code: 'fr', name: 'FR', flag: '🇫🇷' },
    { code: 'ar', name: 'AR', flag: '🇸🇦' },
  ];

  useEffect(() => {
    const initI18n = async () => {
      try {
        console.log('SplashScreen: Starting i18n initialization');
        await initializeI18n();
        const storedLang = await AsyncStorage.getItem('appLanguage');
        if (storedLang) {
          setSelectedLanguage(storedLang); // Pre-select
          i18n.locale = storedLang; // Set i18n locale
          console.log('SplashScreen: Found stored language:', storedLang);
        } else {
          console.log('SplashScreen: No stored language found');
        }
        setIsI18nReady(true);
        console.log('SplashScreen: i18n initialization complete, isI18nReady set to true');
      } catch (error) {
        console.log('Error initializing i18n:', error);
        setIsI18nReady(true);
      }
    };
    
    initI18n();
  }, []);

  // Check onboarding status when user changes
  useEffect(() => {
    const checkOnboarding = async () => {
      if (user) {
        const onboardingFlag = await AsyncStorage.getItem('onboardingComplete');
        const privacyFlag = await AsyncStorage.getItem('privacyAccepted');
        setOnboardingComplete(onboardingFlag === 'true' && privacyFlag === 'true');
      } else {
        // User is signed out - reset language selection so they can choose again
        setLanguageSelected(false);
        setOnboardingComplete(false);
      }
    };
    checkOnboarding();
  }, [user]);

  // Auto-navigate based on user state and onboarding
  useEffect(() => {
    console.log('SplashScreen navigation useEffect triggered:', {
      isI18nReady,
      languageSelected,
      user: !!user,
      onboardingComplete,
      userEmail: user?.email
    });
    
    if (isI18nReady) {
      const timer = setTimeout(() => {
        console.log('SplashScreen navigation timer fired:', {
          user: !!user,
          onboardingComplete,
          userEmail: user?.email
        });
        
        if (user) {
          // User is signed in - navigate immediately
          if (onboardingComplete) {
            console.log('Navigating to MainTabs');
            navigation.replace('MainTabs');
          } else {
            console.log('Navigating to OnboardingCarousel');
            navigation.replace('OnboardingCarousel');
          }
        } else if (languageSelected) {
          // User is not signed in but has selected language
          console.log('Navigating to Auth');
          navigation.replace('Auth');
        }
        // If user is not signed in and hasn't selected language, stay on splash
      }, 1000); // Show splash for 1 second before navigating

      return () => clearTimeout(timer);
    }
  }, [isI18nReady, languageSelected, user, onboardingComplete, navigation]);

  const handleLanguageSelect = async (lang) => {
    try {
      setSelectedLanguage(lang);
      await setAppLanguage(lang);
      if (lang === 'ar') {
        I18nManager.forceRTL(true);
      } else {
        I18nManager.forceRTL(false);
      }
      setShowLanguageModal(false);
      setLanguageSelected(true); // Show Get Started button after language is picked
      // Don't navigate - stay on splash page with translated content
    } catch (error) {
      console.log('Error selecting language:', error);
    }
  };

  const handleGetStarted = () => {
    setLanguageSelected(true); // Only set to true after user confirms
    // Navigation will be handled by the useEffect above
  };

  // Safe translation function with fallback
  const t = (key) => {
    try {
      return i18n.t(key) || key;
    } catch (error) {
      console.log('Translation error for key:', key, error);
      return key;
    }
  };

  return (
    <View style={styles.container}>
      {/* Central Logo */}
      <View style={styles.centralLogoContainer}>
        <Image source={require('../../assets/splash.png')} style={styles.bigLogo} />
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{t('welcome')}</Text>
        <Text style={styles.subtitle}>
          {languageSelected 
            ? t('hair_description')
            : t('choose_language_to_start')
          }
        </Text>
        {/* Language selection icons below the question */}
        {!languageSelected && (
          <View style={styles.languageRow}>
            {languages.map((language) => (
              <TouchableOpacity
                key={language.code}
                style={[
                  styles.languageOption,
                  selectedLanguage === language.code && styles.selectedLanguage
                ]}
                onPress={() => handleLanguageSelect(language.code)}
              >
                <Text style={styles.languageText}>{language.name}</Text>
                <Text style={styles.languageGlobe}>{'\u{1F310}'}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
      {languageSelected && (
        <TouchableOpacity style={styles.getStartedButton} onPress={handleGetStarted}>
          <Text style={styles.getStartedText}>{t('get_started')}</Text>
        </TouchableOpacity>
      )}
      {/* Remove the colored globe icon from the top right */}
      {/* Minimal Language Selection Modal (keep for later language change) */}
      <Modal
        visible={showLanguageModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowLanguageModal(false)}
        >
          <View style={styles.modalContent}>
            {languages.map((language) => (
              <TouchableOpacity
                key={language.code}
                style={[
                  styles.languageOption,
                  selectedLanguage === language.code && styles.selectedLanguage
                ]}
                onPress={() => handleLanguageSelect(language.code)}
              >
                <Text style={styles.languageGlobe}>{'\u{1F310}'}</Text>
                <Text style={[
                  styles.languageText,
                  selectedLanguage === language.code && styles.selectedLanguageText
                ]}>
                  {language.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  centralLogoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 150,
    marginBottom: 0,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: theme.fontSizes.xxl,
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.title,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.body,
    textAlign: 'center',
    lineHeight: 24,
  },
  getStartedButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.lg,
    paddingVertical: 16,
    paddingHorizontal: 40,
    alignItems: 'center',
    ...theme.shadows.medium,
    borderWidth: 1,
    borderColor: theme.colors.accentGlow,
  },
  getStartedText: {
    color: theme.colors.textPrimary,
    fontSize: theme.fontSizes.lg,
    fontWeight: 'bold',
    fontFamily: theme.fonts.body,
  },
  bigLogo: {
    width: 300,
    height: 300,
    borderRadius: 90,
    alignSelf: 'center',
    marginBottom: 0,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 120,
    paddingRight: 30,
  },
  modalContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    backdropFilter: 'blur(10px)',
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginVertical: 2,
    minWidth: 80,
  },
  selectedLanguage: {
    backgroundColor: theme.colors.accent + '20',
  },
  languageText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  selectedLanguageText: {
    color: theme.colors.accent,
    fontWeight: 'bold',
  },
  languageRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  languageGlobe: {
    fontSize: 20,
    marginLeft: 8,
  },
});

export default SplashScreen; 