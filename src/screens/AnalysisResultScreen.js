import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert } from "react-native";
import theme from "../styles/theme";
import { getProfile, saveHairAnalysisResult } from "../services/SupabaseService"; // Added saveHairAnalysisResult
import { getHairAnalysis } from "../services/AIService";
import { useAuth } from "../contexts/AuthContext"; // To ensure user is available

const AnalysisResultScreen = ({ navigation }) => { // navigation might be needed for retries or going back
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfileAndAnalyze = async () => {
      if (!user) {
        setError("User not authenticated. Please login.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      setAnalysisResult(null);

      try {
        // 1. Fetch user profile
        const { data: profileData, error: profileError } = await getProfile();

        if (profileError) {
          console.error("Failed to load profile for analysis:", profileError.message);
          setError(`Failed to load your profile: ${profileError.message}. Please try again.`);
          setIsLoading(false);
          return;
        }

        if (!profileData) {
          setError("No profile data found. Please complete your profile first.");
          setIsLoading(false);
          // Optionally navigate to ProfileScreen: navigation.navigate("Profile");
          return;
        }

        // Prepare imageReferences (even if some are empty)
        const imageReferences = {
          up: profileData.profile_pic_up_url,
          right: profileData.profile_pic_right_url,
          left: profileData.profile_pic_left_url,
          back: profileData.profile_pic_back_url,
        };

        // 2. Get AI Hair Analysis
        const { success, data: aiData, error: aiError } = await getHairAnalysis(profileData, imageReferences);

        if (success) {
          setAnalysisResult(aiData);
          // 3. Save the analysis result (fire and forget for now, or handle errors more gracefully)
          const { error: saveError } = await saveHairAnalysisResult(user.id, aiData, imageReferences);
          if (saveError) {
            console.warn("Failed to save hair analysis result to database:", saveError.message);
            // Optionally, inform the user with a non-blocking alert or toast
            // Alert.alert("Save Warning", "Could not save this analysis to your history. The result is still displayed.");
          } else {
            console.log("Hair analysis result saved successfully.");
          }
        } else {
          console.error("AI Analysis Error:", aiError);
          setError(`AI Analysis Failed: ${aiError || "An unknown error occurred."}`);
        }
      } catch (e) {
        console.error("Exception during analysis process:", e);
        setError(`An unexpected error occurred: ${e.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileAndAnalyze();
  }, [user]); // Re-run if user changes (e.g., logs out and in)

  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={{...styles.infoText, marginTop: theme.spacing.md, color: theme.colors.textSecondary}}>
            Generating your hair analysis...
          </Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.centered}>
          <Text style={{...styles.errorText, fontFamily: theme.fonts.body}}>
            Error: {error}
          </Text>
          {/* TODO: Add a retry button? */}
        </View>
      );
    }

    if (analysisResult) {
      // Basic formatting: split by common markdown-like list/section headers
      // More sophisticated rendering (e.g., markdown component) could be used here
      const sections = analysisResult.split(/\n\s*(?=\d\.\s*\*)/); // Split by "1. **..." pattern
      return (
        <View style={styles.contentContainer}>
          {sections.map((section, index) => (
            <View key={index} style={styles.section}>
              <Text style={{...styles.analysisText, fontFamily: theme.fonts.body, color: theme.colors.textPrimary}}>
                {section.trim()}
              </Text>
            </View>
          ))}
        </View>
      );
    }

    return (
      <View style={styles.centered}>
        <Text style={{...styles.infoText, color: theme.colors.textSecondary}}>
          No analysis data available.
        </Text>
      </View>
    );
  };

  return (
    <ScrollView
        style={{backgroundColor: theme.colors.background}}
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
    >
      <Text style={{ ...styles.title, color: theme.colors.textPrimary, fontFamily: theme.fonts.title }}>
        Your AI Hair Analysis
      </Text>
      {renderContent()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    padding: theme.spacing.md,
  },
  centered: { // Used for loading and error states
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing.lg,
  },
  title: {
    fontSize: theme.fontSizes.title,
    marginBottom: theme.spacing.lg,
    textAlign: "center",
  },
  contentContainer: {
    width: "100%",
  },
  section: {
    marginBottom: theme.spacing.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  infoText: {
    fontSize: theme.fontSizes.md,
    textAlign: "center",
    marginBottom: theme.spacing.md,
  },
  errorText: {
    fontSize: theme.fontSizes.md,
    textAlign: "center",
    marginBottom: theme.spacing.md,
    color: theme.colors.error,
  },
  analysisText: {
    fontSize: theme.fontSizes.body,
    lineHeight: theme.fontSizes.body * 1.5,
  }
});

export default AnalysisResultScreen;
