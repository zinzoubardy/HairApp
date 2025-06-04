import React from "react";
import { View, Text, StyleSheet } from "react-native";
import theme from "../styles/theme";

const ProfileScreen = () => {
  return (
    <View style={{ ...styles.container, backgroundColor: theme.colors.background }}>
      <Text style={{ color: theme.colors.textPrimary, fontFamily: theme.fonts.title, fontSize: theme.fontSizes.lg }}>
        User Profile Screen
      </Text>
      <Text style={{ color: theme.colors.textSecondary, fontFamily: theme.fonts.body, fontSize: theme.fontSizes.md, marginTop: theme.spacing.sm}}>
        User settings and preferences will be here.
      </Text>
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
});

export default ProfileScreen;
