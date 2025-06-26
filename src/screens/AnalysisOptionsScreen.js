import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Image, Alert, ActivityIndicator } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import theme from '../styles/theme';
import { useNavigation } from '@react-navigation/native';
import { uploadProfileImage, supabase, getProfile, saveHairAnalysisResult } from '../services/SupabaseService';
import { getAIHairstyleAdvice, getHairAnalysis, getGeneralHairAnalysis } from '../services/AIService';

const AnalysisOptionsScreen = () => {
  const navigation = useNavigation();
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
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      if (angle) {
        setUploadedImages(prev => ({
          ...prev,
          [angle]: result.assets[0].uri
        }));
      } else {
        setSelectedImage(result.assets[0].uri);
      }
    }
  };

  const handleGeneralAnalysis = async () => {
    if (!selectedImage) {
      Alert.alert('Error', 'Please select an image first');
      return;
    }
    if (!question.trim()) {
      Alert.alert('Error', 'Please enter your hair-related question');
      return;
    }

    setLoading(true);
    try {
      // Upload image and get AI advice
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('Error', 'Please log in to continue');
        return;
      }

      // Upload the image
      const { data: uploadData, error: uploadError } = await uploadProfileImage(
        user.id, 
        selectedImage, 
        'general_analysis'
      );

      if (uploadError) {
        Alert.alert('Upload Error', uploadError.message);
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
        Alert.alert('AI Analysis Error', error || 'Failed to get AI response');
      }
    } catch (error) {
      console.error('General analysis error:', error);
      Alert.alert('Error', 'Failed to complete analysis');
    } finally {
      setLoading(false);
    }
  };

  const handleDashboardUpdate = async () => {
    const { up, back, left, right } = uploadedImages;
    if (!up || !back || !left || !right) {
      Alert.alert('Error', 'Please upload all 4 images (Top, Back, Left, Right)');
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('Error', 'Please log in to continue');
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
        Alert.alert('Upload Error', 'Some images failed to upload');
        return;
      }

      // Get profile data for analysis
      const { data: profileData } = await getProfile();
      if (!profileData) {
        Alert.alert('Error', 'Profile data not found');
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
        await saveHairAnalysisResult(user.id, analysisData, imageReferences);
        Alert.alert('Analysis Complete', 'Your hair analysis is ready! Check your dashboard for personalized recommendations.');
        // Navigate directly to dashboard
        navigation.navigate('Dashboard');
      } else {
        Alert.alert('AI Analysis Failed', 'Could not analyze your hair. Please try again later.');
      }
    } catch (error) {
      console.error('Dashboard update error:', error);
      Alert.alert('Error', 'Failed to update dashboard');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Logo in top right */}
      <View style={styles.logoContainer}>
        <Image source={require('../../assets/splash.png')} style={styles.splashImage} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
          <Text style={styles.title}>Hair Analysis Options</Text>
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
            <Text style={styles.optionTitle}>General Hair Analysis</Text>
            <Text style={styles.optionDescription}>
              Upload 1 image and ask any hair-related question
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
                  <Text style={styles.uploadText}>Tap to select image</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Question Input */}
            <TextInput
              style={styles.questionInput}
              placeholder="Ask about your hair..."
              placeholderTextColor={theme.colors.textSecondary}
              value={question}
              onChangeText={setQuestion}
              multiline
              numberOfLines={4}
            />

            <TouchableOpacity 
              style={[styles.actionButton, (!selectedImage || !question.trim()) && styles.disabledButton]}
              onPress={handleGeneralAnalysis}
              disabled={!selectedImage || !question.trim() || loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color={theme.colors.textPrimary} />
              ) : (
                <Text style={styles.actionButtonText}>Get Analysis</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Option 2: Full Scan */}
        <TouchableOpacity 
          style={[styles.optionCard, selectedOption === 'full' && styles.selectedCard]}
          onPress={() => setSelectedOption('full')}
        >
          <View style={styles.optionContent}>
            <View style={styles.optionIcon}>
              <MaterialCommunityIcons name="scan-helper" size={48} color={theme.colors.primary} />
            </View>
            <Text style={styles.optionTitle}>Full Hair Scan</Text>
            <Text style={styles.optionDescription}>
              Upload 4 images for comprehensive analysis
            </Text>
          </View>
        </TouchableOpacity>

        {selectedOption === 'full' && (
          <View style={styles.optionContent}>
            <Text style={styles.sectionTitle}>Upload Images from All Angles</Text>
            
            <View style={styles.imageGrid}>
              {[
                { key: 'up', label: 'Top View', icon: 'arrow-up' },
                { key: 'back', label: 'Back View', icon: 'arrow-down' },
                { key: 'left', label: 'Left Side', icon: 'arrow-back' },
                { key: 'right', label: 'Right Side', icon: 'arrow-forward' },
              ].map(({ key, label, icon }) => (
                <TouchableOpacity 
                  key={key} 
                  style={styles.gridImageUpload} 
                  onPress={() => pickImage(key)}
                >
                  {uploadedImages[key] ? (
                    <Image source={{ uri: uploadedImages[key] }} style={styles.gridImage} />
                  ) : (
                    <View style={styles.gridPlaceholder}>
                      <Ionicons name={icon} size={24} color={theme.colors.primary} />
                      <Text style={styles.gridLabel}>{label}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity 
              style={[styles.actionButton, Object.values(uploadedImages).some(img => !img) && styles.disabledButton]}
              onPress={handleDashboardUpdate}
              disabled={Object.values(uploadedImages).some(img => !img) || loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color={theme.colors.textPrimary} />
              ) : (
                <Text style={styles.actionButtonText}>Update Dashboard</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
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
  backButton: {
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    padding: 8,
    marginRight: 16,
    ...theme.shadows.soft,
    borderWidth: 1,
    borderColor: theme.colors.accentGlow,
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
  gridImageUpload: {
    width: '48%',
    aspectRatio: 1,
    marginBottom: 12,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    ...theme.shadows.soft,
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  gridPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.primary,
    borderStyle: 'dashed',
  },
  gridLabel: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.body,
    marginTop: 8,
    textAlign: 'center',
  },
  actionButton: {
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
  actionButtonText: {
    color: theme.colors.textPrimary,
    fontSize: theme.fontSizes.md,
    fontWeight: 'bold',
    fontFamily: theme.fonts.body,
  },
  logoContainer: {
    position: 'absolute',
    top: 20,
    right: 20,
  },
  splashImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
});

export default AnalysisOptionsScreen; 