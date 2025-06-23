import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import theme from '../styles/theme'; // Assuming your theme file path

const MenuScreen = ({ navigation }) => {
  // Placeholder for menu items
  const menuItems = [
    { id: 'profile', title: 'My Profile', screen: 'Profile' },
    // Add other items like Settings, About, etc. later
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Menu</Text>
      {menuItems.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={styles.menuItem}
          onPress={() => navigation.navigate(item.screen)}
        >
          <Text style={styles.menuItemText}>{item.title}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.lg,
  },
  title: {
    fontSize: theme.fontSizes.title,
    fontFamily: theme.fonts.title,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },
  menuItem: {
    backgroundColor: theme.colors.card,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  menuItemText: {
    fontSize: theme.fontSizes.lg,
    fontFamily: theme.fonts.body,
    color: theme.colors.textPrimary,
  },
});

export default MenuScreen;
