import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import theme from "../styles/theme";
import { useAuth } from "../contexts/AuthContext"; // Import useAuth

const PROFILE_DATA_KEY = "@HairNatureAI_ProfileData";

const ProfileScreen = ({ navigation }) => {
  const { user, signOut, loadingAuthAction } = useAuth(); // Get user and signOut from context
  const [name, setName] = useState("");
  const [hairGoal, setHairGoal] = useState("");
  const [allergies, setAllergies] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadProfileData = async () => {
      setIsLoading(true);
      try {
        // TODO: In the future, load profile data from Supabase if user is logged in
        // For now, continue using AsyncStorage for simplicity until profile migration
        const storedData = await AsyncStorage.getItem(PROFILE_DATA_KEY);
        if (storedData !== null) {
          const parsedData = JSON.parse(storedData);
          setName(parsedData.name || "");
          setHairGoal(parsedData.hairGoal || "");
          setAllergies(parsedData.allergies || "");
        }
      } catch (error) {
        console.error("Failed to load profile data:", error);
        Alert.alert("Error", "Could not load your profile data.");
      } finally {
        setIsLoading(false);
      }
    };

    loadProfileData();
  }, []); // Removed user from dependency array to keep loading from AsyncStorage for now

  const handleSaveProfile = async () => {
    const profileData = {
      name,
      hairGoal,
      allergies,
    };
    setIsSaving(true);
    try {
      // TODO: In the future, save profile data to Supabase if user is logged in
      await AsyncStorage.setItem(PROFILE_DATA_KEY, JSON.stringify(profileData));
      Alert.alert("Profile Saved", "Your profile has been successfully saved locally!");
    } catch (error) {
      console.error("Failed to save profile data:", error);
      Alert.alert("Error", "Could not save your profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      Alert.alert("Sign Out Error", error.message);
    }
    // Navigation to AuthScreen will be handled by onAuthStateChange in AuthContext
    // and the conditional rendering in App.tsx
  };

  if (isLoading) {
    return (
      <View style={{...styles.container, justifyContent: "center", alignItems: "center", backgroundColor: theme.colors.background}}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={{marginTop: theme.spacing.md, fontFamily: theme.fonts.body, color: theme.colors.textPrimary}}>Loading Profile...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{flex: 1, backgroundColor: theme.colors.background}}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={{ ...styles.title, color: theme.colors.textPrimary, fontFamily: theme.fonts.title }}>
          Your Profile
        </Text>

        {user && (
          <Text style={{...styles.emailText, fontFamily: theme.fonts.body, color: theme.colors.textSecondary}}>
            Logged in as: {user.email}
          </Text>
        )}

        <Text style={{ ...styles.subtitle, color: theme.colors.textSecondary, fontFamily: theme.fonts.body }}>
          Tell us a bit about yourself and your hair (stored locally).
        </Text>

        {/* Input fields remain the same as before */}
        <View style={styles.inputGroup}>
          <Text style={{...styles.label, fontFamily: theme.fonts.body, color: theme.colors.textPrimary}}>Name (Optional)</Text>
          <TextInput
            style={{...styles.input, fontFamily: theme.fonts.body, color: theme.colors.textPrimary}}
            placeholder="Enter your name"
            placeholderTextColor={theme.colors.textSecondary}
            value={name}
            onChangeText={setName}
            returnKeyType="next"
            editable={!isSaving && !loadingAuthAction}
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={{...styles.label, fontFamily: theme.fonts.body, color: theme.colors.textPrimary}}>Primary Hair Goal</Text>
          <TextInput
            style={{...styles.input, fontFamily: theme.fonts.body, color: theme.colors.textPrimary}}
            placeholder="e.g., Reduce dryness, add volume"
            placeholderTextColor={theme.colors.textSecondary}
            value={hairGoal}
            onChangeText={setHairGoal}
            returnKeyType="next"
            editable={!isSaving && !loadingAuthAction}
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={{...styles.label, fontFamily: theme.fonts.body, color: theme.colors.textPrimary}}>Known Allergies/Sensitivities</Text>
          <TextInput
            style={{...styles.input, ...styles.textArea, fontFamily: theme.fonts.body, color: theme.colors.textPrimary}}
            placeholder="e.g., Aloe vera, specific essential oils (comma-separated)"
            placeholderTextColor={theme.colors.textSecondary}
            value={allergies}
            onChangeText={setAllergies}
            multiline
            numberOfLines={3}
            returnKeyType="done"
            editable={!isSaving && !loadingAuthAction}
          />
        </View>

        <TouchableOpacity
          style={{...styles.button, backgroundColor: isSaving || loadingAuthAction ? theme.colors.border : theme.colors.primary}}
          onPress={handleSaveProfile}
          disabled={isSaving || loadingAuthAction}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color={theme.colors.textPrimary} />
          ) : (
            <Text style={{...styles.buttonText, fontFamily: theme.fonts.body}}>Save Profile (Local)</Text>
          )}
        </TouchableOpacity>

        {user && (
          <TouchableOpacity
            style={{...styles.button, backgroundColor: loadingAuthAction ? theme.colors.border : theme.colors.error, marginTop: theme.spacing.lg}}
            onPress={handleSignOut}
            disabled={loadingAuthAction}
          >
            {loadingAuthAction && !isSaving /* Corrected logic for sign out button loading state */ ? (
              <ActivityIndicator size="small" color={theme.colors.card} />
            ) : (
              <Text style={{...styles.buttonText, fontFamily: theme.fonts.body}}>Sign Out</Text>
            )}
          </TouchableOpacity>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: theme.spacing.lg,
  },
  title: {
    fontSize: theme.fontSizes.title,
    marginBottom: theme.spacing.sm,
    textAlign: "center",
  },
  subtitle: {
    fontSize: theme.fontSizes.md,
    textAlign: "center",
    marginBottom: theme.spacing.md, // Adjusted margin
  },
  emailText: {
    fontSize: theme.fontSizes.sm,
    textAlign: "center",
    marginBottom: theme.spacing.xl,
    fontStyle: "italic",
  },
  inputGroup: {
    marginBottom: theme.spacing.md,
  },
  label: {
    fontSize: theme.fontSizes.sm,
    marginBottom: theme.spacing.xs,
    fontWeight: "bold",
  },
  input: {
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm + 2,
    fontSize: theme.fontSizes.md,
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  button: {
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: "center",
    marginTop: theme.spacing.sm, // Default margin
    minHeight: 50,
    justifyContent: "center",
  },
  buttonText: {
    color: theme.colors.card,
    fontSize: theme.fontSizes.md,
    fontWeight: "bold",
  },
});

export default ProfileScreen;
