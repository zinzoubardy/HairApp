import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Modal, FlatList, Dimensions, ActivityIndicator } from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import theme from '../styles/theme';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { getProfile, getHairAnalysisResult } from '../services/SupabaseService';
import { getHairAnalysis, saveHairAnalysisResult } from '../services/AIService';

const { width } = Dimensions.get('window');

// DashboardCard Component
const DashboardCard = ({ icon, title, status, onPress, children }) => {
  return (
    <TouchableOpacity 
      style={styles.dashboardCard} 
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleContainer}>
          <MaterialCommunityIcons name={icon} size={24} color={theme.colors.primary} style={{ marginRight: 8 }} />
          <Text style={styles.cardTitle}>{title}</Text>
        </View>
        <View style={[
          styles.statusBadge, 
          { backgroundColor: status === 'Analyzed' ? theme.colors.accent : theme.colors.secondary }
        ]}>
          <Text style={styles.statusText}>{status}</Text>
        </View>
      </View>
      <View style={styles.cardContent}>
        {children}
      </View>
    </TouchableOpacity>
  );
};

// Default data when no analysis is available
const defaultHairState = 0;
const defaultScalpAnalysis = {
  status: 'Not Analyzed',
  icon: 'help-circle',
  summary: 'Upload images to get analysis',
};
const defaultColorAnalysis = {
  status: 'Not Analyzed',
  icon: 'help-circle',
  summary: 'Upload images to get analysis',
};
const defaultRecommendations = [
  { icon: 'camera', text: 'Upload hair images from all angles' },
  { icon: 'analytics', text: 'Get AI-powered hair analysis' },
  { icon: 'bulb', text: 'Receive personalized recommendations' },
];
const trendingRecipes = [
  { id: 1, title: 'Henna Gloss', image: require('../../assets/sample.png'), details: 'A nourishing henna gloss recipe...' },
  { id: 2, title: 'Aloe Vera Mask', image: require('../../assets/sample.png'), details: 'A soothing aloe vera mask...' },
  { id: 3, title: 'Coconut Deep Conditioner', image: require('../../assets/sample.png'), details: 'Deeply condition with coconut...' },
];

