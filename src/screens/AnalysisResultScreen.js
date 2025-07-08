import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, ActivityIndicator } from 'react-native';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import theme from '../styles/theme';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from '../i18n';
import { getHairAnalysisById } from '../services/SupabaseService';
import Footer from '../components/Footer';

const AnalysisResultScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { t } = useTranslation();
  const { type, question, answer, imageUrl, colorAnalysis, analysisId } = route.params || {};
  
  const [analysisData, setAnalysisData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // If we have analysisId, fetch the analysis data from database
    if (analysisId && !answer) {
      fetchAnalysisData();
    }
  }, [analysisId]);

  const fetchAnalysisData = async () => {
    setLoading(true);
    try {
      const { data } = await getHairAnalysisById(analysisId);
      if (data) {
        setAnalysisData(data);
      }
    } catch (error) {
      console.error('Error fetching analysis data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to parse analysis text (similar to HomeScreen)
  const parseAnalysisText = (text) => {
    if (!text) return null;

    try {
      // Extract hair state score - handle both English and Arabic
      const hairStatePatterns = [
        /Global Hair State Score:\s*(\d+)%/i,
        /الدرجة العالمية لحالة الشعر:\s*(\d+)%/i,
        /(\d+)%/  // Fallback: any percentage
      ];
      
      let hairState = 75; // Default
      for (const pattern of hairStatePatterns) {
        const match = text.match(pattern);
        if (match && match[1]) {
          hairState = parseInt(match[1]);
          break;
        }
      }

      // Extract color details
      const colorPatterns = [
        /Detailed Color Analysis[:：\-\s]*([\s\S]*?)(?=\*\*|$)/i,
        /Color Analysis[:：\-\s]*([\s\S]*?)(?=\*\*|$)/i
      ];
      let colorInfo = null;
      for (const pattern of colorPatterns) {
        const match = text.match(pattern);
        if (match && match[1]) {
          const colorContent = match[1].trim();
          // Extract detected color
          const detectedColorMatch = colorContent.match(/Detected Color[:：\-\s]*([^\n]+)/i);
          const colorReferenceMatch = colorContent.match(/Color Reference[:：\-\s]*([^\n]+)/i);
          const hexMatch = colorContent.match(/Hex Code[:：\-\s]*([^\n]+)/i);
          const summaryMatch = colorContent.match(/Summary[:：\-\s]*([^\n]+)/i);
          colorInfo = {
            detectedColor: detectedColorMatch ? detectedColorMatch[1].trim() : '',
            colorReference: colorReferenceMatch ? colorReferenceMatch[1].trim() : '',
            colorHex: hexMatch ? hexMatch[1].split('and')[0].trim() : '',
            summary: summaryMatch ? summaryMatch[1].trim() : '',
          };
          break;
        }
      }

      // Extract scalp details
      const scalpPatterns = [
        /Detailed Scalp Analysis[:：\-\s]*([\s\S]*?)(?=\*\*|$)/i,
        /تحليل\s*مفصل\s*لفروة\s*الرأس[:：\-\s]*([\s\S]*?)(?=\*\*|$)/i
      ];
      let scalpInfo = '';
      for (const pattern of scalpPatterns) {
        const match = text.match(pattern);
        if (match && match[1]) {
          scalpInfo = match[1].trim();
          break;
        }
      }

      return {
        hairState,
        colorInfo,
        scalpInfo,
        fullText: text
      };
    } catch (error) {
      console.error('Error parsing analysis text:', error);
      return null;
    }
  };

  // Get the analysis content to display
  const getAnalysisContent = () => {
    if (answer) {
      // Direct answer from route params
      return {
        question: question || t('hair_analysis'),
        answer: answer,
        imageUrl: imageUrl,
        colorAnalysis: colorAnalysis
      };
    } else if (analysisData) {
      // Analysis data from database
      const parsed = parseAnalysisText(analysisData.analysis_data?.ai_response);
      return {
        question: t('comprehensive_hair_analysis'),
        answer: analysisData.analysis_data?.ai_response || t('analysis_not_available'),
        imageUrl: analysisData.image_url,
        colorAnalysis: parsed?.colorInfo,
        hairState: parsed?.hairState,
        scalpInfo: parsed?.scalpInfo
      };
    }
    return null;
  };

  const content = getAnalysisContent();

  // Recommendations icon mapping
  const iconMap = {
    'shampoo': 'bottle-shampoo',
    'scissors': 'content-cut',
    'cream': 'bottle-tonic',
    'serum': 'bottle-tonic-plus',
    'heat': 'hair-dryer',
    'vitamins': 'pill',
    'shower': 'shower',
    'hair_mask': 'face-woman-shimmer',
    'soap': 'soap',
    'doctor': 'doctor',
    'oil_bottle': 'bottle-tonic',
    'droplet': 'tint',
    'water': 'tint',
    'mask': 'face-woman-shimmer',
    'palette': 'palette',
    'fire': 'fire',
    'default': 'lightbulb',
  };

  const emojiToIconMap = {
    '💧': { name: 'tint', lib: 'FontAwesome5' },
    '⚠️': { name: 'alert', lib: 'MaterialCommunityIcons' },
    '✂️': { name: 'content-cut', lib: 'MaterialCommunityIcons' },
    '🌿': { name: 'leaf', lib: 'FontAwesome5' },
    '💆‍♂️': { name: 'account-heart', lib: 'MaterialCommunityIcons' },
    // ...add more as needed
  };

  const arabicIconMap = {
    'شامبو': { name: 'bottle-shampoo', lib: 'MaterialCommunityIcons' },
    'مجفف': { name: 'hair-dryer', lib: 'MaterialCommunityIcons' },
    'مجفف الشعر': { name: 'hair-dryer', lib: 'MaterialCommunityIcons' },
    'فاكهة': { name: 'food-apple', lib: 'MaterialCommunityIcons' },
    'قناع': { name: 'face-woman-shimmer', lib: 'MaterialCommunityIcons' },
    'قناع الشعر': { name: 'face-woman-shimmer', lib: 'MaterialCommunityIcons' },
    'منتجات': { name: 'flask', lib: 'MaterialCommunityIcons' },
    'منتجات كيميائية': { name: 'flask', lib: 'MaterialCommunityIcons' },
  };

  // Helper: check if a string is an emoji
  const isEmoji = (str) => /[\u{1F300}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u.test(str);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>{t('loading_analysis')}</Text>
      </View>
    );
  }

  if (!content) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>{t('analysis_not_found')}</Text>
      </View>
    );
  }

  return (
    <LinearGradient colors={[theme.colors.primary, theme.colors.accent, theme.colors.background]} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
          <Text style={styles.title}>{t('analysis_result')}</Text>
        </View>

        {/* Result Card */}
        <LinearGradient colors={[theme.colors.card, theme.colors.background]} style={styles.resultCard}>
          {/* Image */}
          {content.imageUrl && (
            <View style={styles.imageContainer}>
              <Image source={{ uri: content.imageUrl }} style={styles.resultImage} />
            </View>
          )}

          {/* Question */}
          <View style={styles.questionSection}>
            <View style={styles.questionHeader}>
              <Ionicons name="help-circle" size={24} color={theme.colors.primary} />
              <Text style={styles.questionLabel}>{t('analysis_type')}</Text>
            </View>
            <Text style={styles.questionText}>{content.question}</Text>
          </View>

          {/* Hair State Score */}
          {content.hairState && (
            <View style={styles.hairStateSection}>
              <View style={styles.hairStateHeader}>
                <Ionicons name="analytics" size={24} color={theme.colors.accent} />
                <Text style={styles.hairStateLabel}>{t('hair_health_score')}</Text>
              </View>
              <View style={styles.hairStateScore}>
                <Text style={styles.hairStatePercent}>{content.hairState}%</Text>
              </View>
            </View>
          )}

          {/* Answer */}
          <View style={styles.answerSection}>
            <View style={styles.answerHeader}>
              <Ionicons name="bulb" size={24} color={theme.colors.accent} />
              <Text style={styles.answerLabel}>{t('ai_analysis')}</Text>
            </View>
            <Text style={styles.answerText}>{content.answer}</Text>
          </View>

          {/* Color Analysis & Preview */}
          {content.colorAnalysis && (
            <View style={styles.colorPreviewSection}>
              <Text style={styles.colorPreviewLabel}>{t('analyzed_color')}</Text>
              {content.colorAnalysis.colorHex && (
                <View style={[styles.colorSwatch, { backgroundColor: content.colorAnalysis.colorHex }]} />
              )}
              <Text style={styles.colorReferenceText}>{content.colorAnalysis.detectedColor}</Text>
              <Text style={styles.colorSummaryText}>{content.colorAnalysis.colorReference}</Text>
              <Text style={styles.colorSummaryText}>{content.colorAnalysis.summary}</Text>
            </View>
          )}

          {/* Scalp Analysis */}
          {content.scalpInfo && (
            <View style={styles.colorPreviewSection}>
              <Text style={styles.colorPreviewLabel}>{t('scalp_analysis')}</Text>
              <Text style={styles.colorSummaryText}>{content.scalpInfo}</Text>
            </View>
          )}

          {/* Recommendations */}
          {content.recommendations && content.recommendations.length > 0 && (
            <View style={styles.recommendBox}>
              <Text style={styles.recommendTitle}>{t('recommendations')}</Text>
              <View style={styles.recommendList}>
                {content.recommendations.map((rec, idx) => {
                  let iconHint = rec.icon || 'default';
                  let recText = rec.text || rec;
                  // Remove IconHint and extract value (for all languages)
                  recText = recText.replace(/IconHint[:：]?\s*([\w\u0600-\u06FF-\u1F300-\u1F6FF]+)/gi, '').trim();
                  // Remove 'Recommendation:', 'توصية:', and variants
                  recText = recText.replace(/^(\*\*?Recommendation:?\*\*?|Recommendation:?|توصية:?)/i, '').trim();
                  if (!recText) return null;
                  // Render emoji as text, else use icon library (Arabic or English)
                  let iconElement = null;
                  if (isEmoji(iconHint)) {
                    iconElement = <Text style={{ fontSize: 22, marginRight: 12 }}>{iconHint}</Text>;
                  } else if (arabicIconMap[iconHint]) {
                    const { name, lib } = arabicIconMap[iconHint];
                    if (lib === 'MaterialCommunityIcons') {
                      iconElement = <MaterialCommunityIcons name={name} size={22} color={theme.colors.accent} style={{ marginRight: 12 }} />;
                    } else if (lib === 'FontAwesome5') {
                      iconElement = <FontAwesome5 name={name} size={22} color={theme.colors.accent} style={{ marginRight: 12 }} />;
                    }
                  } else if (emojiToIconMap[iconHint]) {
                    const { name, lib } = emojiToIconMap[iconHint];
                    if (lib === 'FontAwesome5') {
                      iconElement = <FontAwesome5 name={name} size={22} color={theme.colors.accent} style={{ marginRight: 12 }} />;
                    } else if (lib === 'MaterialCommunityIcons') {
                      iconElement = <MaterialCommunityIcons name={name} size={22} color={theme.colors.accent} style={{ marginRight: 12 }} />;
                    }
                  } else {
                    iconElement = <MaterialCommunityIcons name={iconMap[iconHint] || iconMap['default']} size={22} color={theme.colors.accent} style={{ marginRight: 12 }} />;
                  }
                  return (
                    <View key={idx} style={styles.recommendItem}>
                      {iconElement}
                      <Text style={styles.recommendText}>{recText}</Text>
                    </View>
                  );
                })}
              </View>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => navigation.navigate('Analyse')}
            >
              <Ionicons name="refresh" size={20} color={theme.colors.card} />
              <Text style={styles.actionButtonText}>{t('new_analysis')}</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionButton, styles.secondaryButton]}
              onPress={() => navigation.navigate('MainTabs')}
            >
              <Ionicons name="home" size={20} color={theme.colors.primary} />
              <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>{t('go_to_dashboard')}</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </ScrollView>
      <Footer />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    backgroundColor: theme.colors.surface,
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    ...theme.shadows.medium,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.accentGlow,
  },
  headerTitle: {
    fontSize: theme.fontSizes.xl,
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.title,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.body,
    textAlign: 'center',
  },
  scrollContent: {
    padding: 20,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  analysisImage: {
    width: 200,
    height: 200,
    borderRadius: theme.borderRadius.lg,
    marginBottom: 16,
    ...theme.shadows.medium,
    borderWidth: 2,
    borderColor: theme.colors.accentGlow,
  },
  questionCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: 20,
    marginBottom: 24,
    ...theme.shadows.medium,
    borderWidth: 1,
    borderColor: theme.colors.accentGlow,
  },
  questionTitle: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.accent,
    fontFamily: theme.fonts.title,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  questionText: {
    fontSize: theme.fontSizes.body,
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.body,
    lineHeight: 22,
  },
  resultCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: 20,
    marginBottom: 24,
    ...theme.shadows.medium,
    borderWidth: 1,
    borderColor: theme.colors.accentGlow,
  },
  resultTitle: {
    fontSize: theme.fontSizes.lg,
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.title,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  resultText: {
    fontSize: theme.fontSizes.body,
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.body,
    lineHeight: 24,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  actionButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.lg,
    paddingVertical: 14,
    paddingHorizontal: 20,
    flex: 1,
    marginHorizontal: 8,
    alignItems: 'center',
    ...theme.shadows.medium,
    borderWidth: 1,
    borderColor: theme.colors.accentGlow,
  },
  actionButtonText: {
    color: theme.colors.textPrimary,
    fontSize: theme.fontSizes.md,
    fontWeight: 'bold',
    fontFamily: theme.fonts.body,
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 10,
    backgroundColor: theme.colors.surface,
    borderRadius: 24,
    padding: 8,
    ...theme.shadows.soft,
    borderWidth: 1,
    borderColor: theme.colors.accentGlow,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: theme.colors.textPrimary,
    fontSize: theme.fontSizes.md,
    fontFamily: theme.fonts.body,
    marginTop: 16,
  },
  resultImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  questionSection: {
    marginBottom: 24,
  },
  questionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  questionLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginLeft: 8,
  },
  answerSection: {
    marginBottom: 32,
  },
  answerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  answerLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.accent,
    marginLeft: 8,
  },
  answerText: {
    fontSize: 16,
    color: theme.colors.textPrimary,
    lineHeight: 24,
    backgroundColor: theme.colors.background,
    padding: 16,
    borderRadius: 12,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  secondaryButtonText: {
    color: theme.colors.primary,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  colorPreviewSection: {
    marginTop: 24,
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: 16,
    ...theme.shadows.soft,
    borderWidth: 1,
    borderColor: theme.colors.accentGlow,
  },
  colorPreviewLabel: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.primary,
    fontFamily: theme.fonts.title,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  colorSwatch: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: theme.colors.accentGlow,
    marginBottom: 8,
  },
  colorReferenceText: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.body,
    marginBottom: 4,
  },
  colorSummaryText: {
    fontSize: theme.fontSizes.body,
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.body,
    textAlign: 'center',
  },
  hairStateSection: {
    marginBottom: 24,
  },
  hairStateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  hairStateLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.accent,
    marginLeft: 8,
  },
  hairStateScore: {
    backgroundColor: theme.colors.background,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  hairStatePercent: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.primary,
    fontFamily: theme.fonts.title,
  },
  recommendBox: {
    marginTop: 24,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: 16,
    ...theme.shadows.soft,
    borderWidth: 1,
    borderColor: theme.colors.accentGlow,
  },
  recommendTitle: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.primary,
    fontFamily: theme.fonts.title,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  recommendList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  recommendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
    marginBottom: 8,
  },
  recommendText: {
    fontSize: theme.fontSizes.body,
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.body,
  },
});

export default AnalysisResultScreen;
