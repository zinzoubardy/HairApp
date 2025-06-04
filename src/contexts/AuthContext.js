import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "./SupabaseService"; // Corrected path

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

  const signUp = async (email, password) => {
    setLoadingAuthAction(true);
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
    });
    setLoadingAuthAction(false);
    return { data, error };
  };

  const signInWithPassword = async (email, password) => {
    setLoadingAuthAction(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });
    setLoadingAuthAction(false);
    return { data, error };
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
    signInWithPassword,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