const HomeScreen = () => {
  const navigation = useNavigation();
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [analysing, setAnalysing] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: profileData } = await getProfile();
      console.log('Profile data received:', profileData);
      setProfile(profileData);
      
      if (profileData && profileData.id) {
        console.log('Fetching analysis for user ID:', profileData.id);
        // Fetch the latest hair analysis result
        const { data: analysisData } = await getHairAnalysisResult(profileData.id);
        console.log('Fetched analysis data:', analysisData);
        setAnalysis(analysisData);
      } else {
        console.log('No profile data or user ID available');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Refresh data when screen comes into focus, but only if we have a profile
  useFocusEffect(
    useCallback(() => {
      if (profile && profile.id) {
        // Only fetch analysis data, not the full profile
        const refreshAnalysis = async () => {
          try {
            const { data: analysisData } = await getHairAnalysisResult(profile.id);
            console.log('Refreshed analysis data:', analysisData);
            setAnalysis(analysisData);
          } catch (error) {
            console.error('Error refreshing analysis:', error);
          }
        };
        refreshAnalysis();
      }
    }, [profile])
  );

  // Menu navigation handlers
  const handleMenu = () => setMenuVisible(true);
  const handleMenuClose = () => setMenuVisible(false);
  const handleMenuItem = (screen) => {
    setMenuVisible(false);
    navigation.navigate(screen);
  };

  // Recipe modal
  const handleRecipePress = (recipe) => setSelectedRecipe(recipe);
  const handleRecipeClose = () => setSelectedRecipe(null);

  // Analyse Now logic
  const handleAnalyseNow = async () => {
    if (!profile) return;
    // Check if all images are uploaded
    const images = [profile.profile_pic_up_url, profile.profile_pic_back_url, profile.profile_pic_left_url, profile.profile_pic_right_url];
    if (images.some(url => !url)) {
      alert('Please upload all four hair images (Top, Back, Left, Right) in your profile first.');
      navigation.navigate('Profile');
      return;
    }
    setAnalysing(true);
    try {
      // Call AI analysis with ONLY image references (no profile data)
      const imageRefs = {
        up: profile.profile_pic_up_url,
        back: profile.profile_pic_back_url,
        left: profile.profile_pic_left_url,
        right: profile.profile_pic_right_url,
      };
      
      const { success, data } = await getHairAnalysis(null, imageRefs);
      if (success) {
        setAnalysis(data);
        // Save to DB
        await saveHairAnalysisResult(profile.id, data, imageRefs);
      } else {
        alert('AI analysis failed. Please try again.');
      }
    } catch (error) {
      console.error('Analysis error:', error);
      alert('Analysis failed. Please try again.');
    }
    setAnalysing(false);
  };

  // Helper function to get analysis data with fallbacks
  const getAnalysisData = () => {
    if (!analysis) {
      return {
        hairState: defaultHairState,
        scalpAnalysis: defaultScalpAnalysis,
        colorAnalysis: defaultColorAnalysis,
        recommendations: defaultRecommendations,
      };
    }

    // Parse the analysis result - it's stored as text, not JSON
    let analysisText;
    try {
      // The analysis result is stored in analysis_data.ai_response
      analysisText = analysis.analysis_data?.ai_response || analysis.analysis_result || '';
      console.log('Analysis text to parse:', analysisText);
    } catch (error) {
      console.error('Error accessing analysis result:', error);
      return {
        hairState: defaultHairState,
        scalpAnalysis: defaultScalpAnalysis,
        colorAnalysis: defaultColorAnalysis,
        recommendations: defaultRecommendations,
      };
    }

    if (!analysisText) {
      console.log('No analysis text found');
      return {
        hairState: defaultHairState,
        scalpAnalysis: defaultScalpAnalysis,
        colorAnalysis: defaultColorAnalysis,
        recommendations: defaultRecommendations,
      };
    }

    // Parse the text-based AI response
    const parseAnalysisText = (text) => {
      console.log('=== PARSING DEBUG START ===');
      console.log('Raw text to parse:', text);
      
      const result = {
        hairState: 75, // Default fallback
        scalpAnalysis: {
          status: 'Analyzed',
          icon: 'spa',
          summary: 'Analysis completed',
        },
        colorAnalysis: {
          status: 'Analyzed',
          icon: 'palette',
          summary: 'Analysis completed',
        },
        recommendations: [],
      };

      try {
        // Split the text into sections
        const sections = text.split(/\*\*\d+\.\s+/);
        console.log('Sections found:', sections);

        sections.forEach((section, index) => {
          const trimmedSection = section.trim();
          console.log(`Section ${index}:`, trimmedSection);

          // Extract hair state score
          if (trimmedSection.includes('Global Hair State Score:')) {
            const hairStateMatch = trimmedSection.match(/(\d+)%/);
            if (hairStateMatch) {
              result.hairState = parseInt(hairStateMatch[1]);
              console.log('Found hair state:', result.hairState);
            }
          }

          // Extract scalp analysis
          if (trimmedSection.includes('Detailed Scalp Analysis:')) {
            const scalpContent = trimmedSection.replace('Detailed Scalp Analysis:', '').trim();
            if (scalpContent) {
              const sentences = scalpContent.split(/[.!?]+/).filter(s => s.trim().length > 10);
              if (sentences.length > 0) {
                result.scalpAnalysis.summary = sentences[0].trim() + '.';
                console.log('Found scalp analysis:', result.scalpAnalysis.summary);
              }
            }
          }

          // Extract color analysis
          if (trimmedSection.includes('Color Analysis:')) {
            const colorContent = trimmedSection.replace('Color Analysis:', '').trim();
            if (colorContent) {
              // Try to extract the actual detected color from AI with multiple patterns
              const colorPatterns = [
                /(?:hair\s+color\s+is\s+['"]?([^'"]+)['"]?)/i,
                /(?:detected\s+color[:\s]+([^,\n]+))/i,
                /(?:appears\s+to\s+be\s+([^,\n]+))/i,
                /(?:hair\s+appears\s+to\s+be\s+([^,\n]+))/i,
                /(?:based\s+on\s+.*?,\s+the\s+hair\s+appears\s+to\s+be\s+([^,\n]+))/i,
                /(?:identified\s+as\s+([^,\n]+))/i,
                /(?:color\s+is\s+([^,\n]+))/i,
                /(?:hair\s+appears\s+to\s+be\s+a\s+([^,\n]+))/i,
                /(?:appears\s+to\s+be\s+a\s+([^,\n]+))/i,
                /(?:the\s+hair\s+appears\s+to\s+be\s+a\s+([^,\n]+))/i
              ];
              
              let detectedColor = null;
              for (const pattern of colorPatterns) {
                const match = colorContent.match(pattern);
                if (match && match[1]) {
                  detectedColor = match[1].trim();
                  break;
                }
              }
              
              // If no pattern matched, try to extract color from the first sentence
              if (!detectedColor) {
                const firstSentence = colorContent.split(/[.!?]/)[0];
                // Look for common color words in the first sentence
                const colorWords = ['brown', 'black', 'blonde', 'red', 'auburn', 'gray', 'white', 'brunette'];
                for (const colorWord of colorWords) {
                  if (firstSentence.toLowerCase().includes(colorWord)) {
                    detectedColor = colorWord;
                    break;
                  }
                }
              }
              
              // Map detected colors to reference colors
              const colorReference = {
                'dark brown': { name: 'Dark Brown', hex: '#5D4037', reference: 'Similar to L\'Oréal Excellence Creme #3' },
                'rich dark brown': { name: 'Dark Brown', hex: '#5D4037', reference: 'Similar to L\'Oréal Excellence Creme #3' },
                'brown': { name: 'Brown', hex: '#8D6E63', reference: 'Similar to Garnier Nutrisse #4' },
                'light brown': { name: 'Light Brown', hex: '#A1887F', reference: 'Similar to Revlon Colorsilk #5' },
                'black': { name: 'Black', hex: '#212121', reference: 'Similar to Clairol Natural Instincts #1' },
                'blonde': { name: 'Blonde', hex: '#F4E4BC', reference: 'Similar to L\'Oréal Feria #9' },
                'light blonde': { name: 'Light Blonde', hex: '#F5F5DC', reference: 'Similar to Garnier Nutrisse #9' },
                'dark blonde': { name: 'Dark Blonde', hex: '#D2B48C', reference: 'Similar to Revlon Colorsilk #7' },
                'red': { name: 'Red', hex: '#D32F2F', reference: 'Similar to Garnier Olia #6.4' },
                'auburn': { name: 'Auburn', hex: '#8D4E85', reference: 'Similar to Revlon Colorsilk #4R' },
                'gray': { name: 'Gray', hex: '#9E9E9E', reference: 'Similar to Clairol Natural Instincts #5' },
                'white': { name: 'White', hex: '#FAFAFA', reference: 'Similar to L\'Oréal Excellence Creme #10' },
                'brunette': { name: 'Brunette', hex: '#8D6E63', reference: 'Similar to Garnier Nutrisse #4' },
                'strawberry blonde': { name: 'Strawberry Blonde', hex: '#E8B4B8', reference: 'Similar to L\'Oréal Feria #7.4' }
              };
              
              const referenceColor = detectedColor ? 
                colorReference[detectedColor.toLowerCase()] || 
                { name: detectedColor, hex: '#8D6E63', reference: 'Professional color reference' } :
                { name: 'Dark Brown', hex: '#5D4037', reference: 'Similar to L\'Oréal Excellence Creme #3' };
              
              result.colorAnalysis = {
                icon: 'palette',
                status: 'Analyzed',
                summary: `Detected Color: ${referenceColor.name}`,
                detectedColor: referenceColor.name,
                colorHex: referenceColor.hex,
                colorReference: referenceColor.reference
              };
              console.log('Found color analysis:', result.colorAnalysis);
            }
          }

          // Extract recommendations
          if (trimmedSection.includes('Recommendations:')) {
            const recommendationsContent = trimmedSection.replace('Recommendations:', '').trim();
            if (recommendationsContent) {
              const recommendations = recommendationsContent.split('\n').filter(line => 
                line.trim() && line.includes('Recommendation:')
              );
              
              result.recommendations = recommendations.slice(0, 5).map((rec, index) => {
                const textMatch = rec.match(/Recommendation:\s*(.*?)(?:\s*IconHint:|$)/i);
                const iconMatch = rec.match(/IconHint:\s*(\w+)/i);
                
                // Map AI icon hints to valid FontAwesome5 icons
                const iconMapping = {
                  'water-drop': 'tint',
                  'shampoo': 'shower',
                  'conditioner-mask': 'leaf',
                  'hair-thickening': 'seedling',
                  'styling-product': 'magic',
                  'scissors': 'cut',
                  'comb': 'brush',
                  'spray': 'spray-can',
                  'thermometer': 'thermometer-half',
                  'vitamins': 'pills',
                  'massage': 'hands-helping',
                  'water': 'tint',
                  'leaf': 'leaf',
                  'wind': 'wind',
                  'bulb': 'lightbulb',
                  'heart': 'heart',
                  'flame': 'fire',
                  'dry-shampoo': 'spray-can',
                  'heat-protect': 'shield-alt',
                  'detangling': 'brush',
                  'moisturizing': 'tint',
                  'volumizing': 'wind',
                  'deep-conditioning': 'leaf',
                  'trim': 'cut',
                  'serum': 'tint',
                  'mask': 'leaf',
                  'brush': 'brush',
                  'comb': 'brush',
                  'protectant': 'shield-alt',
                  'treatment': 'leaf',
                  'nourishing': 'heart',
                  'repair': 'wrench',
                  'strengthening': 'dumbbell',
                  'smoothing': 'magic',
                  'clarifying': 'shower',
                  'hydrating': 'tint',
                  'thickening': 'seedling',
                  'shine': 'star',
                  'volume': 'wind',
                  'texture': 'magic'
                };
                
                const aiIcon = iconMatch ? iconMatch[1] : ['tint', 'leaf', 'wind', 'lightbulb', 'heart'][index % 5];
                const validIcon = iconMapping[aiIcon] || ['tint', 'leaf', 'wind', 'lightbulb', 'heart'][index % 5];
                
                return {
                  icon: validIcon,
                  text: textMatch ? textMatch[1].trim() : rec.replace('Recommendation:', '').trim(),
                };
              });
              console.log('Found recommendations:', result.recommendations);
            }
          }
        });

        console.log('Final parsed result:', result);
        console.log('=== PARSING DEBUG END ===');
      } catch (error) {
        console.error('Error parsing analysis text:', error);
      }

      return result;
    };

    return parseAnalysisText(analysisText);
  };

  const analysisData = getAnalysisData();

  // If loading profile
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={{ marginTop: 16, color: theme.colors.textPrimary }}>Loading your dashboard...</Text>
      </View>
    );
  }

  // If no analysis yet, show Analyse Now prompt
  if (!analysis) {
    return (
      <View style={styles.root}>
        {/* Logo in top right */}
        <View style={styles.logoContainer}>
          <Image source={require('../../assets/splash.png')} style={styles.splashImage} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Global Hair State */}
          <View style={styles.globalBox}>
            <Text style={styles.globalTitle}>Overall Hair Health</Text>
            <View style={styles.progressCircleContainer}>
              <View style={styles.progressCircleBg}>
                <Text style={styles.globalPercent}>{analysisData.hairState}%</Text>
              </View>
            </View>
          </View>

          {/* Split Box */}
          <View style={styles.splitBox}>
            <View style={styles.splitItem}>
              <MaterialCommunityIcons name={analysisData.colorAnalysis.icon} size={32} color={theme.colors.accent} />
              <Text style={styles.splitTitle}>Color</Text>
              <Text style={styles.splitStatus}>{analysisData.colorAnalysis.status}</Text>
              {analysisData.colorAnalysis.detectedColor ? (
                <View style={styles.colorInfoContainer}>
                  <View 
                    style={[
                      styles.colorSwatch, 
                      { backgroundColor: analysisData.colorAnalysis.colorHex }
                    ]} 
                  />
                  <Text style={styles.colorName}>{analysisData.colorAnalysis.detectedColor}</Text>
                  <Text style={styles.colorReference}>{analysisData.colorAnalysis.colorReference}</Text>
                </View>
              ) : (
                <Text style={styles.splitSummary}>{analysisData.colorAnalysis.summary}</Text>
              )}
            </View>
            <View style={styles.splitDivider} />
            <View style={styles.splitItem}>
              <MaterialCommunityIcons name={analysisData.scalpAnalysis.icon} size={32} color={theme.colors.accent} />
              <Text style={styles.splitTitle}>Scalp</Text>
              <Text style={styles.splitStatus}>{analysisData.scalpAnalysis.status}</Text>
              <Text style={styles.splitSummary}>{analysisData.scalpAnalysis.summary}</Text>
            </View>
          </View>

          {/* Recommendations */}
          <View style={styles.recommendBox}>
            <Text style={styles.recommendTitle}>Recommendations</Text>
            <View style={styles.recommendList}>
              {analysisData.recommendations.map((rec, idx) => (
                <View key={idx} style={styles.recommendItem}>
                  <FontAwesome5 name={rec.icon} size={22} color={theme.colors.accent} style={{ marginRight: 12 }} />
                  <Text style={styles.recommendText}>{rec.text}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Trending Recipes */}
          <View style={styles.trendingBox}>
            <Text style={styles.trendingTitle}>Trending Recipes</Text>
            <FlatList
              data={trendingRecipes}
              keyExtractor={item => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.recipeItem} onPress={() => handleRecipePress(item)}>
                  <Image source={item.image} style={styles.recipeImage} />
                  <Text style={styles.recipeTitle}>{item.title}</Text>
                </TouchableOpacity>
              )}
              horizontal={false}
              scrollEnabled={false}
            />
          </View>

          {/* Analyse Now Button */}
          <TouchableOpacity 
            style={styles.analyseButton}
            onPress={handleAnalyseNow}
            disabled={analysing}
          >
            {analysing ? (
              <ActivityIndicator size="small" color={theme.colors.textPrimary} />
            ) : (
              <Text style={styles.analyseButtonText}>Analyse Now</Text>
            )}
          </TouchableOpacity>
        </ScrollView>

        {/* Recipe Modal */}
        <Modal visible={!!selectedRecipe} animationType="slide" transparent onRequestClose={handleRecipeClose}>
          <View style={styles.recipeModalOverlay}>
            <View style={styles.recipeModalBox}>
              <Text style={styles.recipeModalTitle}>{selectedRecipe?.title}</Text>
              <Text style={styles.recipeModalDetails}>{selectedRecipe?.details}</Text>
              <TouchableOpacity style={styles.recipeModalClose} onPress={handleRecipeClose}>
                <Text style={{ color: theme.colors.primary, fontWeight: 'bold' }}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      {/* Logo in top right */}
      <View style={styles.logoContainer}>
        <Image source={require('../../assets/splash.png')} style={styles.splashImage} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Global Hair State */}
        <View style={styles.globalBox}>
          <Text style={styles.globalTitle}>Overall Hair Health</Text>
          <View style={styles.progressCircleContainer}>
            <View style={styles.progressCircleBg}>
              <Text style={styles.globalPercent}>{analysisData.hairState}%</Text>
            </View>
          </View>
        </View>

        {/* Split Box */}
        <View style={styles.splitBox}>
          <View style={styles.splitItem}>
            <MaterialCommunityIcons name={analysisData.colorAnalysis.icon} size={32} color={theme.colors.accent} />
            <Text style={styles.splitTitle}>Color</Text>
            <Text style={styles.splitStatus}>{analysisData.colorAnalysis.status}</Text>
            {analysisData.colorAnalysis.detectedColor ? (
              <View style={styles.colorInfoContainer}>
                <View 
                  style={[
                    styles.colorSwatch, 
                    { backgroundColor: analysisData.colorAnalysis.colorHex }
                  ]} 
                />
                <Text style={styles.colorName}>{analysisData.colorAnalysis.detectedColor}</Text>
                <Text style={styles.colorReference}>{analysisData.colorAnalysis.colorReference}</Text>
              </View>
            ) : (
              <Text style={styles.splitSummary}>{analysisData.colorAnalysis.summary}</Text>
            )}
          </View>
          <View style={styles.splitDivider} />
          <View style={styles.splitItem}>
            <MaterialCommunityIcons name={analysisData.scalpAnalysis.icon} size={32} color={theme.colors.accent} />
            <Text style={styles.splitTitle}>Scalp</Text>
            <Text style={styles.splitStatus}>{analysisData.scalpAnalysis.status}</Text>
            <Text style={styles.splitSummary}>{analysisData.scalpAnalysis.summary}</Text>
          </View>
        </View>

        {/* Recommendations */}
        <View style={styles.recommendBox}>
          <Text style={styles.recommendTitle}>Recommendations</Text>
          <View style={styles.recommendList}>
            {analysisData.recommendations.map((rec, idx) => (
              <View key={idx} style={styles.recommendItem}>
                <FontAwesome5 name={rec.icon} size={22} color={theme.colors.accent} style={{ marginRight: 12 }} />
                <Text style={styles.recommendText}>{rec.text}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Trending Recipes */}
        <View style={styles.trendingBox}>
          <Text style={styles.trendingTitle}>Trending Recipes</Text>
          <FlatList
            data={trendingRecipes}
            keyExtractor={item => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.recipeItem} onPress={() => handleRecipePress(item)}>
                <Image source={item.image} style={styles.recipeImage} />
                <Text style={styles.recipeTitle}>{item.title}</Text>
              </TouchableOpacity>
            )}
            horizontal={false}
            scrollEnabled={false}
          />
        </View>
      </ScrollView>

      {/* Recipe Modal */}
      <Modal visible={!!selectedRecipe} animationType="slide" transparent onRequestClose={handleRecipeClose}>
        <View style={styles.recipeModalOverlay}>
          <View style={styles.recipeModalBox}>
            <Text style={styles.recipeModalTitle}>{selectedRecipe?.title}</Text>
            <Text style={styles.recipeModalDetails}>{selectedRecipe?.details}</Text>
            <TouchableOpacity style={styles.recipeModalClose} onPress={handleRecipeClose}>
              <Text style={{ color: theme.colors.primary, fontWeight: 'bold' }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    paddingTop: 80,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  globalBox: {
    borderRadius: theme.borderRadius.lg,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    backgroundColor: theme.colors.surface,
    ...theme.shadows.medium,
    borderWidth: 1,
    borderColor: theme.colors.accentGlow,
  },
  globalTitle: {
    fontSize: theme.fontSizes.lg,
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.title,
    marginBottom: 8,
    fontWeight: 'bold',
  },
  progressCircleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressCircleBg: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 8,
    borderColor: theme.colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(244, 162, 97, 0.1)',
    ...theme.shadows.glow,
  },
  globalPercent: {
    fontSize: 32,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.title,
  },
  splitBox: {
    flexDirection: 'row',
    borderRadius: theme.borderRadius.lg,
    marginBottom: 24,
    backgroundColor: theme.colors.surface,
    ...theme.shadows.medium,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.accentGlow,
  },
  splitItem: {
    flex: 1,
    alignItems: 'center',
    padding: 18,
    backgroundColor: theme.colors.surface,
  },
  splitDivider: {
    width: 1,
    backgroundColor: theme.colors.accentGlow,
    opacity: 0.3,
  },
  splitTitle: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.title,
    marginTop: 8,
    marginBottom: 2,
    fontWeight: 'bold',
  },
  splitStatus: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.success,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  splitSummary: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    fontFamily: theme.fonts.body,
  },
  recommendBox: {
    borderRadius: theme.borderRadius.lg,
    padding: 18,
    marginBottom: 24,
    backgroundColor: theme.colors.surface,
    ...theme.shadows.medium,
    borderWidth: 1,
    borderColor: theme.colors.accentGlow,
  },
  recommendTitle: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.title,
    marginBottom: 8,
    fontWeight: 'bold',
  },
  recommendList: {
    flexDirection: 'column',
  },
  recommendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingVertical: 4,
  },
  recommendText: {
    fontSize: theme.fontSizes.body,
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.body,
    flex: 1,
  },
  trendingBox: {
    borderRadius: theme.borderRadius.lg,
    padding: 18,
    marginBottom: 24,
    backgroundColor: theme.colors.surface,
    ...theme.shadows.medium,
    borderWidth: 1,
    borderColor: theme.colors.accentGlow,
  },
  trendingTitle: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.title,
    marginBottom: 8,
    fontWeight: 'bold',
  },
  recipeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(244, 162, 97, 0.1)',
    borderRadius: theme.borderRadius.md,
    padding: 12,
    marginBottom: 10,
    ...theme.shadows.soft,
    borderWidth: 1,
    borderColor: theme.colors.accent,
  },
  recipeImage: {
    width: 50,
    height: 50,
    borderRadius: theme.borderRadius.sm,
    marginRight: 12,
  },
  recipeTitle: {
    fontSize: theme.fontSizes.body,
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.body,
    fontWeight: '600',
  },
  analyseButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.lg,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginTop: 16,
    ...theme.shadows.medium,
    borderWidth: 1,
    borderColor: theme.colors.accentGlow,
  },
  analyseButtonText: {
    color: theme.colors.textPrimary,
    fontSize: theme.fontSizes.md,
    fontWeight: 'bold',
    fontFamily: theme.fonts.body,
  },
  recipeModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(26, 28, 29, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  recipeModalBox: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: 24,
    width: '100%',
    maxWidth: 300,
    ...theme.shadows.medium,
    borderWidth: 1,
    borderColor: theme.colors.accentGlow,
  },
  recipeModalTitle: {
    fontSize: theme.fontSizes.lg,
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.title,
    marginBottom: 12,
    fontWeight: 'bold',
  },
  recipeModalDetails: {
    fontSize: theme.fontSizes.body,
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.body,
    marginBottom: 20,
    lineHeight: 20,
  },
  recipeModalClose: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    ...theme.shadows.soft,
  },
  // Color analysis styles
  colorInfoContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  colorSwatch: {
    width: 30,
    height: 30,
    borderRadius: theme.borderRadius.sm,
    marginBottom: 4,
    borderWidth: 2,
    borderColor: theme.colors.accentGlow,
    ...theme.shadows.soft,
  },
  colorName: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textPrimary,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 2,
    fontFamily: theme.fonts.body,
  },
  colorReference: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    opacity: 0.8,
    fontFamily: theme.fonts.body,
  },
  placeholderText: {
    fontSize: theme.fontSizes.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    fontFamily: theme.fonts.body,
  },
  // DashboardCard styles
  dashboardCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: 18,
    marginBottom: 16,
    ...theme.shadows.medium,
    borderWidth: 1,
    borderColor: theme.colors.accentGlow,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.title,
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.success,
  },
  statusText: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textPrimary,
    fontWeight: 'bold',
    fontFamily: theme.fonts.body,
  },
  cardContent: {
    // Content styles are handled by children
  },
  analysisContent: {
    padding: 16,
  },
  colorDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorInfo: {
    flex: 1,
  },
  colorName: {
    fontSize: theme.fontSizes.body,
    color: theme.colors.textPrimary,
    fontWeight: 'bold',
    marginBottom: 4,
    fontFamily: theme.fonts.body,
  },
  colorReference: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.body,
  },
  logoContainer: {
    position: 'absolute',
    top: 20,
    right: 20,
  },
  splashImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
});

export default HomeScreen;
