import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import theme from '../styles/theme';

const SplashScreen = () => {
  const navigation = useNavigation();

  const handleGetStarted = () => {
    navigation.navigate('Auth');
  };

  return (
    <View style={styles.container}>
      <View style={styles.centralLogoContainer}>
        <Image source={require('../../assets/splash.png')} style={styles.bigLogo} />
      </View>
      
      <View style={styles.content}>
        <Text style={styles.title}>Welcome to Root & Glow</Text>
        <Text style={styles.subtitle}>
          Discover your hair's natural potential with AI-powered analysis and personalized recommendations
        </Text>
      </View>

      <TouchableOpacity style={styles.getStartedButton} onPress={handleGetStarted}>
        <Text style={styles.getStartedText}>Get Started</Text>
      </TouchableOpacity>
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
  centralLogoLarge: {
    width: 240,
    height: 240,
    borderRadius: 90,
    alignSelf: 'center',
    marginBottom: 24,
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
});

export default SplashScreen; 