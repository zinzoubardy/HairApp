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
import { getProfile, updateProfile, uploadProfileImage, saveHairAnalysisResult } from "../services/SupabaseService";
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { getHairAnalysis } from '../services/AIService';
import { useTranslation } from '../i18n';

const HAIR_IMAGE_SLOTS = [
  { angle: 'up', label: 'Top View', icon: 'arrow-up-bold-circle', description: 'Photo of the top of your head' },
  { angle: 'back', label: 'Back View', icon: 'arrow-down-bold-circle', description: 'Photo of the back of your head' },
  { angle: 'left', label: 'Left View', icon: 'arrow-left-bold-circle', description: 'Photo of the left side of your head' },
  { angle: 'right', label: 'Right View', icon: 'arrow-right-bold-circle', description: 'Photo of the right side of your head' },
];

const ProfileScreen = ({ navigation }) => {
  const { user, signOut, loadingAuthAction } = useAuth();
  const { t } = useTranslation();
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

  // Check if all images are uploaded
  const allImagesUploaded = profilePicUpUrl && profilePicRightUrl && profilePicLeftUrl && profilePicBackUrl;

  useEffect(() => {
    // Request permissions when component mounts, can also be done on button press
    (async () => {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(t('permission_required'), 'Sorry, we need camera roll permissions to make this work!');
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
        Alert.alert(t('error'), "An unexpected error occurred while loading your profile.");
      } finally {
        setIsLoading(false);
      }
    };

    loadProfileData();
  }, [user]); // Depend on user object to re-load if user changes

  const handleSaveProfile = async () => {
    if (!user) {
      Alert.alert(t('not_logged_in'), "You must be logged in to save your profile.");
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
        Alert.alert(t('save_error'), `${t('save_error')}: ${error.message}`);
      } else {
        Alert.alert(t('success'), t('profile_saved'));
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
        
        // After successful save, trigger AI analysis if all images are uploaded
        if (allImagesUploaded) {
          Alert.alert(
            t('ai_analysis_starting'), 
            "Your profile is saved! Starting AI analysis of your hair images...",
            [
              {
                text: t('ok'),
                onPress: async () => {
                  try {
                    setIsLoading(true);
                    const imageReferences = {
                      up: profilePicUpUrl,
                      back: profilePicBackUrl,
                      left: profilePicLeftUrl,
                      right: profilePicRightUrl,
                    };
                    
                    // Debug logging
                    console.log("=== AI ANALYSIS DEBUG ===");
                    console.log("User ID:", user.id);
                    console.log("Image References:", imageReferences);
                    console.log("Profile Pic URLs:");
                    console.log("- Up:", profilePicUpUrl);
                    console.log("- Back:", profilePicBackUrl);
                    console.log("- Left:", profilePicLeftUrl);
                    console.log("- Right:", profilePicRightUrl);
                    console.log("========================");
                    
                    const { success, data: analysisData, error } = await getHairAnalysis(null, imageReferences);
                    
                    console.log("AI Analysis Result:", { success, error, dataLength: analysisData?.length });
                    
                    if (success) {
                      console.log("Analysis successful, saving to database...");
                      // Save analysis result to DB
                      await saveHairAnalysisResult(user.id, analysisData, imageReferences);
                      Alert.alert('Analysis Complete', 'Your hair analysis is ready! Check your dashboard for personalized recommendations.');
                    } else {
                      console.error("AI Analysis failed:", error);
                      Alert.alert('AI Analysis Failed', `Could not analyze your hair: ${error || 'Unknown error'}. Please try again later.`);
                    }
                  } catch (analysisError) {
                    console.error("Exception during AI analysis:", analysisError);
                    Alert.alert('Analysis Error', 'An unexpected error occurred during analysis. Please try again later.');
                  } finally {
                    setIsLoading(false);
                  }
                }
              }
            ]
          );
        } else {
          Alert.alert(
            t('images_needed'),
            "Please upload all four hair images to enable AI analysis.",
            [{ text: t('ok') }]
          );
        }
      }
    } catch (e) {
      console.error("Exception during saveProfile:", e);
      Alert.alert(t('error'), "An unexpected error occurred while saving your profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      Alert.alert(t('error'), error.message);
    }
  };

  const handlePickAndUploadImage = async (angle) => {
    if (!user) {
      Alert.alert(t('not_logged_in'), "You must be logged in to upload images.");
      return;
    }

    setUploadingAngle(angle);
    try {
      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'Images',
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        console.log(`Uploading ${angle} image:`, imageUri);

        // Upload to Cloudinary
        const { data, error } = await uploadProfileImage(user.id, imageUri, angle);
        
        if (!error) {
          // Update the appropriate state based on angle
          switch (angle) {
            case "up":
              setProfilePicUpUrl(data.publicUrl);
              break;
            case "right":
              setProfilePicRightUrl(data.publicUrl);
              break;
            case "left":
              setProfilePicLeftUrl(data.publicUrl);
              break;
            case "back":
              setProfilePicBackUrl(data.publicUrl);
              break;
          }
          
          Alert.alert(t('success'), `${angle.charAt(0).toUpperCase() + angle.slice(1)} ${t('upload_success')}`);
        } else {
          console.error("Upload failed:", error);
          const errorMessage = typeof error === 'string' ? error : error?.message || 'Unknown error';
          if (typeof errorMessage === 'string' && (errorMessage.includes("network") || errorMessage.includes("connection"))) {
            Alert.alert(t('error'), t('network_error'));
          } else {
            Alert.alert(t('error'), `${t('upload_exception')}: ${errorMessage}`);
          }
        }
      }
    } catch (e) {
      console.error("Exception during image upload:", e);
      Alert.alert(t('error'), `${t('upload_exception')}: ${e.message}`);
    } finally {
      setUploadingAngle(null);
    }
  };

  if (isLoading && !user) { // Show nothing or a generic loading if user isn't available yet during initial auth check
    return (
        <View style={{...styles.container, justifyContent: "center", alignItems: "center", backgroundColor: theme.colors.background}}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
    );
  }

  if (isLoading && user) { // Show 
  // 
  // 
  //  specific loading only when user is confirmed and we are fetching their profile
    return (
      <View style={{...styles.container, justifyContent: "center", alignItems: "center", backgroundColor: theme.colors.background}}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={{marginTop: theme.spacing.md, fontFamily: theme.fonts.body, color: theme.colors.textPrimary}}>{t('loading_profile')}</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* Logo in top right */}
      
      

      <ScrollView contentContainerStyle={styles.scrollContent}>
      <View style={styles.centralLogoContainer}>
        <Image source={require('../../assets/splash.png')} style={styles.bigLogo} />
      </View>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>{t('my_profile')}</Text>
      </View>
        <Text style={styles.subtitle}>Manage your hair profile and preferences</Text>
        <Text style={styles.emailText}>Email: {user?.email}</Text>

        {/* Profile Details Form */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t('full_name')}</Text>
          <TextInput
            style={styles.input}
            placeholder={t('enter_full_name')}
            placeholderTextColor={theme.colors.textSecondary}
            value={fullName}
            onChangeText={setFullName}
            returnKeyType="next"
            editable={!isSaving && !loadingAuthAction}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t('username')}</Text>
          <TextInput
            style={styles.input}
            placeholder={t('choose_username')}
            placeholderTextColor={theme.colors.textSecondary}
            value={username}
            onChangeText={setUsername}
            returnKeyType="next"
            editable={!isSaving && !loadingAuthAction}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t('hair_goal')}</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Longer hair, More volume, Healthier scalp"
            placeholderTextColor={theme.colors.textSecondary}
            value={hairGoal}
            onChangeText={setHairGoal}
            returnKeyType="next"
            editable={!isSaving && !loadingAuthAction}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t('allergies')}</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Sulfates, Silicones, Fragrances"
            placeholderTextColor={theme.colors.textSecondary}
            value={allergies}
            onChangeText={setAllergies}
            returnKeyType="next"
            editable={!isSaving && !loadingAuthAction}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t('hair_color')}</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Natural brown, Dyed blonde, Black"
            placeholderTextColor={theme.colors.textSecondary}
            value={hairColor}
            onChangeText={setHairColor}
            returnKeyType="next"
            editable={!isSaving && !loadingAuthAction}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t('hair_condition')}</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Dry, Oily, Healthy, Damaged ends"
            placeholderTextColor={theme.colors.textSecondary}
            value={hairCondition}
            onChangeText={setHairCondition}
            returnKeyType="next"
            editable={!isSaving && !loadingAuthAction}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t('hair_concerns')}</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
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
          <Text style={styles.sectionTitle}>{t('upload_images')}</Text>
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
          style={[styles.button, { backgroundColor: isSaving || loadingAuthAction ? theme.colors.border : theme.colors.primary }]}
          onPress={handleSaveProfile}
          disabled={isSaving || loadingAuthAction || !user} // Disable if not logged in
        >
          {isSaving ? (
            <ActivityIndicator size="small" color={theme.colors.textPrimary} />
          ) : (
            <Text style={styles.buttonText}>{t('save_profile')}</Text>
          )}
        </TouchableOpacity>

        {user && (
          <TouchableOpacity
            style={[styles.button, { backgroundColor: loadingAuthAction ? theme.colors.border : theme.colors.error, marginTop: theme.spacing.lg }]}
            onPress={handleSignOut}
            disabled={loadingAuthAction}
          >
            {loadingAuthAction && !isSaving ? (
              <ActivityIndicator size="small" color={theme.colors.card} />
            ) : (
              <Text style={styles.buttonText}>{t('sign_out')}</Text>
            )}
          </TouchableOpacity>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    padding: theme.spacing.md,
  },
  title: {
    fontSize: theme.fontSizes.xxl,
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.title,
    fontWeight: 'bold',
    marginBottom: theme.spacing.sm,
    textAlign: "center",
  },
  subtitle: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.body,
    textAlign: "center",
    marginBottom: theme.spacing.md,
  },
  emailText: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.body,
    textAlign: "center",
    marginBottom: theme.spacing.xl,
    fontStyle: "italic",
  },
  inputGroup: {
    marginBottom: theme.spacing.md,
  },
  label: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.body,
    marginBottom: theme.spacing.xs,
    fontWeight: "bold",
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.accentGlow,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm + 2,
    fontSize: theme.fontSizes.md,
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.body,
    ...theme.shadows.soft,
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  button: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    alignItems: "center",
    marginTop: theme.spacing.sm,
    minHeight: 50,
    justifyContent: "center",
    ...theme.shadows.medium,
    borderWidth: 1,
    borderColor: theme.colors.accentGlow,
  },
  buttonText: {
    color: theme.colors.textPrimary,
    fontSize: theme.fontSizes.md,
    fontWeight: "bold",
    fontFamily: theme.fonts.body,
  },
  sectionTitleContainer: {
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.accentGlow,
    paddingBottom: theme.spacing.sm,
  },
  sectionTitle: {
    fontSize: theme.fontSizes.lg,
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.title,
    fontWeight: "bold",
  },
  imageUploadGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginBottom: theme.spacing.lg,
  },
  imageUploadContainer: {
    width: '45%',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  imagePickerButton: {
    width: 120,
    height: 120,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.primary,
    ...theme.shadows.medium,
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
  },
  bigLogo: {
    width: 180,
    height: 180,
    borderRadius: 90,
    alignSelf: 'center',
    marginBottom: 0,
  },
  centralLogoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 0,
    marginBottom: 0,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 0,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.colors.primary,
    fontFamily: theme.fonts.heading,
    textAlign: 'center',
    letterSpacing: 1.2,
    marginBottom: 4,
  },
});

export default ProfileScreen;
