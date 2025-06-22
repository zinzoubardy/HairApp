import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, Platform } from "react-native"; // Added Platform
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons'; // Using Ionicons as suggested
import theme from "../styles/theme.js";
import { useAuth } from "../contexts/AuthContext.js";

const HomeScreen = ({ navigation }) => {
  const { user } = useAuth();

  const features = [
    {
      id: "analyze",
      title: "Analyze Hair",
      description: "Scan your hair with AI",
      icon: "camera-outline", // Changed from ios-scan-circle-outline for a more direct camera feel
      screen: "Upload",
      gradientColors: [theme.colors.primary, theme.colors.accent], // Violet to Magenta
    },
    {
      id: "advisor",
      title: "AI Hair Advisor",
      description: "Get expert hair advice",
      icon: "chatbubbles-outline", // Changed from ios-chatbubbles-outline
      screen: "HairAI",
      gradientColors: [theme.colors.secondary, theme.colors.primary], // Teal to Violet
    },
    {
      id: "profile",
      title: "My Profile",
      description: "View & manage your profile",
      icon: "person-circle-outline", // Changed from ios-person-circle-outline
      screen: "Profile",
      gradientColors: [theme.colors.accent, theme.colors.secondary], // Magenta to Teal
    },
    {
      id: "routines",
      title: "My Routines",
      description: "Manage your haircare routines",
      icon: "leaf-outline", // Changed to user's preference
      screen: "Routine", // Navigate to RoutineScreen
      gradientColors: [theme.colors.primary, theme.colors.secondary], // Violet to Teal
    },
  ];

  // Calculate paddingTop dynamically within the component
  const paddingTop = Platform.OS === 'android'
    ? StatusBar.currentHeight + theme.spacing.md
    : theme.spacing.lg;

  return (
    <ScrollView contentContainerStyle={[styles.container, { paddingTop }]}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Welcome to HairNature AI</Text>
        {user && (
          <Text style={styles.emailText}>
            Logged in as: {user.email}
          </Text>
        )}
      </View>

      <View style={styles.featureGrid}>
        {features.map((feature) => (
          <TouchableOpacity
            key={feature.id}
            style={styles.featureCard}
            onPress={() => navigation.navigate(feature.screen)}
          >
            <LinearGradient
              colors={feature.gradientColors}
              style={styles.cardIconContainer}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name={feature.icon} size={styles.cardIcon.size} color={styles.cardIcon.color} />
            </LinearGradient>
            <Text style={styles.cardTitle}>{feature.title}</Text>
            <Text style={styles.cardDescription}>{feature.description}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.md,
    // paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + theme.spacing.md : theme.spacing.lg, // Adjust for status bar - REMOVED
    paddingBottom: theme.spacing.lg,
  },
  headerContainer: {
    marginBottom: theme.spacing.lg,
    alignItems: 'center',
  },
  title: {
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.title,
    fontSize: theme.fontSizes.xxl, // Larger title
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  emailText: {
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.body,
    fontSize: theme.fontSizes.sm,
    textAlign: 'center',
  },
  featureGrid: {
    // Using column layout for simplicity, cards will stack vertically
  },
  featureCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg, // Increased padding for a more spacious feel
    marginVertical: theme.spacing.md, // Adjusted margin for vertical stacking
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    // Adding subtle shadow as suggested
    shadowColor: theme.colors.primary, // Using primary color for shadow
    shadowOffset: { width: 0, height: 4 }, // Increased shadow offset
    shadowOpacity: 0.3, // Slightly more pronounced shadow
    shadowRadius: 5, // Increased shadow radius
    elevation: 8, // Increased elevation for Android
  },
  cardIconContainer: {
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md, // Rounded corners for the gradient bg
    marginBottom: theme.spacing.md,
    // Making it a circle
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardIcon: { // This is now an object to hold size and color, not a direct style
    size: 40,
    color: theme.colors.card, // Icon color contrast with gradient
  },
  cardTitle: {
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.title,
    fontSize: theme.fontSizes.lg, // Using lg for card titles
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
  },
  cardDescription: {
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.body,
    fontSize: theme.fontSizes.sm, // Smaller size for description
    textAlign: 'center',
  },
});

export default HomeScreen;
