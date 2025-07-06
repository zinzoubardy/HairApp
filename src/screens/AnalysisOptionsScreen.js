import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Image, Alert, ActivityIndicator } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import theme from '../styles/theme';
import { useNavigation } from '@react-navigation/native';
import { uploadProfileImage, supabase, getProfile, saveHairAnalysisResult } from '../services/SupabaseService';
import { getAIHairstyleAdvice, getHairAnalysis, getGeneralHairAnalysis } from '../services/AIService';
import { useTranslation } from '../i18n';
import Footer from '../components/Footer';

const AnalysisOptionsScreen = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [selectedOption, setSelectedOption] = useState(null);
  const [loading, setLoading] = useState(false);
  const [question, setQuestion] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [uploadedImages, setUploadedImages] = useState({
    up: null,
    back: null,
    left: null,
    right: null,
  });

  const pickImage = async (angle = null) => {
    Alert.alert(
      t('upload_images'),
      t('choose_image_source'),
      [
        {
          text: t('take_photo'),
          onPress: async () => {
            const result = await ImagePicker.launchCameraAsync({
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.8,
            });
            if (!result.canceled && result.assets && result.assets[0]) {
              if (angle) {
                setUploadedImages(prev => ({ ...prev, [angle]: result.assets[0].uri }));
              } else {
                setSelectedImage(result.assets[0].uri);
              }
            }
          },
        },
        {
          text: t('select_from_gallery'),
          onPress: async () => {
            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: 'Images',
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.8,
            });
            if (!result.canceled && result.assets && result.assets[0]) {
              if (angle) {
                setUploadedImages(prev => ({ ...prev, [angle]: result.assets[0].uri }));
              } else {
                setSelectedImage(result.assets[0].uri);
              }
            }
          },
        },
        { text: t('cancel'), style: 'cancel' },
      ],
      { cancelable: true }
    );
  };

  const handleGeneralAnalysis = async () => {
    if (!selectedImage) {
      Alert.alert(t('error'), t('please_select_image'));
      return;
    }
    if (!question.trim()) {
      Alert.alert(t('error'), t('please_enter_question'));
      return;
    }

    setLoading(true);
    try {
      // Upload image and get AI advice
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert(t('error'), t('please_login'));
        return;
      }

      // Upload the image
      const { data: uploadData, error: uploadError } = await uploadProfileImage(
        user.id, 
        selectedImage, 
        'general_analysis'
      );

      if (uploadError) {
        Alert.alert(t('upload_error'), uploadError.message);
        return;
      }

      // Get AI advice using the vision model
      const { success, data: aiResponse, error } = await getGeneralHairAnalysis(uploadData.publicUrl, question);
      
      if (success) {
        navigation.navigate('AnalysisResult', {
          type: 'general',
          question: question,
          answer: aiResponse,
          imageUrl: uploadData.publicUrl
        });
      } else {
        Alert.alert(t('ai_analysis_error'), error || t('failed_to_get_ai_response'));
      }
    } catch (error) {
      console.error('General analysis error:', error);
      Alert.alert(t('error'), t('failed_to_complete_analysis'));
    } finally {
      setLoading(false);
    }
  };

  const handleDashboardUpdate = async () => {
    const { up, back, left, right } = uploadedImages;
    if (!up || !back || !left || !right) {
      Alert.alert(t('error'), t('please_upload_all_images'));
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert(t('error'), t('please_login'));
        return;
      }

      // Upload all images
      const uploadPromises = [
        uploadProfileImage(user.id, up, 'up'),
        uploadProfileImage(user.id, back, 'back'),
        uploadProfileImage(user.id, left, 'left'),
        uploadProfileImage(user.id, right, 'right'),
      ];

      const uploadResults = await Promise.all(uploadPromises);
      const uploadErrors = uploadResults.filter(result => result.error);

      if (uploadErrors.length > 0) {
        console.error('Upload errors:', uploadErrors);
        const errorMessage = uploadErrors[0]?.error?.message || t('some_images_failed');
        Alert.alert(t('upload_error'), errorMessage);
        return;
      }

      // Get profile data for analysis
      const { data: profileData } = await getProfile();
      if (!profileData) {
        Alert.alert(t('error'), t('profile_data_not_found'));
        return;
      }

      // Prepare image references
      const imageReferences = {
        up: uploadResults[0].data.publicUrl,
        back: uploadResults[1].data.publicUrl,
        left: uploadResults[2].data.publicUrl,
        right: uploadResults[3].data.publicUrl,
      };

      // Trigger AI analysis
      const { success, data: analysisData } = await getHairAnalysis(null, imageReferences);
      if (success) {
        // Save analysis result to DB
        const { data: savedAnalysis, error: saveError } = await saveHairAnalysisResult(user.id, analysisData, imageReferences);
        if (saveError) {
          Alert.alert(t('error'), t('failed_to_save_analysis'));
          return;
        }
        
        // Navigate to AnalysisResult screen with the saved analysis ID
        navigation.navigate('AnalysisResult', {
          analysisId: savedAnalysis.id
        });
      } else {
        Alert.alert(t('ai_analysis_failed'), t('could_not_analyze_hair'));
      }
    } catch (error) {
      console.error('Dashboard update error:', error);
      Alert.alert(t('error'), t('failed_to_update_dashboard'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Logo in top right */}
      <View style={styles.centralLogoContainer}>
        <Image source={require('../../assets/splash.png')} style={styles.bigLogo} />
      </View>
      

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>{t('hair_analysis_options')}</Text>
      </View>

        {/* Option 1: General Analysis */}
        <TouchableOpacity 
          style={[styles.optionCard, selectedOption === 'general' && styles.selectedCard]}
          onPress={() => setSelectedOption('general')}
        >
          <View style={styles.optionContent}>
            <View style={styles.optionIcon}>
              <MaterialCommunityIcons name="chat-question" size={48} color={theme.colors.primary} />
            </View>
            <Text style={styles.optionTitle}>{t('general_hair_analysis')}</Text>
            <Text style={styles.optionDescription}>
              {t('general_analysis_description')}
            </Text>
          </View>
        </TouchableOpacity>

        {selectedOption === 'general' && (
          <View style={styles.optionContent}>
            {/* Image Upload */}
            <TouchableOpacity style={styles.imageUpload} onPress={() => pickImage()}>
              {selectedImage ? (
                <Image source={{ uri: selectedImage }} style={styles.uploadedImage} />
              ) : (
                <View style={styles.uploadPlaceholder}>
                  <Ionicons name="camera" size={32} color={theme.colors.primary} />
                  <Text style={styles.uploadText}>{t('tap_to_select_image')}</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Question Input */}
            <TextInput
              style={styles.questionInput}
              placeholder={t('enter_hair_question')}
              placeholderTextColor={theme.colors.textSecondary}
              value={question}
              onChangeText={setQuestion}
              multiline
              numberOfLines={3}
            />

            {/* Analyze Button */}
            <TouchableOpacity
              style={[styles.analyzeButton, loading && styles.disabledButton]}
              onPress={handleGeneralAnalysis}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color={theme.colors.textPrimary} />
              ) : (
                <Text style={styles.analyzeButtonText}>{t('analyse')}</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Option 2: Dashboard Update */}
        <TouchableOpacity 
          style={[styles.optionCard, selectedOption === 'dashboard' && styles.selectedCard]}
          onPress={() => setSelectedOption('dashboard')}
        >
          <View style={styles.optionContent}>
            <View style={styles.optionIcon}>
              <MaterialCommunityIcons name="view-dashboard" size={48} color={theme.colors.primary} />
            </View>
            <Text style={styles.optionTitle}>{t('dashboard_update')}</Text>
            <Text style={styles.optionDescription}>
              {t('dashboard_update_description')}
            </Text>
          </View>
        </TouchableOpacity>

        {selectedOption === 'dashboard' && (
          <View style={styles.optionContent}>
            {/* Image Upload Grid */}
            <View style={styles.imageGrid}>
              {[
                { key: 'up', label: 'Top', icon: 'arrow-up-bold-circle' },
                { key: 'back', label: 'Back', icon: 'arrow-down-bold-circle' },
                { key: 'left', label: 'Left', icon: 'arrow-left-bold-circle' },
                { key: 'right', label: 'Right', icon: 'arrow-right-bold-circle' },
              ].map(({ key, label, icon }) => (
                <TouchableOpacity
                  key={key}
                  style={styles.imageUploadItem}
                  onPress={() => pickImage(key)}
                >
                  {uploadedImages[key] ? (
                    <Image source={{ uri: uploadedImages[key] }} style={styles.uploadedImage} />
                  ) : (
                    <View style={styles.uploadPlaceholder}>
                      <MaterialCommunityIcons name={icon} size={24} color={theme.colors.primary} />
                      <Text style={styles.uploadText}>{label}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* Update Dashboard Button */}
            <TouchableOpacity
              style={[styles.analyzeButton, loading && styles.disabledButton]}
              onPress={handleDashboardUpdate}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color={theme.colors.textPrimary} />
              ) : (
                <Text style={styles.analyzeButtonText}>{t('analyse')}</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
      <Footer />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: theme.fontSizes.xl,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.title,
  },
  optionCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    marginBottom: 20,
    ...theme.shadows.medium,
    borderWidth: 1,
    borderColor: theme.colors.accentGlow,
  },
  selectedCard: {
    ...theme.shadows.glow,
    borderColor: theme.colors.accent,
  },
  optionContent: {
    padding: 24,
    alignItems: 'center',
  },
  optionIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(109, 139, 116, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    ...theme.shadows.glow,
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  optionTitle: {
    fontSize: theme.fontSizes.lg,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.title,
    marginBottom: 8,
    textAlign: 'center',
  },
  optionDescription: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.body,
    textAlign: 'center',
    lineHeight: 22,
  },
  imageUpload: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignSelf: 'center',
    marginBottom: 20,
    overflow: 'hidden',
    ...theme.shadows.medium,
  },
  uploadedImage: {
    width: '100%',
    height: '100%',
  },
  uploadPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: theme.colors.background,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.primary,
    borderStyle: 'dashed',
  },
  uploadText: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.body,
    marginTop: 8,
    textAlign: 'center',
  },
  questionInput: {
    borderWidth: 1,
    borderColor: theme.colors.accentGlow,
    borderRadius: theme.borderRadius.md,
    padding: 16,
    fontSize: theme.fontSizes.md,
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.body,
    backgroundColor: theme.colors.background,
    marginBottom: 20,
    minHeight: 80,
    textAlignVertical: 'top',
    ...theme.shadows.soft,
  },
  sectionTitle: {
    fontSize: theme.fontSizes.lg,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.title,
    marginBottom: 16,
    textAlign: 'center',
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  imageUploadItem: {
    width: '48%',
    aspectRatio: 1,
    marginBottom: 12,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    ...theme.shadows.soft,
  },
  analyzeButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.lg,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    ...theme.shadows.medium,
    borderWidth: 1,
    borderColor: theme.colors.accentGlow,
  },
  disabledButton: {
    backgroundColor: theme.colors.border,
    opacity: 0.6,
  },
  analyzeButtonText: {
    color: theme.colors.textPrimary,
    fontSize: theme.fontSizes.md,
    fontWeight: 'bold',
    fontFamily: theme.fonts.body,
  },
  centralLogoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
    marginBottom: 0,
  },
  bigLogo: {
    width: 180,
    height: 180,
    borderRadius: 90,
    alignSelf: 'center',
    marginBottom: 0,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.colors.primary,
    fontFamily: theme.fonts.heading,
    textAlign: 'center',
    letterSpacing: 1.2,
    marginBottom: 8,
  },
});

export default AnalysisOptionsScreen; 