import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../styles/theme';

const Logo = ({ size = 'medium', style }) => {
  const getSize = () => {
    switch (size) {
      case 'small':
        return { container: 40, icon: 24, text: 12 };
      case 'large':
        return { container: 120, icon: 60, text: 24 };
      default: // medium
        return { container: 80, icon: 40, text: 16 };
    }
  };

  const sizes = getSize();

  return (
    <View style={[styles.container, { width: sizes.container, height: sizes.container }, style]}>
      <Ionicons 
        name="leaf" 
        size={sizes.icon} 
        color={theme.colors.accent} 
        style={styles.icon}
      />
      <Text style={[styles.text, { fontSize: sizes.text }]}>HairNature</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(244, 162, 97, 0.1)',
    borderRadius: 20,
    ...theme.shadows.glow,
    borderWidth: 2,
    borderColor: theme.colors.accentGlow,
  },
  icon: {
    marginBottom: 4,
  },
  text: {
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.title,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default Logo; 