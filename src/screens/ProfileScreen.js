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
  ActivityIndicator,
  Image // Added for displaying images
} from "react-native";
import * as ImagePicker from 'expo-image-picker'; // Import expo-image-picker
import theme from "../styles/theme";
import { useAuth } from "../contexts/AuthContext";
// Added uploadProfileImage to imports
import { getProfile, updateProfile, uploadProfileImage } from "../services/SupabaseService";
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { getHairAnalysis, saveHairAnalysisResult } from '../services/AIService';

// const PROFILE_DATA_KEY = "@HairNatureAI_ProfileData"; // Keep for potential local-only settings or fallback

const HAIR_IMAGE_SLOTS = [
  { angle: 'up', label: 'Top View', icon: 'arrow-up-bold-circle', description: 'Photo of the top of your head' },
  { angle: 'back', label: 'Back View', icon: 'arrow-down-bold-circle', description: 'Photo of the back of your head' },
  { angle: 'left', label: 'Left View', icon: 'arrow-left-bold-circle', description: 'Photo of the left side of your head' },
  { angle: 'right', label: 'Right View', icon: 'arrow-right-bold-circle', description: 'Photo of the right side of your head' },
];

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

  const [isLoading, setIsLoading] = useState(false); // For initial data load
  const [isSaving, setIsSaving] = useState(false);  // For saving all profile text data
  const [uploadingAngle, setUploadingAngle] = useState(null); // To show loading on specific image button: "up", "left", etc.


  useEffect(() => {
    // Request permissions when component mounts, can also be done on button press
    (async () => {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to make this work!');
        }
      }
    })();

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

  const handlePickAndUploadImage = async (angle) => {
    console.log('Upload button pressed for angle:', angle); // Debug log
    if (!user) {
      Alert.alert("Not Logged In", "You must be logged in to upload images.");
      return;
    }

    // Request permissions on button press (for reliability)
    let permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.status !== 'granted') {
      Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to make this work!');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, // Correct for SDK 52
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });
    console.log('ImagePicker result:', result); // Debug log

    if (result.cancelled || !result.assets || result.assets.length === 0) {
      Alert.alert('No Image Selected', 'You did not select any image.');
      return;
    }

    const fileUri = result.assets[0].uri;
    setUploadingAngle(angle); // Show loading indicator for this angle
    try {
      const { data: uploadData, error: uploadError } = await uploadProfileImage(user.id, fileUri, angle);

      if (uploadError) {
        Alert.alert('Upload Error', uploadError.message || 'Failed to upload image.');
        setUploadingAngle(null);
        return;
      }
      if (uploadData && uploadData.publicUrl) {
        switch (angle) {
          case "up": setProfilePicUpUrl(uploadData.publicUrl); break;
          case "right": setProfilePicRightUrl(uploadData.publicUrl); break;
          case "left": setProfilePicLeftUrl(uploadData.publicUrl); break;
          case "back": setProfilePicBackUrl(uploadData.publicUrl); break;
          default: break;
        }
        Alert.alert("Upload Success", `${angle.charAt(0).toUpperCase() + angle.slice(1)} image uploaded! Remember to save your profile to keep this change.`);
      }
    } catch (e) {
      if (e.message && e.message.includes('Network request failed')) {
        Alert.alert("Network Error", "Could not upload image. Please check your internet connection, Supabase URL, and that your device can reach your Supabase project. If on a real device, Supabase must be accessible from the public internet.");
      } else {
        Alert.alert("Upload Exception", `An error occurred: ${e.message}`);
      }
    } finally {
      setUploadingAngle(null); // Hide loading indicator
    }
  };

  // Helper to check if all images are uploaded
  const allImagesUploaded = (profilePicUpUrl && profilePicBackUrl && profilePicLeftUrl && profilePicRightUrl);

  // After uploading an image, check if all are present and trigger AI analysis
  useEffect(() => {
    const runAnalysis = async () => {
      if (allImagesUploaded && user) {
        setIsLoading(true);
        const imageReferences = {
          up: profilePicUpUrl,
          back: profilePicBackUrl,
          left: profilePicLeftUrl,
          right: profilePicRightUrl,
        };
        const profileData = {
          hair_goal: hairGoal,
          allergies,
          hair_color: hairColor,
          hair_condition: hairCondition,
          hair_concerns_preferences: hairConcernsPreferences,
        };
        const { success, data } = await getHairAnalysis(profileData, imageReferences);
        if (success) {
          // Optionally save to DB
          await saveHairAnalysisResult(user.id, data, imageReferences);
          // Optionally notify dashboard to refresh (could use context or navigation param)
          Alert.alert('Analysis Complete', 'Your hair analysis is ready! Check your dashboard.');
        } else {
          Alert.alert('AI Analysis Failed', 'Could not analyze your hair. Please try again.');
        }
        setIsLoading(false);
      }
    };
    runAnalysis();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profilePicUpUrl, profilePicBackUrl, profilePicLeftUrl, profilePicRightUrl]);

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

        {/* Profile Image Upload Section */}
        <View style={styles.sectionTitleContainer}>
          <Text style={{...styles.sectionTitle, color: theme.colors.textPrimary, fontFamily: theme.fonts.title }}>Your Hair Images</Text>
        </View>
        <Text style={{textAlign: 'center', color: theme.colors.textSecondary, marginBottom: theme.spacing.md}}>
          Upload clear photos of your hair from each angle for best results: Top, Back, Left, and Right.
        </Text>
        <View style={styles.imageUploadGrid}>
          {HAIR_IMAGE_SLOTS.map(img => (
            <View key={img.angle} style={[styles.imageUploadContainer, { alignItems: 'center' }]}>  
              <MaterialCommunityIcons name={img.icon} size={36} color={theme.colors.primary} style={{marginBottom: 4}} />
              <Text style={{fontWeight: 'bold', fontSize: 16, marginBottom: 2, color: theme.colors.primary}}>{img.label}</Text>
              <Text style={{fontSize: 12, color: theme.colors.textSecondary, marginBottom: 6}}>{img.description}</Text>
              <TouchableOpacity
                style={[styles.imagePickerButton, { borderColor: theme.colors.primary, borderWidth: 2, borderRadius: 12, backgroundColor: '#f8f8f8' }]}
                onPress={() => handlePickAndUploadImage(img.angle)}
                disabled={uploadingAngle === img.angle}
              >
                {uploadingAngle === img.angle ? (
                  <ActivityIndicator size="small" color={theme.colors.primary} />
                ) : (() => {
                  if (img.angle === 'up' && profilePicUpUrl) return <Image source={{ uri: profilePicUpUrl }} style={styles.profileImagePreview} />;
                  if (img.angle === 'back' && profilePicBackUrl) return <Image source={{ uri: profilePicBackUrl }} style={styles.profileImagePreview} />;
                  if (img.angle === 'left' && profilePicLeftUrl) return <Image source={{ uri: profilePicLeftUrl }} style={styles.profileImagePreview} />;
                  if (img.angle === 'right' && profilePicRightUrl) return <Image source={{ uri: profilePicRightUrl }} style={styles.profileImagePreview} />;
                  return (
                    <View style={{alignItems: 'center'}}>
                      <Ionicons name="image-outline" size={36} color={theme.colors.primary} style={{marginBottom: 4}} />
                      <Text style={{color: theme.colors.textSecondary, fontSize: 12}}>Upload</Text>
                    </View>
                  );
                })()}
              </TouchableOpacity>
            </View>
          ))}
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
  },
  imageUploadGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around', // Distribute items
    marginBottom: theme.spacing.lg,
  },
  imageUploadContainer: {
    width: '45%', // Two items per row with some spacing
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  imagePickerButton: {
    width: 120,
    height: 120,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.borderMuted,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  imagePickerButtonText: {
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.body,
  },
  profileImagePreview: {
    width: '100%',
    height: '100%',
    borderRadius: theme.borderRadius.md,
    resizeMode: 'cover',
  }
});

export default ProfileScreen;
