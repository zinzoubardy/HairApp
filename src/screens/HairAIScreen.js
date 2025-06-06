import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform
} from "react-native";
import theme from "../styles/theme";
import { getAIHairAdvice } from "../services/AIService"; // Import the AI service

const HairAIScreen = () => {
  const [prompt, setPrompt] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [isLoadingAI, setIsLoadingAI] = useState(false);

  const handleSubmitPrompt = async () => {
    if (prompt.trim() === "") {
      Alert.alert("Empty Prompt", "Please enter your hair question or concern.");
      return;
    }

    setIsLoadingAI(true);
    setAiResponse(""); // Clear previous response

    try {
      const { aiResponse: responseData, error } = await getAIHairAdvice(prompt);
      if (error) {
        Alert.alert("AI Error", `Failed to get advice: ${error}`);
        setAiResponse(`Error: ${error}`);
      } else if (responseData) {
        setAiResponse(responseData);
      } else {
        setAiResponse("No response received from the AI.");
      }
    } catch (e) {
      Alert.alert("Request Failed", "An unexpected error occurred while contacting the AI service.");
      setAiResponse("Error: An unexpected error occurred.");
      console.error("handleSubmitPrompt exception:", e);
    } finally {
      setIsLoadingAI(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, backgroundColor: theme.colors.background }}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={{ ...styles.title, color: theme.colors.textPrimary, fontFamily: theme.fonts.title }}>
          AI Hair Advisor
        </Text>
        <Text style={{ ...styles.subtitle, color: theme.colors.textSecondary, fontFamily: theme.fonts.body }}>
          Ask a question about your hair, and our AI will try to help!
        </Text>

        <View style={styles.inputContainer}>
          <TextInput
            style={{ ...styles.input, fontFamily: theme.fonts.body, color: theme.colors.textPrimary }}
            placeholder="e.g., What are natural remedies for oily hair?"
            placeholderTextColor={theme.colors.textSecondary}
            value={prompt}
            onChangeText={setPrompt}
            multiline
            numberOfLines={3} // Start with a decent height
            returnKeyType="default" // Or "done" if you prefer direct submission
            editable={!isLoadingAI}
          />
          <TouchableOpacity
            style={{ ...styles.button, backgroundColor: isLoadingAI ? theme.colors.border : theme.colors.primary }}
            onPress={handleSubmitPrompt}
            disabled={isLoadingAI}
          >
            {isLoadingAI ? (
              <ActivityIndicator size="small" color={theme.colors.card} />
            ) : (
              <Text style={{ ...styles.buttonText, fontFamily: theme.fonts.body }}>Get AI Advice</Text>
            )}
          </TouchableOpacity>
        </View>

        { (isLoadingAI || aiResponse) && ( // Show this section if loading or if there is a response
          <View style={styles.responseContainer}>
            {isLoadingAI && !aiResponse ? ( // Show loading only if there is no response yet
              <View style={styles.loadingIndicatorContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={{...styles.loadingText, fontFamily: theme.fonts.body, color: theme.colors.textSecondary}}>
                  AI is thinking...
                </Text>
              </View>
            ) : aiResponse ? ( // Only show response if it exists
              <>
                <Text style={{ ...styles.responseTitle, color: theme.colors.textPrimary, fontFamily: theme.fonts.title }}>
                  AI Suggestion:
                </Text>
                <ScrollView style={styles.responseScrollView}>
                  <Text style={{ ...styles.responseText, fontFamily: theme.fonts.body, color: theme.colors.textPrimary }}>
                    {aiResponse}
                  </Text>
                </ScrollView>
              </>
            ) : null}
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: theme.spacing.md,
  },
  title: {
    fontSize: theme.fontSizes.title,
    textAlign: "center",
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: theme.fontSizes.md,
    textAlign: "center",
    marginBottom: theme.spacing.lg,
  },
  inputContainer: {
    marginBottom: theme.spacing.lg,
  },
  input: {
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    fontSize: theme.fontSizes.md,
    minHeight: 80, // For multiline
    textAlignVertical: "top",
    marginBottom: theme.spacing.md,
  },
  button: {
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 50,
  },
  buttonText: {
    color: theme.colors.card,
    fontSize: theme.fontSizes.md,
    fontWeight: "bold",
  },
  responseContainer: {
    marginTop: theme.spacing.lg,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    minHeight: 100, // Ensure it has some height even when loading
  },
  loadingIndicatorContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing.md,
  },
  loadingText: {
    marginTop: theme.spacing.sm,
    fontSize: theme.fontSizes.sm,
  },
  responseTitle: {
    fontSize: theme.fontSizes.lg,
    marginBottom: theme.spacing.sm,
    fontWeight: "600",
  },
  responseScrollView: {
    maxHeight: 300, // Limit height for scrollability
  },
  responseText: {
    fontSize: theme.fontSizes.md,
    lineHeight: theme.fontSizes.md * 1.5, // Better readability
  },
});

export default HairAIScreen;
