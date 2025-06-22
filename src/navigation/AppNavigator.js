import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import HomeScreen from "../screens/HomeScreen";
import UploadScreen from "../screens/UploadScreen";
import ProfileScreen from "../screens/ProfileScreen";
import AnalysisResultScreen from "../screens/AnalysisResultScreen";
import HairAIScreen from "../screens/HairAIScreen"; // Import the new AI screen
import RoutineScreen from "../screens/RoutineScreen"; // Import RoutineScreen
import RoutineForm from "../screens/RoutineForm";   // Import RoutineForm
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
      <Stack.Screen
        name="Routine"
        component={RoutineScreen}
        options={{ title: "My Routines" }}
      />
      <Stack.Screen
        name="RoutineForm"
        component={RoutineForm}
        options={({ route }) => ({
          title: route.params?.routine ? "Edit Routine" : "Create Routine",
        })}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;
