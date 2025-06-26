import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Ionicons from 'react-native-vector-icons/Ionicons';
import { TouchableOpacity, View, StyleSheet, Platform } from "react-native";
import { useAuth } from "../contexts/AuthContext";

import HomeScreen from "../screens/HomeScreen"; // Will be the new Dashboard
import UploadScreen from "../screens/UploadScreen";
import ProfileScreen from "../screens/ProfileScreen";
import AnalysisResultScreen from "../screens/AnalysisResultScreen";
import AnalysisOptionsScreen from "../screens/AnalysisOptionsScreen";
import HairAIScreen from "../screens/HairAIScreen";
import RoutineScreen from "../screens/RoutineScreen";
import RoutineForm from "../screens/RoutineForm";
import MenuScreen from "../screens/MenuScreen"; // New Menu Screen
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
          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Routines') {
            iconName = focused ? 'list-circle' : 'list-circle-outline';
          } else if (route.name === 'AI Advisor') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          } else if (route.name === 'Menu') {
            iconName = focused ? 'menu' : 'menu-outline';
          } else if (route.name === 'Analyse') {
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
      <Tab.Screen name="Dashboard" component={HomeScreen} />
      <Tab.Screen name="Routines" component={RoutineScreen} />
      <Tab.Screen 
        name="Analyse" 
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
      <Tab.Screen name="AI Advisor" component={HairAIScreen} />
      <Tab.Screen name="Menu" component={MenuScreen} />
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

// The AppNavigator now includes the MainTabNavigator and other screens outside the tabs (like modal forms)
// The Auth flow (handled in App.tsx) will navigate to "MainApp" stack which contains MainTabNavigator.
const AppNavigator = () => {
  const { user, loadingInitial } = useAuth();

  if (loadingInitial) {
    return null; // This will show the loading screen from App.tsx
  }

  return (
    <Stack.Navigator 
      screenOptions={defaultStackScreenOptions}
      initialRouteName={user ? "MainTabs" : "Splash"}
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
        name="MainTabs"
        component={MainTabNavigator}
        options={{ headerShown: false }} // Hide header for the tab container itself
      />
      {/* Screens that can be navigated to from within tabs but are not tabs themselves */}
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: "My Profile" }} // Header will be shown for these
      />
      <Stack.Screen
        name="RoutineForm"
        component={RoutineForm}
        options={({ route }) => ({
          title: route.params?.routine ? "Edit Routine" : "Create Routine",
        })}
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
