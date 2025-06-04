import { createClient } from "@supabase/supabase-js";
// Import AsyncStorage if you decide to use it for auth persistence explicitly, though Supabase handles it by default in React Native.
// import AsyncStorage from "@react-native-async-storage/async-storage";

// Ideally, these would come from environment variables
// For example, using react-native-dotenv:
// import { SUPABASE_URL, SUPABASE_ANON_KEY } from "@env";

const SUPABASE_URL = "https://rsttygxdlrbkplebzhxm.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzdHR5Z3hkbHJia3BsZWJ6aHhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwNzk5OTksImV4cCI6MjA2NDY1NTk5OX0.UqaPHbaJYaNdTO1cJP7WG7LtcUw6sWYpgzv-HXBOCQQ";

// Basic error checking for the keys
if (!SUPABASE_URL) {
  console.error("Supabase URL is not provided! Please check your configuration.");
}
if (!SUPABASE_ANON_KEY) {
  console.error("Supabase Anon Key is not provided! Please check your configuration.");
}

// Initialize the Supabase client
// Note: Supabase JS V2 automatically uses AsyncStorage in React Native environments.
// Explicitly passing AsyncStorage is generally not needed unless you have specific advanced requirements.
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    // storage: AsyncStorage, // Not typically needed for React Native with Supabase V2+
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // Crucial for React Native to prevent issues with URL-based session detection
  },
});

// Example of a simple helper function (optional, can be added as needed later)
// export const getCurrentUser = async () => {
//   const { data: { user } } = await supabase.auth.getUser();
//   return user;
// };
// export const signOutUser = async () => {
//   const { error } = await supabase.auth.signOut();
//   return error;
// };
