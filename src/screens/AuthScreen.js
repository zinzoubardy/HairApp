import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert
} from "react-native";
import theme from "../styles/theme";
import { useAuth } from "../contexts/AuthContext"; // Import useAuth

const AuthScreen = () => {
  const { signUp, signInWithPassword, loadingAuthAction } = useAuth(); // Use the context
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUpMode, setIsSignUpMode] = useState(false);

  const handleAuthAction = async () => {
    if (!email || !password) {
      Alert.alert("Input Required", "Please enter both email and password.");
      return;
    }

    if (isSignUpMode) {
      const { data, error } = await signUp(email, password);
      if (error) {
        Alert.alert("Sign Up Error", error.message);
      } else if (data && data.user && data.session) {
        // This case means user is signed up and logged in (e.g. autoVerify is true)
        Alert.alert("Sign Up Successful", "You have successfully signed up and are logged in.");
      } else if (data && data.user && !data.session) {
        // This case means user is signed up but needs to confirm email (e.g. autoVerify is false)
         Alert.alert("Sign Up Successful", "Please check your email to confirm your registration.");
      }
    } else {
      const { error } = await signInWithPassword(email, password);
      if (error) {
        Alert.alert("Sign In Error", error.message);
      }
      // On successful sign-in, the onAuthStateChange listener in AuthContext
      // will update the session and user state, triggering navigation if App.tsx is set up for it.
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.outerContainer}
    >
      <View style={styles.container}>
        <Text style={{ ...styles.title, color: theme.colors.textPrimary, fontFamily: theme.fonts.title }}>
          {isSignUpMode ? "Create Account" : "Welcome Back"}
        </Text>
        <Text style={{ ...styles.subtitle, color: theme.colors.textSecondary, fontFamily: theme.fonts.body }}>
          {isSignUpMode ? "Join HairNature AI today!" : "Sign in to continue."}
        </Text>

        <TextInput
          style={{...styles.input, fontFamily: theme.fonts.body, color: theme.colors.textPrimary}}
          placeholder="Email"
          placeholderTextColor={theme.colors.textSecondary}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          returnKeyType="next"
          editable={!loadingAuthAction}
        />
        <TextInput
          style={{...styles.input, fontFamily: theme.fonts.body, color: theme.colors.textPrimary}}
          placeholder="Password"
          placeholderTextColor={theme.colors.textSecondary}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          returnKeyType="done"
          editable={!loadingAuthAction}
          onSubmitEditing={handleAuthAction}
        />

        <TouchableOpacity
          style={{ ...styles.button, backgroundColor: loadingAuthAction ? theme.colors.border : theme.colors.primary }}
          onPress={handleAuthAction}
          disabled={loadingAuthAction}
        >
          {loadingAuthAction ? (
            <ActivityIndicator size="small" color={theme.colors.card} />
          ) : (
            <Text style={{...styles.buttonText, fontFamily: theme.fonts.body}}>
              {isSignUpMode ? "Sign Up" : "Sign In"}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.toggleButton}
          onPress={() => setIsSignUpMode(!isSignUpMode)}
          disabled={loadingAuthAction}
        >
          <Text style={{...styles.toggleButtonText, color: theme.colors.primary, fontFamily: theme.fonts.body}}>
            {isSignUpMode ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: theme.spacing.lg,
  },
  title: {
    fontSize: theme.fontSizes.title,
    marginBottom: theme.spacing.sm,
    textAlign: "center",
  },
  subtitle: {
    fontSize: theme.fontSizes.md,
    textAlign: "center",
    marginBottom: theme.spacing.xl,
  },
  input: {
    width: "100%",
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md - 2,
    fontSize: theme.fontSizes.md,
    marginBottom: theme.spacing.md,
  },
  button: {
    width: "100%",
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 50,
    marginTop: theme.spacing.sm,
  },
  buttonText: {
    color: theme.colors.card,
    fontSize: theme.fontSizes.md,
    fontWeight: "bold",
  },
  toggleButton: {
    marginTop: theme.spacing.lg,
  },
  toggleButtonText: {
    fontSize: theme.fontSizes.sm,
    fontWeight: "600",
  },
});

export default AuthScreen;
