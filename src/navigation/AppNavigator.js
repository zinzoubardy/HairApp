import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Ionicons from 'react-native-vector-icons/Ionicons';

import HomeScreen from "../screens/HomeScreen"; // Will be the new Dashboard
import UploadScreen from "../screens/UploadScreen";
import ProfileScreen from "../screens/ProfileScreen";
import AnalysisResultScreen from "../screens/AnalysisResultScreen";
import HairAIScreen from "../screens/HairAIScreen";
import RoutineScreen from "../screens/RoutineScreen";
import RoutineForm from "../screens/RoutineForm";
import MenuScreen from "../screens/MenuScreen"; // New Menu Screen
import theme from "../styles/theme";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Standard screen options for Stack navigators
const defaultStackScreenOptions = {
  headerStyle: {
    backgroundColor: theme.colors.primary,
  },
  headerTintColor: theme.colors.card,
  headerTitleStyle: {
    fontFamily: theme.fonts.title,
    fontSize: theme.fontSizes.lg,
  },
};

import { TouchableOpacity, View, StyleSheet } from "react-native"; // Added for custom button

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
          } else if (route.name === 'AnalyzePlaceholder') { // For the central button
            // This icon won't actually be shown due to tabBarButton overriding
            // but good to have a placeholder.
            iconName = 'aperture-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: {
            backgroundColor: theme.colors.card,
            borderTopColor: theme.colors.border,
            height: Platform.OS === 'ios' ? 90 : 70, // Standard height
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Dashboard" component={HomeScreen} />
      <Tab.Screen name="Routines" component={RoutineScreen} />
      {/* Central Action Button Tab */}
      <Tab.Screen
        name="AnalyzePlaceholder"
        component={EmptyScreen} // Use the defined EmptyScreen component
        options={({ navigation }) => ({
          tabBarLabel: () => null, // No label
          tabBarIcon: ({color}) => ( // A placeholder, actual button is below
            <Ionicons name="aperture-outline" size={30} color={color} />
          ),
          tabBarButton: (props) => (
            <TouchableOpacity
              style={styles.actionButtonContainer}
              onPress={() => {
                navigation.navigate('Dashboard', { refreshTimestamp: Date.now() });
              }}
            >
              <View style={styles.actionButton}>
                <Ionicons name="analytics-outline" size={32} color={theme.colors.card} />
              </View>
            </TouchableOpacity>
          ),
        })}
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
    // This is to help lift the button if needed, but might need adjustment
    // depending on how the tab bar handles flex items.
    // For a true FAB effect, absolute positioning on top of the navigator is better.
    // This approach integrates it into the tab bar flow.
  },
  actionButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    // Optional: Add shadow for FAB effect
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 5,
    elevation: 5,
    // Position it slightly higher if tab bar has padding
    // For very specific positioning, might need to adjust tabBarStyle height and this button's position.
    // top: -20, // Example: to lift it up
  },
});


// The AppNavigator now includes the MainTabNavigator and other screens outside the tabs (like modal forms)
// The Auth flow (handled in App.tsx) will navigate to "MainApp" stack which contains MainTabNavigator.
const AppNavigator = () => {
  return (
    <Stack.Navigator screenOptions={defaultStackScreenOptions}>
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
      {/* Add other full-screen modals or navigation flows here if needed */}
    </Stack.Navigator>
  );
};

export default AppNavigator;
