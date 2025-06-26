import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import theme from '../styles/theme';
import { useNavigation, useRoute } from '@react-navigation/native';

const AnalysisResultScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { type, question, answer, imageUrl } = route.params || {};

  return (
    <LinearGradient colors={[theme.colors.primary, theme.colors.accent, theme.colors.background]} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
          <Text style={styles.title}>Analysis Result</Text>
        </View>

        {/* Result Card */}
        <LinearGradient colors={[theme.colors.card, theme.colors.background]} style={styles.resultCard}>
          {/* Image */}
          {imageUrl && (
            <View style={styles.imageContainer}>
              <Image source={{ uri: imageUrl }} style={styles.resultImage} />
            </View>
          )}

          {/* Question */}
          <View style={styles.questionSection}>
            <View style={styles.questionHeader}>
              <Ionicons name="help-circle" size={24} color={theme.colors.primary} />
              <Text style={styles.questionLabel}>Your Question</Text>
            </View>
            <Text style={styles.questionText}>{question}</Text>
          </View>

          {/* Answer */}
          <View style={styles.answerSection}>
            <View style={styles.answerHeader}>
              <Ionicons name="bulb" size={24} color={theme.colors.accent} />
              <Text style={styles.answerLabel}>AI Hair Advisor Response</Text>
            </View>
            <Text style={styles.answerText}>{answer}</Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => navigation.navigate('Analyse')}
            >
              <Ionicons name="refresh" size={20} color={theme.colors.card} />
              <Text style={styles.actionButtonText}>New Analysis</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionButton, styles.secondaryButton]}
              onPress={() => navigation.navigate('Dashboard')}
            >
              <Ionicons name="home" size={20} color={theme.colors.primary} />
              <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>Go to Dashboard</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </ScrollView>
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
});

export default AnalysisResultScreen;
