import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, TextInput, FlatList, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { updateProfile } from '../services/SupabaseService';
import theme from '../styles/theme';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from '../i18n';

const slides = [
  {
    key: 'welcome',
    title: 'onboarding_welcome_title',
    subtitle: 'onboarding_welcome_subtitle',
    image: require('../../assets/splash.png'),
    type: 'welcome',
  },
  {
    key: 'goal',
    title: 'onboarding_goal_title',
    options: [
      { icon: 'leaf', label: 'onboarding_goal_grow', value: 'grow' },
      { icon: 'star', label: 'onboarding_goal_shine', value: 'shine' },
      { icon: 'shield', label: 'onboarding_goal_strengthen', value: 'strengthen' },
      { icon: 'palette-outline', label: 'onboarding_goal_color', value: 'color' },
      { icon: 'spa', label: 'onboarding_goal_scalp', value: 'scalp' },
      { icon: 'dots-horizontal', label: 'onboarding_other', value: 'other' },
    ],
    type: 'single',
    stateKey: 'hairGoal',
  },
  {
    key: 'type',
    title: 'onboarding_type_title',
    options: [
      { icon: 'swap-horizontal', label: 'onboarding_type_straight', value: 'straight' },
      { icon: 'waves', label: 'onboarding_type_wavy', value: 'wavy' },
      { icon: 'sync', label: 'onboarding_type_curly', value: 'curly' },
      { icon: 'weather-lightning', label: 'onboarding_type_coily', value: 'coily' },
      { icon: 'dots-horizontal', label: 'onboarding_other', value: 'other' },
    ],
    type: 'single',
    stateKey: 'hairType',
  },
  {
    key: 'allergies',
    title: 'onboarding_allergies_title',
    subtitle: 'onboarding_allergies_subtitle',
    type: 'input',
    stateKey: 'allergies',
  },
  {
    key: 'products',
    title: 'onboarding_products_title',
    options: [
      { icon: 'bottle-tonic', label: 'onboarding_products_shampoo', value: 'shampoo' },
      { icon: 'bottle-tonic-plus', label: 'onboarding_products_conditioner', value: 'conditioner' },
      { icon: 'face-woman-shimmer', label: 'onboarding_products_mask', value: 'mask' },
      { icon: 'water', label: 'onboarding_products_serum', value: 'serum' },
      { icon: 'hair-dryer', label: 'onboarding_products_heat', value: 'heat' },
      { icon: 'palette-outline', label: 'onboarding_products_color', value: 'color' },
      { icon: 'dots-horizontal', label: 'onboarding_other', value: 'other' },
    ],
    type: 'multi',
    stateKey: 'products',
  },
  {
    key: 'heat',
    title: 'onboarding_heat_title',
    options: [
      { icon: 'fire', label: 'onboarding_heat_daily', value: 'daily' },
      { icon: 'calendar', label: 'onboarding_heat_2_3x', value: '2-3x' },
      { icon: 'timer-sand', label: 'onboarding_heat_rarely', value: 'rarely' },
      { icon: 'close', label: 'onboarding_heat_never', value: 'never' },
      { icon: 'dots-horizontal', label: 'onboarding_other', value: 'other' },
    ],
    type: 'single',
    stateKey: 'heatUsage',
  },
  {
    key: 'done',
    title: 'onboarding_done_title',
    subtitle: 'onboarding_done_subtitle',
    type: 'done',
  },
];

