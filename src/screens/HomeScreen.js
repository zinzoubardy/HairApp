import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import theme from "../styles/theme";

const HomeScreen = ({ navigation }) => {
  return (
    <View style={{ ...styles.container, backgroundColor: theme.colors.background }}>
      <Text style={{ ...styles.title, color: theme.colors.textPrimary, fontFamily: theme.fonts.title }}>
        Welcome to HairNature AI
      </Text>
      <Text style={{ ...styles.body, color: theme.colors.textSecondary, fontFamily: theme.fonts.body }}>
        Your personal guide to natural hair health.
      </Text>

      <TouchableOpacity
        style={{ ...styles.button, backgroundColor: theme.colors.primary }}
        onPress={() => navigation.navigate("Upload")}
      >
        <Text style={{ ...styles.buttonText, fontFamily: theme.fonts.body }}>Analyze My Hair</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={{ ...styles.button, backgroundColor: theme.colors.secondary }}
        onPress={() => navigation.navigate("Profile")}
      >
        <Text style={{ ...styles.buttonText, fontFamily: theme.fonts.body }}>Go to Profile</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing.md,
  },
  title: {
    fontSize: theme.fontSizes.title,
    marginBottom: theme.spacing.sm,
    textAlign: "center",
  },
  body: {
    fontSize: theme.fontSizes.md,
    textAlign: "center",
    marginBottom: theme.spacing.lg,
  },
  button: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginVertical: theme.spacing.sm,
    width: "80%",
    alignItems: "center",
  },
  buttonText: {
    color: theme.colors.card,
    fontSize: theme.fontSizes.md,
    fontWeight: "bold",
  },
});

export default HomeScreen;
