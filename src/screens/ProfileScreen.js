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
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [hairGoal, setHairGoal] = useState("");
  const [allergies, setAllergies] = useState("");
  // New state for additional hair details
  const [hairColor, setHairColor] = useState("");
  const [hairCondition, setHairCondition] = useState("");
  const [hairConcernsPreferences, setHairConcernsPreferences] = useState("");
  // States for image URLs (will be simple text inputs for now)
  const [profilePicUpUrl, setProfilePicUpUrl] = useState("");
  const [profilePicRightUrl, setProfilePicRightUrl] = useState("");
  const [profilePicLeftUrl, setProfilePicLeftUrl] = useState("");
  const [profilePicBackUrl, setProfilePicBackUrl] = useState("");

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
          setFullName(profileData.full_name || "");
          setUsername(profileData.username || "");
          setHairGoal(profileData.hair_goal || "");
          setAllergies(profileData.allergies || "");
          // Load new fields
          setHairColor(profileData.hair_color || "");
          setHairCondition(profileData.hair_condition || "");
          setHairConcernsPreferences(profileData.hair_concerns_preferences || "");
          setProfilePicUpUrl(profileData.profile_pic_up_url || "");
          setProfilePicRightUrl(profileData.profile_pic_right_url || "");
          setProfilePicLeftUrl(profileData.profile_pic_left_url || "");
          setProfilePicBackUrl(profileData.profile_pic_back_url || "");
        } else {
          // No profile data found on server, could be a new user post-trigger or trigger failed.
          // Initialize with empty strings or load from a local cache if desired.
          console.log("No profile data found on server for user:", user.id);
          setFullName("");
          setUsername("");
          setHairGoal("");
          setAllergies("");
          // Initialize new fields
          setHairColor("");
          setHairCondition("");
          setHairConcernsPreferences("");
          setProfilePicUpUrl("");
          setProfilePicRightUrl("");
          setProfilePicLeftUrl("");
          setProfilePicBackUrl("");
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
      full_name: fullName,
      username: username,
      hair_goal: hairGoal,
      allergies,
      // Add new fields to save
      hair_color: hairColor,
      hair_condition: hairCondition,
      hair_concerns_preferences: hairConcernsPreferences,
      profile_pic_up_url: profilePicUpUrl,
      profile_pic_right_url: profilePicRightUrl,
      profile_pic_left_url: profilePicLeftUrl,
      profile_pic_back_url: profilePicBackUrl,
    };

    setIsSaving(true);
    try {
      const { data, error } = await updateProfile(profileDetails);
      if (error) {
        Alert.alert("Save Error", `Could not save your profile: ${error.message}`);
      } else {
        Alert.alert("Profile Saved", "Your profile has been successfully saved to the server!");
        if (data) { // Update local state with any transformations from Supabase (e.g. default values)
            setFullName(data.full_name || "");
            setUsername(data.username || "");
            setHairGoal(data.hair_goal || "");
            setAllergies(data.allergies || "");
            // Update state for new fields from server response
            setHairColor(data.hair_color || "");
            setHairCondition(data.hair_condition || "");
            setHairConcernsPreferences(data.hair_concerns_preferences || "");
            setProfilePicUpUrl(data.profile_pic_up_url || "");
            setProfilePicRightUrl(data.profile_pic_right_url || "");
            setProfilePicLeftUrl(data.profile_pic_left_url || "");
            setProfilePicBackUrl(data.profile_pic_back_url || "");
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
          <Text style={{...styles.label, fontFamily: theme.fonts.body, color: theme.colors.textPrimary}}>Username</Text>
          <TextInput
            style={{...styles.input, fontFamily: theme.fonts.body, color: theme.colors.textSecondary, backgroundColor: theme.colors.background}} // Make it look non-editable
            value={username}
            editable={false} // Username is typically not changed here
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={{...styles.label, fontFamily: theme.fonts.body, color: theme.colors.textPrimary}}>Full Name (Optional)</Text>
          <TextInput
            style={{...styles.input, fontFamily: theme.fonts.body, color: theme.colors.textPrimary}}
            placeholder="Enter your full name"
            placeholderTextColor={theme.colors.textSecondary}
            value={fullName}
            onChangeText={setFullName}
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

        {/* New Hair Information Fields */}
        <View style={styles.sectionTitleContainer}>
          <Text style={{...styles.sectionTitle, color: theme.colors.textPrimary, fontFamily: theme.fonts.title }}>Detailed Hair Information</Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={{...styles.label, fontFamily: theme.fonts.body, color: theme.colors.textPrimary}}>Hair Color</Text>
          <TextInput
            style={{...styles.input, fontFamily: theme.fonts.body, color: theme.colors.textPrimary}}
            placeholder="e.g., Dark Brown, Blonde with highlights"
            placeholderTextColor={theme.colors.textSecondary}
            value={hairColor}
            onChangeText={setHairColor}
            returnKeyType="next"
            editable={!isSaving && !loadingAuthAction}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={{...styles.label, fontFamily: theme.fonts.body, color: theme.colors.textPrimary}}>Hair Condition</Text>
          <TextInput
            style={{...styles.input, fontFamily: theme.fonts.body, color: theme.colors.textPrimary}}
            placeholder="e.g., Dry, Oily, Healthy, Damaged ends"
            placeholderTextColor={theme.colors.textSecondary}
            value={hairCondition}
            onChangeText={setHairCondition}
            returnKeyType="next"
            editable={!isSaving && !loadingAuthAction}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={{...styles.label, fontFamily: theme.fonts.body, color: theme.colors.textPrimary}}>Hair Concerns & Preferences</Text>
          <TextInput
            style={{...styles.input, ...styles.textArea, fontFamily: theme.fonts.body, color: theme.colors.textPrimary}}
            placeholder="e.g., Frizz control, prefer wash-n-go styles, want more volume"
            placeholderTextColor={theme.colors.textSecondary}
            value={hairConcernsPreferences}
            onChangeText={setHairConcernsPreferences}
            multiline
            numberOfLines={3}
            returnKeyType="done"
            editable={!isSaving && !loadingAuthAction}
          />
        </View>

        {/* Placeholder for Image URL Inputs - Actual upload UI will be more complex */}
        <View style={styles.sectionTitleContainer}>
          <Text style={{...styles.sectionTitle, color: theme.colors.textPrimary, fontFamily: theme.fonts.title }}>Profile Image URLs (Temporary)</Text>
        </View>
        <View style={styles.inputGroup}>
            <Text style={{...styles.label, fontFamily: theme.fonts.body, color: theme.colors.textPrimary}}>Picture URL (Up)</Text>
            <TextInput style={{...styles.input, fontFamily: theme.fonts.body, color: theme.colors.textPrimary}} value={profilePicUpUrl} onChangeText={setProfilePicUpUrl} placeholder="URL for 'up' angle picture" placeholderTextColor={theme.colors.textSecondary} editable={!isSaving && !loadingAuthAction} />
        </View>
        <View style={styles.inputGroup}>
            <Text style={{...styles.label, fontFamily: theme.fonts.body, color: theme.colors.textPrimary}}>Picture URL (Right Side)</Text>
            <TextInput style={{...styles.input, fontFamily: theme.fonts.body, color: theme.colors.textPrimary}} value={profilePicRightUrl} onChangeText={setProfilePicRightUrl} placeholder="URL for 'right side' angle picture" placeholderTextColor={theme.colors.textSecondary} editable={!isSaving && !loadingAuthAction} />
        </View>
        <View style={styles.inputGroup}>
            <Text style={{...styles.label, fontFamily: theme.fonts.body, color: theme.colors.textPrimary}}>Picture URL (Left Side)</Text>
            <TextInput style={{...styles.input, fontFamily: theme.fonts.body, color: theme.colors.textPrimary}} value={profilePicLeftUrl} onChangeText={setProfilePicLeftUrl} placeholder="URL for 'left side' angle picture" placeholderTextColor={theme.colors.textSecondary} editable={!isSaving && !loadingAuthAction} />
        </View>
        <View style={styles.inputGroup}>
            <Text style={{...styles.label, fontFamily: theme.fonts.body, color: theme.colors.textPrimary}}>Picture URL (Back)</Text>
            <TextInput style={{...styles.input, fontFamily: theme.fonts.body, color: theme.colors.textPrimary}} value={profilePicBackUrl} onChangeText={setProfilePicBackUrl} placeholder="URL for 'back' angle picture" placeholderTextColor={theme.colors.textSecondary} editable={!isSaving && !loadingAuthAction} />
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
  sectionTitleContainer: {
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingBottom: theme.spacing.sm,
  },
  sectionTitle: {
    fontSize: theme.fontSizes.lg,
    fontWeight: "bold",
  }
});

export default ProfileScreen;
