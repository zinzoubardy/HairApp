import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import theme from "../styles/theme.js";
import { useAuth } from "../contexts/AuthContext.js"; // To display user email

const HomeScreen = ({ navigation }) => {
  const { user } = useAuth(); // Get user from auth context

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>
        Welcome to HairNature AI
      </Text>
      {user && (
        <Text style={styles.emailText}>
          Logged in as: {user.email}
        </Text>
      )}
      <Text style={styles.body}>
        Your personal guide to natural hair health and coloring.
      </Text>

      <TouchableOpacity
        style={{ ...styles.button, backgroundColor: theme.colors.primary }}
        onPress={() => navigation.navigate("Upload")}
      >
        <Text style={styles.buttonText}>Analyze Hair from Photo</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={{ ...styles.button, backgroundColor: theme.colors.secondary }}
        onPress={() => navigation.navigate("HairAI")}
      >
        <Text style={styles.buttonText}>AI Hair Advisor</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={{ ...styles.button, backgroundColor: theme.colors.accent }}
        onPress={() => navigation.navigate("Profile")}
      >
        <Text style={styles.buttonText}>My Profile</Text>
      </TouchableOpacity>

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background, // Added background color
  },
  title: {
    fontSize: theme.fontSizes.title,
    marginBottom: theme.spacing.sm,
    textAlign: "center",
    color: theme.colors.textPrimary, // Added text color
    fontFamily: theme.fonts.title, // Added font family
  },
  emailText: {
    fontSize: theme.fontSizes.sm,
    textAlign: "center",
    marginBottom: theme.spacing.md,
    fontStyle: "italic",
    color: theme.colors.textSecondary, // Added text color
    fontFamily: theme.fonts.body, // Added font family
  },
  body: {
    fontSize: theme.fontSizes.md,
    textAlign: "center",
    marginBottom: theme.spacing.lg,
    color: theme.colors.textSecondary, // Added text color
    fontFamily: theme.fonts.body, // Added font family
  },
  button: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginVertical: theme.spacing.sm,
    width: "90%",
    minHeight: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: theme.colors.background, // Changed to background color for high contrast
    fontSize: theme.fontSizes.md,
    fontWeight: "bold",
    textAlign: "center",
    fontFamily: theme.fonts.body, // Added font family
  },
});

export default HomeScreen;
