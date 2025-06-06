import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import HomeScreen from "../screens/HomeScreen";
import UploadScreen from "../screens/UploadScreen";
import ProfileScreen from "../screens/ProfileScreen";
import AnalysisResultScreen from "../screens/AnalysisResultScreen";
import HairAIScreen from "../screens/HairAIScreen"; // Import the new AI screen
import theme from "../styles/theme";

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.primary,
        },
        headerTintColor: theme.colors.card,
        headerTitleStyle: {
          fontFamily: theme.fonts.title,
          fontSize: theme.fontSizes.lg,
        },
      }}
    >
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: "HairNature AI" }}
      />
      <Stack.Screen
        name="Upload"
        component={UploadScreen}
        options={{ title: "Upload Photo" }}
      />
      <Stack.Screen
        name="AnalysisResult"
        component={AnalysisResultScreen}
        options={{ title: "Analysis Result" }}
      />
      <Stack.Screen
        name="HairAI"
        component={HairAIScreen}
        options={{ title: "AI Hair Advisor" }}
      />
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: "My Profile" }}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;
