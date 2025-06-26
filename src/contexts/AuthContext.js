import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../services/SupabaseService"; // Corrected path
import { StyleSheet } from "react-native";
import theme from "../styles/theme";

const AuthContext = createContext(null); // Initialize with null or a default shape

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loadingInitial, setLoadingInitial] = useState(true); // For initial session load
  const [loadingAuthAction, setLoadingAuthAction] = useState(false); // For specific auth actions like sign-in/up

  useEffect(() => {
    const fetchSession = async () => {
      try {
        setLoadingInitial(true);
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        if (error) {
          console.error("Error fetching session:", error.message);
          // Potentially show an error to the user or retry
        }
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
      } catch (e) {
        console.error("Exception fetching session:", e);
      } finally {
        setLoadingInitial(false);
      }
    };

    fetchSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log("Auth event:", event, newSession);
        setSession(newSession);
        setUser(newSession?.user ?? null);
        setLoadingInitial(false); // Ensure loading is false after auth state changes too
        setLoadingAuthAction(false); // Reset action loading on auth change
      }
    );

    // Cleanup listener on unmount
    return () => {
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  const signIn = async (email, password) => {
    console.log("AuthContext: signIn called with email:", email);
    console.log("AuthContext: This is the REAL signIn function from AuthContext");
    console.log("AuthContext: About to set loadingAuthAction to true");
    setLoadingAuthAction(true);
    try {
      console.log("AuthContext: Calling supabase.auth.signInWithPassword...");
      
      // Add a timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Authentication timeout')), 10000); // 10 second timeout
      });
      
      const authPromise = supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      console.log("AuthContext: Waiting for supabase response...");
      const { data, error } = await Promise.race([authPromise, timeoutPromise]);
      
      console.log("AuthContext: Supabase response received");
      console.log("AuthContext: data:", data);
      console.log("AuthContext: error:", error);
      
      if (error) {
        console.log("AuthContext: Throwing error:", error.message);
        throw error;
      }
      console.log("AuthContext: Sign in successful");
      // Navigation will be handled by the navigation stack
    } catch (error) {
      console.error("AuthContext: Sign in error:", error.message);
      throw error;
    } finally {
      console.log("AuthContext: Setting loadingAuthAction to false");
      setLoadingAuthAction(false);
    }
  };

  const signUp = async (email, password) => {
    setLoadingAuthAction(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) throw error;
      // Navigation will be handled by the navigation stack
    } catch (error) {
      console.error("Sign up error:", error.message);
      throw error;
    } finally {
      setLoadingAuthAction(false);
    }
  };

  const signOut = async () => {
    setLoadingAuthAction(true);
    const { error } = await supabase.auth.signOut();
    // User and session will be set to null by onAuthStateChange
    setLoadingAuthAction(false);
    return { error };
  };

  const value = {
    user,
    session,
    loadingInitial,
    loadingAuthAction,
    signUp,
    signIn,
    signOut,
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      color: theme.colors.textPrimary,
      fontSize: theme.fontSizes.md,
      fontFamily: theme.fonts.body,
      marginTop: 16,
    },
  });

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
