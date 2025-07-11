import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../services/SupabaseService"; // Corrected path
import { StyleSheet } from "react-native";
import theme from "../styles/theme";
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext(null); // Initialize with null or a default shape

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loadingInitial, setLoadingInitial] = useState(true); // For initial session load
  const [loadingAuthAction, setLoadingAuthAction] = useState(false); // For specific auth actions like sign-in/up

  useEffect(() => {
    console.log('AuthContext: Starting initialization...');
    
    if (!supabase) {
      console.error('AuthContext: Supabase is not initialized - cannot start auth');
      setLoadingInitial(false);
      return;
    }
    
    const initializeAuth = async () => {
      try {
        console.log('AuthContext: Getting initial session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('AuthContext: Error getting initial session:', error);
        } else {
          console.log('AuthContext: Initial session result:', session ? 'Session found' : 'No session');
        }
        
        setSession(session);
        setUser(session?.user ?? null);
        setLoadingInitial(false);
        console.log('AuthContext: Initialization complete');
      } catch (error) {
        console.error('AuthContext: Error during initialization:', error);
        setLoadingInitial(false);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('AuthContext: Auth state change event:', event, session ? 'Session present' : 'No session');
      setSession(session);
      setUser(session?.user ?? null);
      setLoadingInitial(false);
      setLoadingAuthAction(false); // Reset action loading on auth change
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email, password) => {
    setLoadingAuthAction(true);
    try {
      console.log('AuthContext: signIn called with email:', email);
      console.log('AuthContext: This is the REAL signIn function from AuthContext');
      console.log('AuthContext: About to set loadingAuthAction to true');
      console.log('AuthContext: Calling supabase.auth.signInWithPassword...');
      console.log('AuthContext: Waiting for supabase response...');
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      console.log('AuthContext: Supabase response received');
      console.log('AuthContext: data:', data);
      console.log('AuthContext: error:', error);
      
      if (error) throw error;
      
      console.log('AuthContext: Sign in successful');
      // Navigation will be handled by the navigation stack
    } catch (error) {
      console.error("Sign in error:", error.message);
      throw error;
    } finally {
      console.log('AuthContext: Setting loadingAuthAction to false');
      setLoadingAuthAction(false);
    }
  };

  const signUp = async (email, password) => {
    setLoadingAuthAction(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: 'rootandglow://OnboardingCarousel',
        },
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
    // Clear onboarding and privacy flags for next user
    await AsyncStorage.multiRemove(['onboardingComplete', 'privacyAccepted']);
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
