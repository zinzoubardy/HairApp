import React from "react";
import { View, Text, StyleSheet, Image, ScrollView } from "react-native";
import theme from "../styles/theme";

const AnalysisResultScreen = ({ route }) => {
  // Extract imageUri from route params, passed from UploadScreen
  const { imageUri } = route.params || {};

  return (
    <ScrollView style={{backgroundColor: theme.colors.background}} contentContainerStyle={styles.container}>
      <Text style={{ ...styles.title, color: theme.colors.textPrimary, fontFamily: theme.fonts.title }}>
        Hair Analysis Result
      </Text>

      {imageUri ? (
        <View style={styles.contentContainer}>
          <Text style={{ ...styles.infoText, fontFamily: theme.fonts.body }}>
            Analysis for the selected image:
          </Text>
          <Image source={{ uri: imageUri }} style={styles.previewImage} />
          <Text style={{ ...styles.uriText, fontFamily: theme.fonts.body, color: theme.colors.textSecondary }}>
            URI: {imageUri}
          </Text>
          <Text style={{ ...styles.placeholderText, fontFamily: theme.fonts.body, color: theme.colors.textPrimary, marginTop: theme.spacing.lg }}>
            (AI analysis results will appear here in a future update.)
          </Text>
        </View>
      ) : (
        <Text style={{ ...styles.infoText, fontFamily: theme.fonts.body, color: theme.colors.error }}>
          No image was provided for analysis. Please go back and select an image.
        </Text>
      )}
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
    marginBottom: theme.spacing.lg,
    textAlign: "center",
  },
  contentContainer: {
    alignItems: "center",
    width: "100%",
  },
  infoText: {
    fontSize: theme.fontSizes.md,
    textAlign: "center",
    marginBottom: theme.spacing.md,
  },
  previewImage: {
    width: 200, // Smaller thumbnail size
    height: 200 * (3/4), // Maintain 4:3 aspect ratio
    resizeMode: "contain",
    borderRadius: theme.borderRadius.sm,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  uriText: {
    fontSize: theme.fontSizes.xs,
    textAlign: "center",
    marginVertical: theme.spacing.sm,
    fontStyle: "italic",
  },
  placeholderText: {
    fontSize: theme.fontSizes.md,
    textAlign: "center",
    marginVertical: theme.spacing.md,
    color: theme.colors.textSecondary,
  }
});

export default AnalysisResultScreen;
