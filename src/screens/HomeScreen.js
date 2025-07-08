import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Modal, FlatList, Dimensions, ActivityIndicator, Alert } from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import theme from '../styles/theme';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { getProfile, getHairAnalysisResult, saveHairAnalysisResult, getTrendingRecipes } from '../services/SupabaseService';
import { getHairAnalysis } from '../services/AIService';
import i18n from '../i18n';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from '../i18n';
import { I18nManager } from 'react-native';
import Footer from '../components/Footer';

const { width } = Dimensions.get('window');

// Safe translation function
const t = (key) => {
  try {
    return i18n.t(key) || key;
  } catch (error) {
    console.log('Translation error for key:', key, error);
    return key;
  }
};

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
  status: t('not_analyzed'),
  icon: 'help-circle',
  summary: t('upload_images_for_analysis'),
};
const defaultColorAnalysis = {
  status: t('not_analyzed'),
  icon: 'help-circle',
  summary: t('upload_images_for_analysis'),
};
const defaultRecommendations = [
  { icon: 'camera', text: 'Upload hair images from all angles' },
  { icon: 'chart-line', text: 'Get AI-powered hair analysis' },
  { icon: 'lightbulb', text: 'Receive personalized recommendations' },
];

const HomeScreen = () => {
  const navigation = useNavigation();
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [analysing, setAnalysing] = useState(false);
  const [trendingRecipes, setTrendingRecipes] = useState([]);
  const [recipesLoading, setRecipesLoading] = useState(true);

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

  const fetchRecipes = useCallback(async () => {
    setRecipesLoading(true);
    try {
      const { data: recipes, error } = await getTrendingRecipes(6);
      if (error) {
        console.error('Error fetching recipes:', error);
      } else {
        setTrendingRecipes(recipes || []);
      }
    } catch (error) {
      console.error('Error fetching recipes:', error);
    }
    setRecipesLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
    fetchRecipes();
  }, [fetchData, fetchRecipes]);

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

  // Helper function to get text direction based on content
  const getTextDirection = (text) => {
    if (!text) return 'ltr';
    // Check if text contains Arabic characters
    const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
    return arabicRegex.test(text) ? 'rtl' : 'ltr';
  };

  // Helper function to get analysis data with fallbacks
  const getAnalysisData = () => {
    if (!analysis) {
      return {
        hairState: defaultHairState,
        scalpAnalysis: defaultScalpAnalysis,
        colorAnalysis: defaultColorAnalysis,
        recommendations: defaultRecommendations,
        analysisFailed: false,
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
        analysisFailed: true,
      };
    }

    if (!analysisText) {
      console.log('No analysis text found');
      return {
        hairState: defaultHairState,
        scalpAnalysis: defaultScalpAnalysis,
        colorAnalysis: defaultColorAnalysis,
        recommendations: defaultRecommendations,
        analysisFailed: true,
      };
    }

    // Parse the text-based AI response
    const parseAnalysisText = (text) => {
      // Detect analysis failure (stricter: only if the whole response matches a known failure message)
      const failureIndicators = [
        'unable to analyze', 'technical issues', 'cannot provide', 'no data', 'general advice', 'not tailored', 'without the ability to analyze', 'lack of analytical data', 'no specific observations', 'no analysis', t('not_analyzed'), 'not available', 'not enough information', 'not enough data', 'no images', t('images_not_analyzed'), 'analysis failed',
        // Arabic failure indicators
        'لا يمكن تحليل', 'مشاكل تقنية', 'لا يمكن تقديم', 'لا توجد بيانات', 'نصائح عامة', 'غير مخصص', 'بدون القدرة على التحليل', 'نقص في البيانات التحليلية', 'لا توجد ملاحظات محددة', 'لا يوجد تحليل', 'غير متاح', 'لا توجد معلومات كافية', 'لا توجد بيانات كافية', 'لا توجد صور', 'فشل التحليل'
      ];
      const normalizedText = text.toLowerCase().replace(/[\s\n\r]+/g, ' ').trim();
      const analysisFailed = failureIndicators.some(indicator => normalizedText === indicator.toLowerCase());

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
        analysisFailed,
      };

      try {
        // Extract hair state score - handle both English and Arabic
        const hairStatePatterns = [
          /Global Hair State Score:\s*(\d+)%/i,
          /الدرجة العالمية لحالة الشعر:\s*(\d+)%/i,
          /(\d+)%/  // Fallback: any percentage
        ];
        
        for (const pattern of hairStatePatterns) {
          const match = text.match(pattern);
          if (match && match[1]) {
            result.hairState = parseInt(match[1]);
            console.log('Found hair state:', result.hairState);
            break;
          }
        }

        // Extract scalp analysis - handle both English and Arabic
        const scalpPatterns = [
          /تحليل\s*مفصل\s*لفروة\s*الرأس[:：\-\s]*([^*]+?)(?=\*\*|$)/is,
          /Detailed Scalp Analysis[:：\-\s]*([^*]+?)(?=\*\*|$)/is
        ];
        
        for (const pattern of scalpPatterns) {
          const match = text.match(pattern);
          if (match && match[1]) {
            const scalpContent = match[1].trim();
            const sentences = scalpContent.split(/[.!?؟]+/).filter(s => s.trim().length > 10);
            if (sentences.length > 0) {
              result.scalpAnalysis.summary = sentences[0].trim() + (sentences[0].endsWith('.') ? '' : '.');
              console.log('Found scalp analysis:', result.scalpAnalysis.summary);
              break;
            }
          }
        }

        // Extract color analysis - handle both English and Arabic
        const colorPatterns = [
          /تحليل\s*مفصل\s*للون[:：\-\s]*([\s\S]*?)(?=[*'"\s]+(?:التوصيات:|\*+|$))/i,
          /Color Analysis[:：\-\s]*([\s\S]*?)(?=[*'"\s]+(?:Recommendations:|\*+|$))/i
        ];
        
        console.log('Trying to extract color analysis...');
        for (const pattern of colorPatterns) {
          const match = text.match(pattern);
          console.log('Color pattern match:', match);
          if (match && match[1]) {
            const colorContent = match[1].trim();
            console.log('Color content found:', colorContent);
            
            // Try to extract the actual detected color from AI with multiple patterns
            const colorDetectionPatterns = [
              // English patterns
              /(?:hair\s+color\s+is\s+['"]?([^'"]+)['"]?)/i,
              /(?:detected\s+color[:\s]+([^,\n]+))/i,
              /(?:appears\s+to\s+be\s+([^,\n]+))/i,
              /(?:hair\s+appears\s+to\s+be\s+([^,\n]+))/i,
              /(?:based\s+on\s+.*?,\s+the\s+hair\s+appears\s+to\s+be\s+([^,\n]+))/i,
              /(?:identified\s+as\s+([^,\n]+))/i,
              /(?:color\s+is\s+([^,\n]+))/i,
              /(?:hair\s+appears\s+to\s+be\s+a\s+([^,\n]+))/i,
              /(?:appears\s+to\s+be\s+a\s+([^,\n]+))/i,
              /(?:the\s+hair\s+appears\s+to\s+be\s+a\s+([^,\n]+))/i,
              // Arabic patterns
              /(?:اللون المكتشف:\s*([^,\n]+))/i,
              /(?:يبدو أن لون الشعر\s+([^,\n]+))/i,
              /(?:لون الشعر\s+([^,\n]+))/i,
              /(?:اللون\s+([^,\n]+))/i,
              /(?:يبدو أن الشعر\s+([^,\n]+))/i
            ];
            
            let detectedColor = null;
            let colorHex = null;
            
            // First try to extract hex code
            const hexMatch = colorContent.match(/رمز اللون السداسي:\s*#([A-Fa-f0-9]{6})/i);
            if (hexMatch) {
              colorHex = '#' + hexMatch[1];
              console.log('Found hex color:', colorHex);
            }
            
            // Then try to extract detected color
            for (const colorPattern of colorDetectionPatterns) {
              const colorMatch = colorContent.match(colorPattern);
              if (colorMatch && colorMatch[1]) {
                detectedColor = colorMatch[1].trim();
                console.log('Found detected color:', detectedColor);
                break;
              }
            }
            
            // If no pattern matched, try to extract color from the first sentence
            if (!detectedColor) {
              const firstSentence = colorContent.split(/[.!?؟]/)[0];
              // Look for common color words in the first sentence (English and Arabic)
              const colorWords = [
                'brown', 'black', 'blonde', 'red', 'auburn', 'gray', 'white', 'brunette',
                'بني', 'أسود', 'أشقر', 'أحمر', 'رمادي', 'أبيض', 'كستنائي'
              ];
              for (const colorWord of colorWords) {
                if (firstSentence.toLowerCase().includes(colorWord)) {
                  detectedColor = colorWord;
                  break;
                }
              }
            }
            
            // Map detected colors to reference colors (including Arabic colors)
            const colorReference = {
              // English colors
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
              'strawberry blonde': { name: 'Strawberry Blonde', hex: '#E8B4B8', reference: 'Similar to L\'Oréal Feria #7.4' },
              // Arabic colors
              'أحمر ناري': { name: 'Fiery Red', hex: '#FF3737', reference: 'Similar to Garnier Olia #6.4' },
              'أحمر': { name: 'Red', hex: '#D32F2F', reference: 'Similar to Garnier Olia #6.4' },
              'بني': { name: 'Brown', hex: '#8D6E63', reference: 'Similar to Garnier Nutrisse #4' },
              'بني داكن': { name: 'Dark Brown', hex: '#5D4037', reference: 'Similar to L\'Oréal Excellence Creme #3' },
              'بني فاتح': { name: 'Light Brown', hex: '#A1887F', reference: 'Similar to Revlon Colorsilk #5' },
              'أسود': { name: 'Black', hex: '#212121', reference: 'Similar to Clairol Natural Instincts #1' },
              'أشقر': { name: 'Blonde', hex: '#F4E4BC', reference: 'Similar to L\'Oréal Feria #9' },
              'أشقر فاتح': { name: 'Light Blonde', hex: '#F5F5DC', reference: 'Similar to Garnier Nutrisse #9' },
              'أشقر داكن': { name: 'Dark Blonde', hex: '#D2B48C', reference: 'Similar to Revlon Colorsilk #7' },
              'رمادي': { name: 'Gray', hex: '#9E9E9E', reference: 'Similar to Clairol Natural Instincts #5' },
              'أبيض': { name: 'White', hex: '#FAFAFA', reference: 'Similar to L\'Oréal Excellence Creme #10' },
              'كستنائي': { name: 'Chestnut', hex: '#8D6E63', reference: 'Similar to Garnier Nutrisse #4' }
            };
            
            let referenceColor = null;
            if (detectedColor && colorReference[detectedColor.toLowerCase()]) {
              referenceColor = colorReference[detectedColor.toLowerCase()];
            } else if (detectedColor) {
              referenceColor = { name: detectedColor, hex: colorHex || '#FF3737' };
            }
            
            result.colorAnalysis = {
              icon: 'palette',
              status: 'Analyzed',
              summary: `Detected Color: ${referenceColor.name}`,
              detectedColor: referenceColor.name,
              colorHex: colorHex || referenceColor.hex,
              colorReference: referenceColor.reference
            };
            console.log('Found color analysis:', result.colorAnalysis);
            break;
          }
        }

        // Extract recommendations - handle both English and Arabic
        const recommendationsPatterns = [
          /التوصيات[:：\-\s]*([\s\S]*?)(?=\n[*'"\s]*\*\*|$)/i,
          /Recommendations[:：\-\s]*([\s\S]*?)(?=\n[*'"\s]*\*\*|$)/i
        ];
        
        console.log('Trying to extract recommendations...');
        for (const pattern of recommendationsPatterns) {
          const match = text.match(pattern);
          console.log('Recommendations pattern match:', match);
          if (match && match[1]) {
            const recommendationsContent = match[1].trim();
            console.log('Recommendations content found:', recommendationsContent);
            // Split by lines that start with a dash or bullet
            const recommendations = recommendationsContent.split(/\n|\r/).filter(line => line.trim().startsWith('-'));
            result.recommendations = recommendations.slice(0, 5).map((rec, index) => {
              // Remove the dash and any leading/trailing whitespace
              let recText = rec.replace(/^[-•\s]+/, '').trim();
              // Extract icon if present
              const iconMatch = recText.match(/IconHint:\s*(\S+)/i);
              let icon = iconMatch ? iconMatch[1] : ['tint', 'leaf', 'wind', 'lightbulb', 'heart'][index % 5];
              recText = recText.replace(/IconHint:\s*\S+/i, '').trim();
              return {
                icon,
                text: recText,
              };
            });
            console.log('Found recommendations:', result.recommendations);
            break;
          }
        }

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

  // Helper to check if user has uploaded all four images
  const hasAllImages = profile && profile.profile_pic_up_url && profile.profile_pic_back_url && profile.profile_pic_left_url && profile.profile_pic_right_url;

  // If loading profile
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={{ marginTop: 16, color: theme.colors.textPrimary }}>{t('loading_dashboard')}</Text>
      </View>
    );
  }

  // If analysis failed, show a clear message and hide results
  if (analysisData.analysisFailed) {
    return (
      <View style={styles.root}>
        
        <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.centralLogoContainer}>
          <Image source={require('../../assets/splash.png')} style={styles.bigLogo} />
        </View>
          <View style={styles.globalBox}>
            <Text style={styles.globalTitle}>{t('analysis_unavailable')}</Text>
            <Text style={{ color: theme.colors.error, fontSize: theme.fontSizes.md, textAlign: 'center', marginTop: 16 }}>
              {t('analysis_error_message')}
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.analyseButton}
            onPress={handleAnalyseNow}
          >
            <Text style={styles.analyseButtonText}>{t('try_analysis_again')}</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  // If no analysis yet, show Analyse Now prompt
  if (!analysis) {
    return (
      <View style={styles.root}>
        <View style={styles.centralLogoContainer}>
          <Image source={require('../../assets/splash.png')} style={styles.bigLogo} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Global Hair State */}
          <View style={styles.globalBox}>
            <Text style={styles.globalTitle}>{t('overall_hair_health')}</Text>
            <View style={styles.progressCircleContainer}>
              <View style={styles.progressCircleBg}>
                <Text style={styles.globalPercent}>{analysisData.hairState}%</Text>
              </View>
            </View>
            {/* Show Analyse Now button if missing images or no analysis */}
            {(!hasAllImages || !analysis) && (
              <TouchableOpacity
                style={[styles.analyseButton, { marginTop: 24 }]}
                onPress={() => navigation.navigate('AnalysisOptionsScreen', { preselect: 'dashboard' })}
              >
                <Text style={styles.analyseButtonText}>{t('analyse_now')}</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Split Box */}
          <View style={styles.splitBox}>
            <View style={styles.splitItem}>
              <MaterialCommunityIcons name={analysisData.colorAnalysis.icon} size={32} color={theme.colors.accent} />
              <Text style={styles.splitTitle}>{t('color')}</Text>
              <Text style={styles.splitStatus}>{t('analyzed')}</Text>
              {analysisData.colorAnalysis.colorHex ? (
                <View style={styles.colorInfoContainer}>
                  <View 
                    style={[
                      styles.colorSwatch, 
                      { backgroundColor: analysisData.colorAnalysis.colorHex }
                    ]} 
                  />
                  <Text style={[styles.colorName, { textAlign: getTextDirection(analysisData.colorAnalysis.detectedColor) }]}>{analysisData.colorAnalysis.detectedColor}</Text>
                  <Text style={[styles.colorReference, { textAlign: getTextDirection(analysisData.colorAnalysis.colorReference) }]}>{analysisData.colorAnalysis.colorReference}</Text>
                </View>
              ) : (
                <Text style={[styles.splitSummary, { textAlign: getTextDirection(analysisData.colorAnalysis.summary) }]}>{analysisData.colorAnalysis.summary}</Text>
              )}
            </View>
            <View style={styles.splitDivider} />
            <View style={styles.splitItem}>
              <MaterialCommunityIcons name={analysisData.scalpAnalysis.icon} size={32} color={theme.colors.accent} />
              <Text style={styles.splitTitle}>{t('scalp')}</Text>
              <Text style={styles.splitStatus}>{t('analyzed')}</Text>
              <Text style={[styles.splitSummary, { textAlign: getTextDirection(analysisData.scalpAnalysis.summary) }]}>{analysisData.scalpAnalysis.summary}</Text>
            </View>
          </View>

          {/* Recommendations */}
          <View style={styles.recommendBox}>
            <Text style={styles.recommendTitle}>{t('recommendations')}</Text>
            <View style={styles.recommendList}>
              {analysisData.recommendations.map((rec, idx) => (
                <View key={idx} style={styles.recommendItem}>
                  <FontAwesome5 name={rec.icon || 'lightbulb'} size={22} color={theme.colors.accent} style={{ marginRight: 12 }} />
                  <Text style={styles.recommendText}>{rec.text}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Trending Recipes */}
          <View style={styles.trendingBox}>
            <Text style={styles.trendingTitle}>{t('trending_recipes')}</Text>
            {recipesLoading ? (
              <ActivityIndicator size="small" color={theme.colors.primary} style={{ marginVertical: 20 }} />
            ) : trendingRecipes.length > 0 ? (
              <View>
                {trendingRecipes.map((item) => (
                  <TouchableOpacity key={item.id} style={styles.recipeItem} onPress={() => handleRecipePress(item)}>
                    <Image 
                      source={require('../../assets/splash.png')} 
                      style={styles.recipeImage} 
                    />
                    <Text style={styles.recipeTitle} numberOfLines={2} ellipsizeMode="tail">
                      {item.title}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <Text style={styles.noRecipesText}>{t('no_recipes')}</Text>
            )}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handleAnalyseNow}
            >
              <Text style={styles.analyseButtonText}>{t('analyse_now')}</Text>
            </TouchableOpacity>

            {analysis && (
              <TouchableOpacity 
                style={[styles.actionButton, styles.secondaryButton]}
                onPress={() => navigation.navigate('AnalysisResult', { analysisId: analysis.id })}
              >
                <Text style={[styles.analyseButtonText, styles.secondaryButtonText]}>{t('view_full_analysis')}</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>

        {/* Recipe Modal */}
        <Modal visible={!!selectedRecipe} animationType="slide" transparent onRequestClose={handleRecipeClose}>
          <View style={styles.recipeModalOverlay}>
            <View style={styles.recipeModalBox}>
              <Text style={styles.recipeModalTitle}>{selectedRecipe?.title}</Text>
              <Text style={styles.recipeModalDescription}>{selectedRecipe?.short_description}</Text>
              
              {selectedRecipe?.ingredients && (
                <View style={styles.recipeSection}>
                  <Text style={styles.recipeSectionTitle}>{t('ingredients')}</Text>
                  {selectedRecipe.ingredients.map((ingredient, index) => (
                    <Text key={index} style={styles.recipeIngredient}>
                      • {ingredient.name}: {ingredient.amount}
                    </Text>
                  ))}
                </View>
              )}
              
              {selectedRecipe?.instructions && (
                <View style={styles.recipeSection}>
                  <Text style={styles.recipeSectionTitle}>{t('instructions')}</Text>
                  {(() => {
                    console.log('DEBUG: instructions type:', typeof selectedRecipe.instructions);
                    console.log('DEBUG: instructions value:', selectedRecipe.instructions);
                    
                    let instructionsArray = [];
                    if (Array.isArray(selectedRecipe.instructions)) {
                      // Handle the malformed array from failed migration
                      const firstItem = selectedRecipe.instructions[0];
                      if (firstItem === '[') {
                        // This is the malformed case - try to reconstruct the JSON
                        const jsonString = selectedRecipe.instructions.join('\n');
                        try {
                          const parsed = JSON.parse(jsonString);
                          instructionsArray = Array.isArray(parsed) ? parsed : [];
                        } catch (e) {
                          // Fallback: filter out brackets and quotes, clean up the array
                          instructionsArray = selectedRecipe.instructions
                            .filter(item => item !== '[' && item !== ']' && item.trim() !== '')
                            .map(item => item.replace(/^[\s"]+|[\s"]+$/g, '')) // Remove quotes and whitespace
                            .filter(item => item.length > 0);
                        }
                      } else {
                        instructionsArray = selectedRecipe.instructions;
                      }
                    } else if (typeof selectedRecipe.instructions === 'string') {
                      // Try to parse as JSON if it's still a string
                      try {
                        const parsed = JSON.parse(selectedRecipe.instructions);
                        instructionsArray = Array.isArray(parsed) ? parsed : [selectedRecipe.instructions];
                      } catch (e) {
                        // Split by newlines if JSON parsing fails
                        instructionsArray = selectedRecipe.instructions.split('\n').filter(line => line.trim());
                      }
                    }
                    
                    return instructionsArray.map((instruction, index) => (
                      <Text key={index} style={styles.recipeInstruction}>
                        {index + 1}. {instruction}
                      </Text>
                    ));
                  })()}
                </View>
              )}
              
              {selectedRecipe?.preparation_time_minutes && (
                <Text style={styles.recipeTime}>
                  ⏱️ Preparation time: {selectedRecipe.preparation_time_minutes} minutes
                </Text>
              )}
              
              {selectedRecipe?.difficulty && (
                <Text style={styles.recipeDifficulty}>
                  📊 Difficulty: {selectedRecipe.difficulty}
                </Text>
              )}
              
              <TouchableOpacity style={styles.recipeModalClose} onPress={handleRecipeClose}>
                <Text style={{ color: '#FFFFFF', fontWeight: 'bold' }}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.centralLogoContainer}>
          <Image source={require('../../assets/splash.png')} style={styles.bigLogo} />
        </View>
        {/* Global Hair State */}
        <View style={styles.globalBox}>
          <Text style={styles.globalTitle}>{t('overall_hair_health')}</Text>
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
            <Text style={styles.splitTitle}>{t('color')}</Text>
            <Text style={styles.splitStatus}>{t('analyzed')}</Text>
            {analysisData.colorAnalysis.colorHex ? (
              <View style={styles.colorInfoContainer}>
                <View 
                  style={[
                    styles.colorSwatch, 
                    { backgroundColor: analysisData.colorAnalysis.colorHex }
                  ]} 
                />
                <Text style={[styles.colorName, { textAlign: getTextDirection(analysisData.colorAnalysis.detectedColor) }]}>{analysisData.colorAnalysis.detectedColor}</Text>
                <Text style={[styles.colorReference, { textAlign: getTextDirection(analysisData.colorAnalysis.colorReference) }]}>{analysisData.colorAnalysis.colorReference}</Text>
              </View>
            ) : (
              <Text style={[styles.splitSummary, { textAlign: getTextDirection(analysisData.colorAnalysis.summary) }]}>{analysisData.colorAnalysis.summary}</Text>
            )}
          </View>
          <View style={styles.splitDivider} />
          <View style={styles.splitItem}>
            <MaterialCommunityIcons name={analysisData.scalpAnalysis.icon} size={32} color={theme.colors.accent} />
            <Text style={styles.splitTitle}>{t('scalp')}</Text>
            <Text style={styles.splitStatus}>{t('analyzed')}</Text>
            <Text style={[styles.splitSummary, { textAlign: getTextDirection(analysisData.scalpAnalysis.summary) }]}>{analysisData.scalpAnalysis.summary}</Text>
          </View>
        </View>

        {/* Recommendations */}
        <View style={styles.recommendBox}>
          <Text style={styles.recommendTitle}>{t('recommendations')}</Text>
          <View style={styles.recommendList}>
            {analysisData.recommendations.map((rec, idx) => (
              <View key={idx} style={styles.recommendItem}>
                <FontAwesome5 name={rec.icon || 'lightbulb'} size={22} color={theme.colors.accent} style={{ marginRight: 12 }} />
                <Text style={styles.recommendText}>{rec.text}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Trending Recipes */}
        <View style={styles.trendingBox}>
          <Text style={styles.trendingTitle}>{t('trending_recipes')}</Text>
          {recipesLoading ? (
            <ActivityIndicator size="small" color={theme.colors.primary} style={{ marginVertical: 20 }} />
          ) : trendingRecipes.length > 0 ? (
            <View>
              {trendingRecipes.map((item) => (
                <TouchableOpacity key={item.id} style={styles.recipeItem} onPress={() => handleRecipePress(item)}>
                  <Image 
                    source={require('../../assets/splash.png')} 
                    style={styles.recipeImage} 
                  />
                  <Text style={styles.recipeTitle} numberOfLines={2} ellipsizeMode="tail">
                    {item.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <Text style={styles.noRecipesText}>{t('no_recipes')}</Text>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleAnalyseNow}
          >
            <Text style={styles.analyseButtonText}>{t('analyse_now')}</Text>
          </TouchableOpacity>

          {analysis && (
            <TouchableOpacity 
              style={[styles.actionButton, styles.secondaryButton]}
              onPress={() => navigation.navigate('AnalysisResult', { analysisId: analysis.id })}
            >
              <Text style={[styles.analyseButtonText, styles.secondaryButtonText]}>{t('view_full_analysis')}</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
      <Footer />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  globalBox: {
    borderRadius: theme.borderRadius.lg,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
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
    height: 80,
    minHeight: 80,
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
    flex: 1,
    flexWrap: 'wrap',
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
  recipeModalDescription: {
    fontSize: theme.fontSizes.body,
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.body,
    marginBottom: 16,
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
  centralLogoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 0,
    marginBottom: 0,
  },
  centralLogo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 0,
  },
  centralLogoLarge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: 'center',
    marginBottom: 4,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.primary,
    fontFamily: theme.fonts.title,
    textAlign: 'center',
    letterSpacing: 1.2,
  },
  bigLogo: {
    width: 180,
    height: 180,
    borderRadius: 90,
    alignSelf: 'center',
    marginBottom: 0,
  },
  noRecipesText: {
    fontSize: theme.fontSizes.body,
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.body,
    textAlign: 'center',
    marginVertical: 20,
  },
  recipeSection: {
    marginBottom: 16,
  },
  recipeSectionTitle: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.title,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  recipeIngredient: {
    fontSize: theme.fontSizes.body,
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.body,
    marginBottom: 4,
    paddingLeft: 8,
  },
  recipeInstruction: {
    fontSize: theme.fontSizes.body,
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.body,
    marginBottom: 8,
    lineHeight: 18,
  },
  recipeTime: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.accent,
    fontFamily: theme.fonts.body,
    marginBottom: 4,
  },
  recipeDifficulty: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.accent,
    fontFamily: theme.fonts.body,
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
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
  secondaryButton: {
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.borderRadius.lg,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    ...theme.shadows.medium,
    borderWidth: 1,
    borderColor: theme.colors.accentGlow,
  },
  secondaryButtonText: {
    color: theme.colors.textPrimary,
    fontSize: theme.fontSizes.md,
    fontWeight: 'bold',
    fontFamily: theme.fonts.body,
  },
});

export default HomeScreen;
