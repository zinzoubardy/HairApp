import * as Localization from 'expo-localization';
import { I18n } from 'i18n-js';
import en from './en';
import fr from './fr';
import ar from './ar';
import { useState, useEffect } from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';

// Create i18n instance
const i18n = new I18n({
  en,
  fr,
  ar,
});

// Configure i18n
i18n.defaultLocale = 'en';
i18n.locale = Localization.locale.split('-')[0];
i18n.enableFallback = true;

// Initialize with fallback handling
export const initializeI18n = async () => {
  try {
    const storedLang = await AsyncStorage.getItem('appLanguage');
    if (storedLang && ['en', 'fr', 'ar'].includes(storedLang)) {
      i18n.locale = storedLang;
    } else {
      i18n.locale = Localization.locale.split('-')[0];
    }
  } catch (error) {
    console.log('Error initializing i18n:', error);
    i18n.locale = 'en'; // Fallback to English
  }
};

export const setAppLanguage = async (lang) => {
  try {
    if (['en', 'fr', 'ar'].includes(lang)) {
      i18n.locale = lang;
      await AsyncStorage.setItem('appLanguage', lang);
    }
  } catch (error) {
    console.log('Error setting app language:', error);
  }
};

export const loadAppLanguage = async () => {
  try {
    const storedLang = await AsyncStorage.getItem('appLanguage');
    if (storedLang && ['en', 'fr', 'ar'].includes(storedLang)) {
      i18n.locale = storedLang;
    } else {
      i18n.locale = Localization.locale.split('-')[0];
    }
  } catch (error) {
    console.log('Error loading app language:', error);
    i18n.locale = 'en'; // Fallback to English
  }
};

// Safe translation function
export const t = (key) => {
  try {
    return i18n.t(key) || key;
  } catch (error) {
    console.log('Translation error for key:', key, error);
    return key;
  }
};

// React hook for translations
export const useTranslation = () => {
  const [currentLocale, setCurrentLocale] = useState(i18n.locale);

  useEffect(() => {
    const checkLanguage = async () => {
      try {
        const storedLang = await AsyncStorage.getItem('appLanguage');
        if (storedLang && ['en', 'fr', 'ar'].includes(storedLang)) {
          i18n.locale = storedLang;
          setCurrentLocale(storedLang);
        }
      } catch (error) {
        console.log('Error checking language:', error);
      }
    };
    
    checkLanguage();
  }, []);

  const translate = (key) => {
    try {
      return i18n.t(key) || key;
    } catch (error) {
      console.log('Translation error for key:', key, error);
      return key;
    }
  };

  return { t: translate, locale: currentLocale };
};

export default i18n; 