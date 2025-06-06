import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import theme from "../styles/theme";
import { useAuth } from "../contexts/AuthContext"; // To display user email

const HomeScreen = ({ navigation }) => {
  const { user } = useAuth(); // Get user from auth context

  return (
    <ScrollView contentContainerStyle={{ ...styles.container, backgroundColor: theme.colors.background }}>
      <Text style={{ ...styles.title, color: theme.colors.textPrimary, fontFamily: theme.fonts.title }}>
        Welcome to HairNature AI
      </Text>
      {user && (
        <Text style={{ ...styles.emailText, color: theme.colors.textSecondary, fontFamily: theme.fonts.body }}>
          Logged in as: {user.email}
        </Text>
      )}
      <Text style={{ ...styles.body, color: theme.colors.textSecondary, fontFamily: theme.fonts.body }}>
        Your personal guide to natural hair health and coloring.
      </Text>

      <TouchableOpacity
        style={{ ...styles.button, backgroundColor: theme.colors.primary }}
        onPress={() => navigation.navigate("Upload")}
      >
        <Text style={{ ...styles.buttonText, fontFamily: theme.fonts.body }}>Analyze Hair from Photo</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={{ ...styles.button, backgroundColor: theme.colors.secondary }} // Different color for distinction
        onPress={() => navigation.navigate("HairAI")}
      >
        <Text style={{ ...styles.buttonText, fontFamily: theme.fonts.body }}>AI Hair Advisor</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={{ ...styles.button, backgroundColor: theme.colors.olive }} // Example: another distinct color
        onPress={() => navigation.navigate("Profile")}
      >
        <Text style={{ ...styles.buttonText, fontFamily: theme.fonts.body }}>My Profile</Text>
      </TouchableOpacity>

      {/* Add more buttons here for other screens like RoutineScreen, ColoringAssistantScreen etc. */}
      {/*
      <TouchableOpacity
        style={{ ...styles.button, backgroundColor: theme.colors.roseGold }}
        onPress={() => navigation.navigate("Routine")} // Assuming 'Routine' is a valid screen name
      >
        <Text style={{ ...styles.buttonText, fontFamily: theme.fonts.body }}>My Routines</Text>
      </TouchableOpacity>
      */}

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing.md,
  },
  title: {
    fontSize: theme.fontSizes.title,
    marginBottom: theme.spacing.sm,
    textAlign: "center",
  },
  emailText: {
    fontSize: theme.fontSizes.sm,
    textAlign: "center",
    marginBottom: theme.spacing.md,
    fontStyle: "italic",
  },
  body: {
    fontSize: theme.fontSizes.md,
    textAlign: "center",
    marginBottom: theme.spacing.lg,
  },
  button: {
    paddingVertical: theme.spacing.md, // Increased padding
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginVertical: theme.spacing.sm,
    width: "90%", // Make buttons wider
    minHeight: 50, // Ensure consistent button height
    alignItems: "center",
    justifyContent: "center", // Center text within button
  },
  buttonText: {
    color: theme.colors.card, // Assuming card color is light for good contrast on dark buttons
    fontSize: theme.fontSizes.md,
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default HomeScreen;
