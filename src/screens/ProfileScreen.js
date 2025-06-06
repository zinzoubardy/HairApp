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
// AsyncStorage is no longer primarily used for profile data, but could be a fallback or for other settings.
// import AsyncStorage from "@react-native-async-storage/async-storage";
import theme from "../styles/theme";
import { useAuth } from "../contexts/AuthContext";
import { getProfile, updateProfile } from "../services/SupabaseService"; // Import Supabase helpers

// const PROFILE_DATA_KEY = "@HairNatureAI_ProfileData"; // Keep for potential local-only settings or fallback

const ProfileScreen = ({ navigation }) => {
  const { user, signOut, loadingAuthAction } = useAuth();
  const [name, setName] = useState("");
  const [hairGoal, setHairGoal] = useState("");
  const [allergies, setAllergies] = useState("");

  const [isLoading, setIsLoading] = useState(false); // For initial data load from Supabase
  const [isSaving, setIsSaving] = useState(false);  // For saving data to Supabase

  useEffect(() => {
    const loadProfileData = async () => {
      if (!user) return; // Don't attempt to load if user is not logged in

      setIsLoading(true);
      try {
        const { data: profileData, error } = await getProfile();
        if (error) {
          // Alert.alert("Error", "Could not load your profile data from the server.");
          console.warn("Failed to load profile from Supabase:", error.message);
          // Potentially fall back to AsyncStorage or inform user
        }
        if (profileData) {
          setName(profileData.name || "");
          setHairGoal(profileData.hair_goal || "");
          setAllergies(profileData.allergies || "");
        } else {
          // No profile data found on server, could be a new user post-trigger or trigger failed.
          // Initialize with empty strings or load from a local cache if desired.
          console.log("No profile data found on server for user:", user.id);
          setName("");
          setHairGoal("");
          setAllergies("");
        }
      } catch (e) { // Catch any other exceptions
        console.error("Exception during loadProfileData:", e);
        Alert.alert("Error", "An unexpected error occurred while loading your profile.");
      } finally {
        setIsLoading(false);
      }
    };

    loadProfileData();
  }, [user]); // Depend on user object to re-load if user changes

  const handleSaveProfile = async () => {
    if (!user) {
      Alert.alert("Not Logged In", "You must be logged in to save your profile.");
      return;
    }

    const profileDetails = {
      name,
      hair_goal: hairGoal, // Ensure snake_case for Supabase column
      allergies,
    };

    setIsSaving(true);
    try {
      const { data, error } = await updateProfile(profileDetails);
      if (error) {
        Alert.alert("Save Error", `Could not save your profile: ${error.message}`);
      } else {
        Alert.alert("Profile Saved", "Your profile has been successfully saved to the server!");
        if (data) { // Update local state with any transformations from Supabase (e.g. default values)
            setName(data.name || "");
            setHairGoal(data.hair_goal || "");
            setAllergies(data.allergies || "");
        }
      }
    } catch (e) { // Catch any other exceptions
        console.error("Exception during handleSaveProfile:", e);
        Alert.alert("Error", "An unexpected error occurred while saving your profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      Alert.alert("Sign Out Error", error.message);
    }
    // Navigation to AuthScreen will be handled by onAuthStateChange
  };

  if (isLoading && !user) { // Show nothing or a generic loading if user isn't available yet during initial auth check
    return (
        <View style={{...styles.container, justifyContent: "center", alignItems: "center", backgroundColor: theme.colors.background}}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
    );
  }

  if (isLoading && user) { // Show profile specific loading only when user is confirmed and we are fetching their profile
    return (
      <View style={{...styles.container, justifyContent: "center", alignItems: "center", backgroundColor: theme.colors.background}}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={{marginTop: theme.spacing.md, fontFamily: theme.fonts.body, color: theme.colors.textPrimary}}>Loading Your Profile...</Text>
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
          Manage your hair details and preferences.
        </Text>

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
          disabled={isSaving || loadingAuthAction || !user} // Disable if not logged in
        >
          {isSaving ? (
            <ActivityIndicator size="small" color={theme.colors.textPrimary} />
          ) : (
            <Text style={{...styles.buttonText, fontFamily: theme.fonts.body}}>Save Profile</Text>
          )}
        </TouchableOpacity>

        {user && (
          <TouchableOpacity
            style={{...styles.button, backgroundColor: loadingAuthAction ? theme.colors.border : theme.colors.error, marginTop: theme.spacing.lg}}
            onPress={handleSignOut}
            disabled={loadingAuthAction}
          >
            {loadingAuthAction && !isSaving ? (
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
    marginBottom: theme.spacing.md,
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
    marginTop: theme.spacing.sm,
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