const OnboardingCarouselScreen = () => {
  console.log('OnboardingCarouselScreen: rendered');
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({
    hairGoal: '',
    hairGoalOther: '',
    hairType: '',
    hairTypeOther: '',
    allergies: '',
    products: [],
    productsOther: '',
    heatUsage: '',
    heatUsageOther: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSelect = (stateKey, value) => {
    setAnswers((prev) => ({ ...prev, [stateKey]: value }));
  };

  const handleMultiSelect = (stateKey, value) => {
    setAnswers((prev) => {
      const arr = prev[stateKey] || [];
      if (arr.includes(value)) {
        return { ...prev, [stateKey]: arr.filter((v) => v !== value) };
      } else {
        return { ...prev, [stateKey]: [...arr, value] };
      }
    });
  };

  const handleOtherInput = (stateKey, text) => {
    setAnswers((prev) => ({ ...prev, [stateKey + 'Other']: text }));
  };

  const handleNext = async () => {
    if (slides[current].type === 'done') {
      navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
      return;
    }
    // On last question, submit
    if (current === slides.length - 2) {
      setLoading(true);
      try {
        // Save to Supabase (only fields that exist)
        await updateProfile({
          hair_goal: answers.hairGoal === 'other' ? answers.hairGoalOther : answers.hairGoal,
          allergies: answers.allergies,
          hair_concerns_preferences: [
            ...answers.products.filter((p) => p !== 'other'),
            ...(answers.products.includes('other') && answers.productsOther ? [answers.productsOther] : [])
          ].join(','),
        });
        await AsyncStorage.setItem('onboardingComplete', 'true');
        setCurrent((c) => c + 1);
      } catch (e) {
        Alert.alert('Error', e.message || 'Failed to update profile.');
      } finally {
        setLoading(false);
      }
    } else {
      setCurrent((c) => c + 1);
    }
  };

  const handleSkip = async () => {
    if (slides[current].type === 'done') {
      navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
      return;
    }
    if (current === slides.length - 2) {
      await AsyncStorage.setItem('onboardingComplete', 'true');
      setCurrent((c) => c + 1);
    } else {
      setCurrent((c) => c + 1);
    }
  };

  const renderOptions = (options, stateKey, multi = false) => {
    const showOtherInput = multi
      ? answers[stateKey]?.includes('other')
      : answers[stateKey] === 'other';
    return (
      <View style={styles.optionsContainer}>
        {options.map((opt) => (
          <TouchableOpacity
            key={opt.value}
            style={[
              styles.optionButton,
              (multi
                ? answers[stateKey]?.includes(opt.value)
                : answers[stateKey] === opt.value) && styles.selectedOption,
            ]}
            onPress={() =>
              multi
                ? handleMultiSelect(stateKey, opt.value)
                : handleSelect(stateKey, opt.value)
            }
          >
            <MaterialCommunityIcons name={opt.icon} size={28} color={theme.colors.primary} />
            <Text style={styles.optionLabel}>{t(opt.label)}</Text>
          </TouchableOpacity>
        ))}
        {showOtherInput && (
          <TextInput
            style={styles.input}
            placeholder={t('onboarding_type_your_answer')}
            placeholderTextColor={theme.colors.textSecondary}
            value={answers[stateKey + 'Other']}
            onChangeText={(text) => handleOtherInput(stateKey, text)}
          />
        )}
      </View>
    );
  };

  const slide = slides[current];

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {slide.type === 'welcome' && (
          <>
            <Image source={slide.image} style={styles.logo} />
            <Text style={styles.title}>{t(slide.title)}</Text>
            <Text style={styles.subtitle}>{t(slide.subtitle)}</Text>
          </>
        )}
        {slide.type === 'single' && (
          <>
            <Text style={styles.title}>{t(slide.title)}</Text>
            {renderOptions(slide.options, slide.stateKey)}
          </>
        )}
        {slide.type === 'multi' && (
          <>
            <Text style={styles.title}>{t(slide.title)}</Text>
            {renderOptions(slide.options, slide.stateKey, true)}
          </>
        )}
        {slide.type === 'input' && (
          <>
            <Text style={styles.title}>{t(slide.title)}</Text>
            <Text style={styles.subtitle}>{t(slide.subtitle)}</Text>
            <TextInput
              style={styles.input}
              placeholder={t('onboarding_type_your_answer')}
              placeholderTextColor={theme.colors.textSecondary}
              value={answers[slide.stateKey]}
              onChangeText={(text) => handleSelect(slide.stateKey, text)}
            />
          </>
        )}
        {slide.type === 'done' && (
          <>
            <Ionicons name="checkmark-circle" size={64} color={theme.colors.success} style={{ marginBottom: 16 }} />
            <Text style={styles.title}>{t(slide.title)}</Text>
            <Text style={styles.subtitle}>{t(slide.subtitle)}</Text>
          </>
        )}
      </View>
      {/* Progress Dots */}
      <View style={styles.progressContainer}>
        {slides.slice(0, -1).map((s, i) => (
          <View
            key={s.key}
            style={[styles.dot, i === current && styles.activeDot]}
          />
        ))}
      </View>
      {/* Buttons */}
      <View style={styles.buttonRow}>
        {slide.type !== 'done' && (
          <TouchableOpacity style={styles.skipButton} onPress={handleSkip} disabled={loading}>
            <Text style={styles.skipButtonText}>{t('skip')}</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.nextButton, loading && { opacity: 0.6 }]}
          onPress={handleNext}
          disabled={loading}
        >
          <Text style={styles.nextButtonText}>{slide.type === 'done' ? t('finish') : t('next')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: 32,
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
    ...theme.shadows.medium,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 24,
  },
  title: {
    ...theme.typography.h2,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  optionsContainer: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginVertical: 16,
  },
  optionButton: {
    width: '48%',
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    ...theme.shadows.soft,
  },
  selectedOption: {
    borderColor: theme.colors.accentGlow,
    backgroundColor: theme.colors.primary,
  },
  optionLabel: {
    ...theme.typography.label,
    marginTop: 8,
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.accentGlow,
    borderRadius: theme.borderRadius.md,
    padding: 16,
    fontSize: theme.fontSizes.md,
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.body,
    backgroundColor: theme.colors.background,
    marginBottom: 20,
    minHeight: 48,
    width: '100%',
    textAlignVertical: 'top',
    ...theme.shadows.soft,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 24,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: theme.colors.textSecondary,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: theme.colors.accentGlow,
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 8,
  },
  nextButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.lg,
    paddingVertical: 14,
    paddingHorizontal: 32,
    alignItems: 'center',
    ...theme.shadows.medium,
    borderWidth: 1,
    borderColor: theme.colors.accentGlow,
  },
  nextButtonText: {
    ...theme.typography.button,
    color: theme.colors.textPrimary,
  },
  skipButton: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.accentGlow,
    marginRight: 12,
  },
  skipButtonText: {
    ...theme.typography.button,
    color: theme.colors.textSecondary,
  },
});

export default OnboardingCarouselScreen; 