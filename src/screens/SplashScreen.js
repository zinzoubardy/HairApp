import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import theme from '../styles/theme';
import i18n, { setAppLanguage, loadAppLanguage, initializeI18n } from '../i18n';
import { I18nManager } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SplashScreen = () => {
  const navigation = useNavigation();
  const [isI18nReady, setIsI18nReady] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [languageSelected, setLanguageSelected] = useState(false);

  const languages = [
    { code: 'en', name: 'ENG', flag: '🇺🇸' },
    { code: 'fr', name: 'FR', flag: '🇫🇷' },
    { code: 'ar', name: 'AR', flag: '🇸🇦' },
  ];

  useEffect(() => {
    const initI18n = async () => {
      try {
        await initializeI18n();
        const storedLang = await AsyncStorage.getItem('appLanguage');
        if (storedLang) {
          setSelectedLanguage(storedLang);
          setLanguageSelected(true);
        }
        setIsI18nReady(true);
      } catch (error) {
        console.log('Error initializing i18n:', error);
        setIsI18nReady(true);
      }
    };
    
    initI18n();
  }, []);

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
      setLanguageSelected(true);
      // Don't navigate - stay on splash page with translated content
    } catch (error) {
      console.log('Error selecting language:', error);
    }
  };

  const handleGetStarted = () => {
    navigation.navigate('Auth');
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
      {/* Globe Icon - Top Right */}
      <TouchableOpacity 
        style={styles.globeButton}
        onPress={() => setShowLanguageModal(true)}
      >
        <Text style={styles.globeIcon}>🌍</Text>
      </TouchableOpacity>

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
      </View>

      {languageSelected && (
        <TouchableOpacity style={styles.getStartedButton} onPress={handleGetStarted}>
          <Text style={styles.getStartedText}>{t('get_started')}</Text>
        </TouchableOpacity>
      )}

      {/* Minimal Language Selection Modal */}
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
                <Text style={styles.languageFlag}>{language.flag}</Text>
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
  globeButton: {
    position: 'absolute',
    top: 60,
    right: 30,
    zIndex: 1000,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  globeIcon: {
    fontSize: 28,
    color: theme.colors.textPrimary,
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
  languageFlag: {
    fontSize: 18,
    marginRight: 8,
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
});

export default SplashScreen; 