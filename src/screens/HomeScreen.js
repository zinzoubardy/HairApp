import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Modal, FlatList, Dimensions, ActivityIndicator } from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import theme from '../styles/theme';
import { useNavigation } from '@react-navigation/native';
import { getProfile } from '../services/SupabaseService';
import { getHairAnalysis, saveHairAnalysisResult } from '../services/AIService';

const { width } = Dimensions.get('window');

// Mock data
const globalHairState = 78; // percent
const scalpAnalysis = {
  status: 'Healthy',
  icon: 'spa',
  summary: 'No major issues detected',
};
const colorAnalysis = {
  status: 'Natural Black',
  icon: 'palette',
  summary: 'No artificial coloring detected',
};
const recommendations = [
  { icon: 'water', text: 'Hydrate hair twice a week' },
  { icon: 'leaf', text: 'Use natural oils' },
  { icon: 'wind', text: 'Limit heat styling' },
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

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data: profileData } = await getProfile();
      setProfile(profileData);
      // For now, check if analysis exists in profile (mock logic)
      // In real app, fetch from hair_analysis_results table
      setAnalysis(profileData && profileData.hair_analysis_result ? profileData.hair_analysis_result : null);
      setLoading(false);
    };
    fetchData();
  }, []);

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
    // Call AI analysis (mock for now)
    const { success, data } = await getHairAnalysis(profile, {
      up: profile.profile_pic_up_url,
      back: profile.profile_pic_back_url,
      left: profile.profile_pic_left_url,
      right: profile.profile_pic_right_url,
    });
    if (success) {
      setAnalysis(data);
      // Optionally save to DB
      // await saveHairAnalysisResult(profile.id, data, { up: ..., ... });
    } else {
      alert('AI analysis failed. Please try again.');
    }
    setAnalysing(false);
  };

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
      <LinearGradient colors={[theme.colors.primary, theme.colors.accent, theme.colors.background]} style={styles.root}>
        <TouchableOpacity style={styles.menuButton} onPress={handleMenu}>
          <Ionicons name="menu" size={32} color={theme.colors.primary} />
        </TouchableOpacity>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 }}>
          <Text style={{ fontSize: 22, fontWeight: 'bold', color: theme.colors.primary, marginBottom: 24, textAlign: 'center' }}>
            Welcome to HairNature AI!
          </Text>
          <Text style={{ color: theme.colors.textSecondary, fontSize: 16, marginBottom: 32, textAlign: 'center' }}>
            To get your personalized dashboard, please analyse your hair by uploading clear photos from Top, Back, Left, and Right angles.
          </Text>
          <TouchableOpacity
            style={{ backgroundColor: theme.colors.primary, borderRadius: 24, paddingVertical: 16, paddingHorizontal: 40, elevation: 4 }}
            onPress={handleAnalyseNow}
            disabled={analysing}
          >
            {analysing ? (
              <ActivityIndicator size="small" color={theme.colors.card} />
            ) : (
              <Text style={{ color: theme.colors.card, fontSize: 18, fontWeight: 'bold' }}>Analyse Now</Text>
            )}
          </TouchableOpacity>
        </View>
        {/* Menu Modal (same as before) */}
        <Modal visible={menuVisible} animationType="slide" transparent onRequestClose={handleMenuClose}>
          <TouchableOpacity style={styles.menuOverlay} onPress={handleMenuClose} activeOpacity={1}>
            <View style={styles.menuModal}>
              <TouchableOpacity style={styles.menuItem} onPress={() => handleMenuItem('Profile')}>
                <Ionicons name="person" size={24} color={theme.colors.primary} style={{ marginRight: 12 }} />
                <Text style={styles.menuItemText}>My Profile</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuItem} onPress={() => handleMenuItem('Routines')}>
                <Ionicons name="list" size={24} color={theme.colors.primary} style={{ marginRight: 12 }} />
                <Text style={styles.menuItemText}>My Routines</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuItem} onPress={() => handleMenuItem('AI Advisor')}>
                <Ionicons name="chatbubbles" size={24} color={theme.colors.primary} style={{ marginRight: 12 }} />
                <Text style={styles.menuItemText}>AI Hair Advisor</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={[theme.colors.primary, theme.colors.accent, theme.colors.background]} style={styles.root}>
      {/* Menu Button */}
      <TouchableOpacity style={styles.menuButton} onPress={handleMenu}>
        <Ionicons name="menu" size={32} color={theme.colors.primary} />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Global Hair State */}
        <LinearGradient colors={[theme.colors.accent, theme.colors.primary]} style={styles.globalBox}>
          <Text style={styles.globalTitle}>Overall Hair Health</Text>
          <View style={styles.progressCircleContainer}>
            <View style={styles.progressCircleBg}>
              <Text style={styles.globalPercent}>{globalHairState}%</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Split Box */}
        <View style={styles.splitBox}>
          <LinearGradient colors={[theme.colors.primary, theme.colors.secondary]} style={styles.splitItem}>
            <MaterialCommunityIcons name={colorAnalysis.icon} size={32} color={theme.colors.card} />
            <Text style={styles.splitTitle}>Color</Text>
            <Text style={styles.splitStatus}>{colorAnalysis.status}</Text>
            <Text style={styles.splitSummary}>{colorAnalysis.summary}</Text>
          </LinearGradient>
          <View style={styles.splitDivider} />
          <LinearGradient colors={[theme.colors.secondary, theme.colors.primary]} style={styles.splitItem}>
            <MaterialCommunityIcons name={scalpAnalysis.icon} size={32} color={theme.colors.card} />
            <Text style={styles.splitTitle}>Scalp</Text>
            <Text style={styles.splitStatus}>{scalpAnalysis.status}</Text>
            <Text style={styles.splitSummary}>{scalpAnalysis.summary}</Text>
          </LinearGradient>
        </View>

        {/* Recommendations */}
        <LinearGradient colors={[theme.colors.primary, theme.colors.accent]} style={styles.recommendBox}>
          <Text style={styles.recommendTitle}>Recommendations</Text>
          <View style={styles.recommendList}>
            {recommendations.map((rec, idx) => (
              <View key={idx} style={styles.recommendItem}>
                <FontAwesome5 name={rec.icon} size={22} color={theme.colors.card} style={{ marginRight: 12 }} />
                <Text style={styles.recommendText}>{rec.text}</Text>
              </View>
            ))}
          </View>
        </LinearGradient>

        {/* Trending Recipes */}
        <LinearGradient colors={[theme.colors.accent, theme.colors.primary]} style={styles.trendingBox}>
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
        </LinearGradient>
      </ScrollView>

      {/* Menu Modal */}
      <Modal visible={menuVisible} animationType="slide" transparent onRequestClose={handleMenuClose}>
        <TouchableOpacity style={styles.menuOverlay} onPress={handleMenuClose} activeOpacity={1}>
          <View style={styles.menuModal}>
            <TouchableOpacity style={styles.menuItem} onPress={() => handleMenuItem('Profile')}>
              <Ionicons name="person" size={24} color={theme.colors.primary} style={{ marginRight: 12 }} />
              <Text style={styles.menuItemText}>My Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => handleMenuItem('Routines')}>
              <Ionicons name="list" size={24} color={theme.colors.primary} style={{ marginRight: 12 }} />
              <Text style={styles.menuItemText}>My Routines</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => handleMenuItem('AI Advisor')}>
              <Ionicons name="chatbubbles" size={24} color={theme.colors.primary} style={{ marginRight: 12 }} />
              <Text style={styles.menuItemText}>AI Hair Advisor</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

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
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  menuButton: {
    position: 'absolute',
    top: 48,
    right: 24,
    zIndex: 10,
    backgroundColor: theme.colors.card,
    borderRadius: 24,
    padding: 4,
    elevation: 4,
  },
  scrollContent: {
    paddingTop: 80,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  globalBox: {
    borderRadius: 18,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    elevation: 2,
  },
  globalTitle: {
    fontSize: theme.fontSizes.lg,
    color: theme.colors.card,
    fontFamily: theme.fonts.title,
    marginBottom: 8,
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
    borderColor: theme.colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  globalPercent: {
    fontSize: 32,
    fontWeight: 'bold',
    color: theme.colors.card,
  },
  splitBox: {
    flexDirection: 'row',
    borderRadius: 18,
    marginBottom: 24,
    elevation: 2,
    overflow: 'hidden',
  },
  splitItem: {
    flex: 1,
    alignItems: 'center',
    padding: 18,
  },
  splitDivider: {
    width: 1,
    backgroundColor: theme.colors.card,
  },
  splitTitle: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.card,
    fontFamily: theme.fonts.title,
    marginTop: 8,
    marginBottom: 2,
  },
  splitStatus: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.accent,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  splitSummary: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.card,
    textAlign: 'center',
  },
  recommendBox: {
    borderRadius: 18,
    padding: 18,
    marginBottom: 24,
    elevation: 2,
  },
  recommendTitle: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.card,
    fontFamily: theme.fonts.title,
    marginBottom: 8,
  },
  recommendList: {
    flexDirection: 'column',
  },
  recommendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  recommendText: {
    fontSize: theme.fontSizes.body,
    color: theme.colors.card,
  },
  trendingBox: {
    borderRadius: 18,
    padding: 18,
    marginBottom: 24,
    elevation: 2,
  },
  trendingTitle: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.card,
    fontFamily: theme.fonts.title,
    marginBottom: 8,
  },
  recipeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
    elevation: 1,
  },
  recipeImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginRight: 12,
  },
  recipeTitle: {
    fontSize: theme.fontSizes.body,
    color: theme.colors.card,
    fontWeight: 'bold',
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
  },
  menuModal: {
    backgroundColor: theme.colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 48,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  menuItemText: {
    fontSize: 18,
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.body,
  },
  recipeModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recipeModalBox: {
    backgroundColor: theme.colors.card,
    borderRadius: 18,
    padding: 24,
    width: width * 0.8,
    alignItems: 'center',
  },
  recipeModalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 12,
    textAlign: 'center',
  },
  recipeModalDetails: {
    fontSize: 16,
    color: theme.colors.textPrimary,
    marginBottom: 18,
    textAlign: 'center',
  },
  recipeModalClose: {
    padding: 10,
  },
});

export default HomeScreen;
