import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Ionicons from 'react-native-vector-icons/Ionicons';
import { TouchableOpacity, View, StyleSheet, Platform } from "react-native";
import { useAuth } from "../contexts/AuthContext";
import i18n from "../i18n";
import OnboardingCarouselScreen from '../screens/OnboardingCarouselScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

import HomeScreen from "../screens/HomeScreen"; // Will be the new Dashboard
import UploadScreen from "../screens/UploadScreen";
import ProfileScreen from "../screens/ProfileScreen";
import AnalysisResultScreen from "../screens/AnalysisResultScreen";
import AnalysisOptionsScreen from "../screens/AnalysisOptionsScreen";
import HairAIScreen from "../screens/HairAIScreen";
import RoutineScreen from "../screens/RoutineScreen";
import SplashScreen from "../screens/SplashScreen"; // New Splash Screen
import AuthScreen from "../screens/AuthScreen";
import theme from "../styles/theme";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Standard screen options for Stack navigators
const defaultStackScreenOptions = {
  headerStyle: {
    backgroundColor: theme.colors.surface,
    ...theme.shadows.medium,
  },
  headerTintColor: theme.colors.textPrimary,
  headerTitleStyle: {
    fontFamily: theme.fonts.title,
    fontSize: theme.fontSizes.lg,
    color: theme.colors.textPrimary,
  },
  cardStyle: { backgroundColor: theme.colors.background },
};

// A dummy component that renders nothing, for tabs that are action buttons
const EmptyScreen = () => null;

// This will be the main navigator after login, containing tabs
const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          // Map route names to icons regardless of translation
          if (route.name === t('dashboard') || route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === t('routines') || route.name === 'Routines') {
            iconName = focused ? 'list-circle' : 'list-circle-outline';
          } else if (route.name === t('ai_advisor') || route.name === 'AI Advisor') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          } else if (route.name === t('profile') || route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else if (route.name === t('analyse') || route.name === 'Analyse') {
            iconName = focused ? 'aperture' : 'aperture-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.accent,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.accentGlow,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 90 : 70,
          ...theme.shadows.medium,
        },
        tabBarLabelStyle: {
          fontSize: theme.fontSizes.sm,
          fontFamily: theme.fonts.body,
          fontWeight: '600',
        },
        headerShown: false,
        cardStyle: { backgroundColor: theme.colors.background },
      })}
    >
      <Tab.Screen name={t('dashboard')} component={HomeScreen} />
      <Tab.Screen name={t('routines')} component={RoutineScreen} />
      <Tab.Screen 
        name={t('analyse')} 
        component={AnalysisOptionsScreen}
        options={{
          tabBarButton: (props) => (
            <TouchableOpacity
              {...props}
              onPress={() => {
                // Always navigate to AnalysisOptionsScreen when tab is pressed
                props.onPress();
              }}
            />
          ),
        }}
      />
      <Tab.Screen name={t('ai_advisor')} component={HairAIScreen} />
      <Tab.Screen name={t('profile')} component={ProfileScreen} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  actionButtonContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.glow,
    borderWidth: 2,
    borderColor: theme.colors.accentGlow,
  },
});

const screenOptions = {
  headerShown: false,
  cardStyle: { backgroundColor: theme.colors.background },
};

const tabScreenOptions = {
  headerShown: false,
  tabBarStyle: {
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.accentGlow,
    paddingBottom: 8,
    paddingTop: 8,
    height: 60,
    ...theme.shadows.medium,
  },
  tabBarActiveTintColor: theme.colors.accent,
  tabBarInactiveTintColor: theme.colors.textSecondary,
  tabBarLabelStyle: {
    fontSize: theme.fontSizes.sm,
    fontFamily: theme.fonts.body,
    fontWeight: '600',
  },
  cardStyle: { backgroundColor: theme.colors.background },
};

// Safe translation function
const t = (key) => {
  try {
    return i18n.t(key) || key;
  } catch (error) {
    console.log('Translation error for key:', key, error);
    return key;
  }
};

// The AppNavigator now includes the MainTabNavigator and other screens outside the tabs (like modal forms)
// The Auth flow (handled in App.tsx) will navigate to "MainApp" stack which contains MainTabNavigator.
const AppNavigator = () => {
  const navigation = useNavigation();
  const { user, loadingInitial } = useAuth();
  const [onboardingChecked, setOnboardingChecked] = React.useState(false);
  const [onboardingComplete, setOnboardingComplete] = React.useState(false);

  React.useEffect(() => {
    const checkOnboarding = async () => {
      if (user) {
        const flag = await AsyncStorage.getItem('onboardingComplete');
        setOnboardingComplete(flag === 'true');
      }
      setOnboardingChecked(true);
    };
    checkOnboarding();
  }, [user]);

  // Imperative navigation to OnboardingCarousel if needed
  React.useEffect(() => {
    if (user && onboardingChecked && !onboardingComplete && navigation && navigation.reset) {
      navigation.reset({ index: 0, routes: [{ name: 'OnboardingCarousel' }] });
    }
  }, [user, onboardingChecked, onboardingComplete, navigation]);

  if (loadingInitial || (user && !onboardingChecked)) {
    return null; // Wait for onboarding check
  }

  let initialRoute = 'Splash';
  if (user) {
    initialRoute = onboardingComplete ? 'MainTabs' : 'OnboardingCarousel';
  }

  // Debug log for navigation state
  console.log('AppNavigator: user', user, 'onboardingComplete', onboardingComplete, 'initialRoute', initialRoute);

  return (
    <Stack.Navigator 
      screenOptions={defaultStackScreenOptions}
      initialRouteName={initialRoute}
    >
      <Stack.Screen
        name="Splash"
        component={SplashScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Auth"
        component={AuthScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="OnboardingCarousel"
        component={OnboardingCarouselScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="MainTabs"
        component={MainTabNavigator}
        options={{ headerShown: false }}
      />
      {/* Screens that can be navigated to from within tabs but are not tabs themselves */}
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: "My Profile" }} // Header will be shown for these
      />
       <Stack.Screen
        name="Upload" // Kept for potential direct access or future use
        component={UploadScreen}
        options={{ title: "Upload Photo" }}
      />
      <Stack.Screen
        name="AnalysisResult" // This screen might be deprecated if Home becomes the dashboard
        component={AnalysisResultScreen}
        options={{ title: "Analysis Result" }}
      />
      <Stack.Screen
        name="AnalysisOptionsScreen"
        component={AnalysisOptionsScreen}
        options={{ title: "Hair Analysis Options" }}
      />
      {/* Add other full-screen modals or navigation flows here if needed */}
    </Stack.Navigator>
  );
};

export default AppNavigator;
