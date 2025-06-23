import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, StatusBar, Platform, TouchableOpacity, Image, ActivityIndicator, Modal, Button } from "react-native";
import Ionicons from 'react-native-vector-icons/Ionicons';
import theme from "../styles/theme.js";
import { useAuth } from "../contexts/AuthContext.js";
import { getProfile, saveHairAnalysisResult, getTrendingRecipes } from "../services/SupabaseService.js"; // Added getTrendingRecipes
import { getHairAnalysis } from "../services/AIService.js";


const HomeScreen = ({ navigation, route }) => { // Added route
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    globalHairState: "Loading...",
    globalHairStateJustification: "",
    scalpAnalysis: "Loading...",
    colorAnalysis: "Loading...",
    keyObservations: "Loading...",
    recommendations: [],
    trendingRecipes: [ // Placeholder for now
        { id: 'r1', title: "Avocado & Honey Hair Mask", imageUrl: "https://via.placeholder.com/150/92c952", short_description: "For deep moisturization." },
        { id: 'r2', title: "Rosemary Scalp Rinse", imageUrl: "https://via.placeholder.com/150/771796", short_description: "To promote scalp health." },
    ],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRecipe, setSelectedRecipe] = useState(null); // For the modal
  const [isRecipeModalVisible, setIsRecipeModalVisible] = useState(false);

  const parseAIResponse = (responseText) => {
    const sections = {};
    const lines = responseText.split('\n');
    let currentSection = '';
    let recommendationsList = [];

    const sectionMappings = {
      "**1. Global Hair State Score:**": "globalHairState",
      "**2. Detailed Scalp Analysis:**": "scalpAnalysis",
      "**3. Detailed Color Analysis:**": "colorAnalysis",
      "**4. Key Observations & Potential Issues:**": "keyObservations",
      "**5. Recommendations:**": "recommendations"
    };

    let processingRecommendations = false;

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine === "") continue;

      let isSectionHeader = false;
      for (const header in sectionMappings) {
        if (trimmedLine.startsWith(header)) {
          currentSection = sectionMappings[header];
          sections[currentSection] = trimmedLine.substring(header.length).trim();
          processingRecommendations = (currentSection === "recommendations");
          if(processingRecommendations) sections[currentSection] = []; // Initialize as array
          isSectionHeader = true;
          break;
        }
      }

      if (!isSectionHeader && currentSection) {
        if (processingRecommendations) {
          if (trimmedLine.startsWith("- Recommendation:")) {
            const text = trimmedLine.substring("- Recommendation:".length).split("IconHint:")[0].trim();
            const iconHintMatch = trimmedLine.match(/IconHint:\s*(\S+)/);
            const iconHint = iconHintMatch ? iconHintMatch[1] : "default";
            sections.recommendations.push({ id: `rec-${sections.recommendations.length + 1}`, text, iconHint });
          }
        } else if (currentSection === "globalHairState") {
            // Special parsing for Global Hair State Score
            const scoreMatch = sections[currentSection].match(/(\d+%)/);
            const justification = sections[currentSection].substring(sections[currentSection].indexOf('%') + 1).trim();
            sections.globalHairStateScore = scoreMatch ? scoreMatch[0] : "N/A";
            sections.globalHairStateJustificationText = justification.startsWith('-') ? justification.substring(1).trim() : justification;
            // sections[currentSection] will be overwritten if more lines come for this section, so we store parsed parts separately.
        } else {
          sections[currentSection] = (sections[currentSection] ? sections[currentSection] + '\n' : '') + trimmedLine;
        }
      }
    }

    // Refined parsing for global hair state after loop if it wasn't fully captured
    if (sections.globalHairState && typeof sections.globalHairState === 'string') {
        const scoreMatch = sections.globalHairState.match(/(\d+%)/);
        const justification = sections.globalHairState.substring(sections.globalHairState.indexOf('%') + 1).trim();
        sections.globalHairStateScore = scoreMatch ? scoreMatch[0] : "N/A";
        sections.globalHairStateJustificationText = justification.startsWith('-') ? justification.substring(1).trim() : justification;
    }


    return {
      globalHairState: sections.globalHairStateScore || "N/A",
      globalHairStateJustification: sections.globalHairStateJustificationText || "",
      scalpAnalysis: sections.scalpAnalysis || "Not available.",
      colorAnalysis: sections.colorAnalysis || "Not available.",
      keyObservations: sections.keyObservations || "Not available.",
      recommendations: sections.recommendations || [],
    };
  };


  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user) {
        setError("User not authenticated. Please login.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const { data: profileData, error: profileError } = await getProfile();
        if (profileError || !profileData) {
          setError("Could not load profile. Please ensure your profile is complete or try again.");
          setIsLoading(false);
          return;
        }

        const imageReferences = {
          up: profileData.profile_pic_up_url,
          right: profileData.profile_pic_right_url,
          left: profileData.profile_pic_left_url,
          back: profileData.profile_pic_back_url,
        };

        const { success, data: aiData, error: aiError } = await getHairAnalysis(profileData, imageReferences);

        if (success && aiData) {
          const parsedData = parseAIResponse(aiData);
          setDashboardData(prevData => ({
            ...prevData, // Keep existing trendingRecipes
            ...parsedData,
          }));

          // Save analysis (fire and forget, or handle error silently)
          saveHairAnalysisResult(user.id, aiData, imageReferences)
            .then(saveRes => {
              if (saveRes.error) console.warn("Failed to save new analysis to history:", saveRes.error.message);
              else console.log("New analysis saved to history.");
            });

        } else {
          setError(`AI Analysis Failed: ${aiError || "Unknown error"}`);
        }
      } catch (e) {
        setError(`An unexpected error occurred: ${e.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();

    const fetchRecipes = async () => {
        const { data: recipesData, error: recipesError } = await getTrendingRecipes();
        if (recipesError) {
            console.warn("Failed to fetch trending recipes:", recipesError.message);
            // Don't necessarily set main error state, could have a separate recipesError state
        } else if (recipesData) {
            setDashboardData(prevData => ({ ...prevData, trendingRecipes: recipesData }));
        }
    };
    fetchRecipes();

  }, [user, route.params?.refreshTimestamp]); // Added route.params?.refreshTimestamp to dependencies

  const handleRecipePress = (recipe) => {
    setSelectedRecipe(recipe);
    setIsRecipeModalVisible(true);
  };

  const paddingTop = Platform.OS === 'android' ? StatusBar.currentHeight + theme.spacing.sm : theme.spacing.md;

  // Placeholder for icon mapping
  const getIconForRecommendation = (iconHint) => {
    // Convert hint to lowercase for case-insensitive matching
    const hint = iconHint ? iconHint.toLowerCase() : "default";

    switch (hint) {
      // General Care & Tools
      case "shampoo":
      case "cleanser":
      case "wash":
        return "water-outline";
      case "conditioner":
      case "moisturize":
      case "hydrate":
      case "hydration":
      case "cream":
      case "lotion":
        return "leaf-outline"; // Or "water-outline" if more about moisture
      case "oil":
      case "serum":
        return "eyedrop-outline"; // Represents a drop of oil/serum
      case "mask":
      case "treatment":
        return "color-filter-outline"; // Represents a special treatment
      case "scalp":
      case "scalp-care":
        return "bandage-outline"; // For scalp health/treatment
      case "brush":
      case "comb":
        return "brush-outline";
      case "towel":
      case "drying":
        return "document-text-outline"; // Placeholder, could be better
      case "pillow":
      case "sleep":
        return "moon-outline";
      case "sun":
      case "uv-protection":
        return "sunny-outline";
      case "heat":
      case "styling-tool":
      case "hair-dryer":
      case "flat-iron":
        return "flame-outline";
      case "scissors":
      case "trim":
      case "cut":
        return "cut-outline";

      // Ingredients & Product Types
      case "sulfate-free":
        return "ban-outline";
      case "natural":
      case "organic":
        return "flower-outline";
      case "protein":
        return "restaurant-outline"; // Placeholder, needs better icon for protein

      // Actions & Advice
      case "diet":
      case "nutrition":
      case "food":
        return "nutrition-outline";
      case "water-intake": // if AI suggests drinking water
        return "pint-outline";
      case "consult":
      case "dermatologist":
      case "professional":
        return "medkit-outline";
      case "routine":
      case "consistency":
        return "calendar-outline";
      case "avoid":
        return "alert-circle-outline";
      case "gentle":
        return "heart-outline";

      default:
        return "information-circle-outline"; // Generic info/advice icon
    }
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { paddingTop }]}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />

      <View style={styles.headerContainer}>
        <Text style={styles.mainTitle}>Hair Health Dashboard</Text>
        {user && <Text style={styles.emailText}>Logged in as: {user.email}</Text>}
      </View>

      {isLoading && <ActivityIndicator size="large" color={theme.colors.primary} style={{marginVertical: theme.spacing.xl}} />}
      {error && <Text style={styles.errorText}>{error}</Text>}

      {!isLoading && !error && (
        <>
          {/* Global Hair State */}
          <View style={styles.dashboardSection}>
            <Text style={styles.sectionTitle}>Global Hair State</Text>
            <View style={styles.globalStateBox}>
              <Text style={styles.globalStatePercentage}>{dashboardData.globalHairState}</Text>
              <Text style={styles.globalStateSubtitle}>{dashboardData.globalHairStateJustification || "Overall Assessment"}</Text>
            </View>
          </View>

          {/* Key Observations */}
          {dashboardData.keyObservations && dashboardData.keyObservations !== "Loading..." && dashboardData.keyObservations !== "Not available." && (
            <View style={styles.dashboardSection}>
              <Text style={styles.sectionTitle}>Key Observations & Potential Issues</Text>
              <Text style={styles.normalText}>{dashboardData.keyObservations}</Text>
            </View>
          )}

          {/* Scalp & Color Analysis */}
          <View style={styles.dashboardSection}>
            <Text style={styles.sectionTitle}>Detailed Analysis</Text>
            <View style={styles.splitBoxContainer}>
              <View style={[styles.splitBox, styles.splitBoxLeft]}>
                <Text style={styles.splitBoxTitle}>Scalp Analysis</Text>
                <Text style={styles.splitBoxContent}>{dashboardData.scalpAnalysis}</Text>
              </View>
              <View style={[styles.splitBox, styles.splitBoxRight]}>
                <Text style={styles.splitBoxTitle}>Color Analysis</Text>
                <Text style={styles.splitBoxContent}>{dashboardData.colorAnalysis}</Text>
              </View>
            </View>
          </View>

          {/* Recommendations */}
          <View style={styles.dashboardSection}>
            <Text style={styles.sectionTitle}>Recommendations</Text>
            {dashboardData.recommendations.map(rec => (
              <View key={rec.id} style={styles.recommendationItem}>
                <Ionicons name={getIconForRecommendation(rec.iconHint)} size={24} color={theme.colors.primary} style={styles.recommendationIcon} />
                <Text style={styles.recommendationText}>{rec.text}</Text>
              </View>
            ))}
          </View>

          {/* Trending Recipes */}
          <View style={styles.dashboardSection}>
            <Text style={styles.sectionTitle}>Trending Recipes</Text>
            {dashboardData.trendingRecipes && dashboardData.trendingRecipes.length > 0 ? dashboardData.trendingRecipes.map(recipe => (
              <TouchableOpacity key={recipe.id} style={styles.recipeItem} onPress={() => handleRecipePress(recipe)}>
                <Image source={{ uri: recipe.image_url || 'https://via.placeholder.com/60' }} style={styles.recipeImage} />
                <View style={styles.recipeTextContainer}>
                    <Text style={styles.recipeTitle}>{recipe.title}</Text>
                    <Text style={styles.recipeDescription}>{recipe.short_description}</Text>
                </View>
              </TouchableOpacity>
            )) : <Text style={styles.normalText}>No trending recipes available at the moment.</Text>}
          </View>
        </>
      )}

      {selectedRecipe && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={isRecipeModalVisible}
          onRequestClose={() => {
            setIsRecipeModalVisible(!isRecipeModalVisible);
            setSelectedRecipe(null);
          }}
        >
          <View style={styles.modalCenteredView}>
            <View style={styles.modalView}>
              <Text style={styles.modalTitle}>{selectedRecipe.title}</Text>
              <ScrollView style={styles.modalScrollView}>
                {selectedRecipe.image_url && <Image source={{uri: selectedRecipe.image_url}} style={styles.modalRecipeImage} />}
                <Text style={styles.modalSectionTitle}>Description:</Text>
                <Text style={styles.modalText}>{selectedRecipe.short_description}</Text>

                <Text style={styles.modalSectionTitle}>Ingredients:</Text>
                {selectedRecipe.ingredients && selectedRecipe.ingredients.map((ing, index) => (
                  <Text key={index} style={styles.modalText}>- {ing.item}: {ing.quantity}</Text>
                ))}

                <Text style={styles.modalSectionTitle}>Instructions:</Text>
                <Text style={styles.modalText}>{selectedRecipe.instructions}</Text>

                {selectedRecipe.preparation_time_minutes && <Text style={styles.modalText}><Text style={{fontWeight: 'bold'}}>Prep Time:</Text> {selectedRecipe.preparation_time_minutes} mins</Text>}
                {selectedRecipe.difficulty && <Text style={styles.modalText}><Text style={{fontWeight: 'bold'}}>Difficulty:</Text> {selectedRecipe.difficulty}</Text>}

              </ScrollView>
              <Button title="Close" onPress={() => {
                setIsRecipeModalVisible(!isRecipeModalVisible);
                setSelectedRecipe(null);
              }} color={theme.colors.primary} />
            </View>
          </View>
        </Modal>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
  },
  headerContainer: {
    marginBottom: theme.spacing.lg,
    alignItems: 'center',
  },
  mainTitle: {
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.title,
    fontSize: theme.fontSizes.xxl,
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
  },
  emailText: {
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.body,
    fontSize: theme.fontSizes.sm,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  dashboardSection: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  sectionTitle: {
    fontSize: theme.fontSizes.lg,
    fontFamily: theme.fonts.title,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  globalStateBox: {
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
  },
  globalStatePercentage: {
    fontSize: 48, // Large percentage
    fontFamily: theme.fonts.title,
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  globalStateSubtitle: {
    fontSize: theme.fontSizes.md,
    fontFamily: theme.fonts.body,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  splitBoxContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  splitBox: {
    flex: 1,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background, // Slightly different bg for contrast
  },
  splitBoxLeft: {
    marginRight: theme.spacing.sm,
  },
  splitBoxRight: {
    marginLeft: theme.spacing.sm,
  },
  splitBoxTitle: {
    fontSize: theme.fontSizes.md,
    fontFamily: theme.fonts.title,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
    fontWeight: 'bold',
  },
  splitBoxContent: {
    fontSize: theme.fontSizes.body,
    fontFamily: theme.fonts.body,
    color: theme.colors.textSecondary,
    lineHeight: theme.fontSizes.body * 1.4,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderMuted,
  },
  recommendationIcon: {
    marginRight: theme.spacing.md,
  },
  recommendationText: {
    fontSize: theme.fontSizes.body,
    fontFamily: theme.fonts.body,
    color: theme.colors.textPrimary,
    flexShrink: 1, // Allow text to wrap
  },
  recipeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderMuted,
  },
  recipeImage: {
    width: 60,
    height: 60,
    borderRadius: theme.borderRadius.sm,
    marginRight: theme.spacing.md,
  },
  recipeTextContainer: {
    flex: 1,
  },
  recipeTitle: {
    fontSize: theme.fontSizes.md,
    fontFamily: theme.fonts.title,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  recipeDescription: {
    fontSize: theme.fontSizes.sm,
    fontFamily: theme.fonts.body,
    color: theme.colors.textSecondary,
  },
  errorText: {
    color: theme.colors.error,
    textAlign: 'center',
    marginVertical: theme.spacing.md,
    fontFamily: theme.fonts.body,
    fontSize: theme.fontSizes.md,
  },
  normalText: {
    fontSize: theme.fontSizes.body,
    fontFamily: theme.fonts.body,
    color: theme.colors.textSecondary,
    lineHeight: theme.fontSizes.body * 1.5,
    marginBottom: theme.spacing.sm,
  }
});

// Remove last border from recommendations and recipes
const lastRecommendationItem = styles.recommendationItem;
delete lastRecommendationItem.borderBottomWidth;
const lastRecipeItem = styles.recipeItem;
delete lastRecipeItem.borderBottomWidth;

// Modal Styles
styles.modalCenteredView = {
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: "rgba(0,0,0,0.5)", // Dimmed background
};
styles.modalView = {
  margin: theme.spacing.md,
  backgroundColor: theme.colors.card,
  borderRadius: theme.borderRadius.lg,
  padding: theme.spacing.lg,
  alignItems: "stretch", // Stretch items like button
  shadowColor: "#000",
  shadowOffset: {
    width: 0,
    height: 2
  },
  shadowOpacity: 0.25,
  shadowRadius: 4,
  elevation: 5,
  width: '90%',
  maxHeight: '80%',
};
styles.modalTitle = {
    fontSize: theme.fontSizes.xl,
    fontFamily: theme.fonts.title,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
};
styles.modalScrollView = {
    marginBottom: theme.spacing.md,
};
styles.modalSectionTitle = {
    fontSize: theme.fontSizes.md,
    fontFamily: theme.fonts.title,
    color: theme.colors.textPrimary,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xs,
    fontWeight: 'bold',
};
styles.modalText = {
    fontSize: theme.fontSizes.body,
    fontFamily: theme.fonts.body,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
    lineHeight: theme.fontSizes.body * 1.5,
};
styles.modalRecipeImage = {
    width: '100%',
    height: 150, // Adjust as needed
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
    resizeMode: 'cover',
};


export default HomeScreen;
