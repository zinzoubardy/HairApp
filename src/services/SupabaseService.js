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

// --- Profile Helper Functions ---

// Get the profile for the currently authenticated user
export const getProfile = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    // console.error("No user logged in to fetch profile.");
    // throw new Error("User not authenticated."); // Or return null if preferred
    return { data: null, error: { message: "User not authenticated." } };
  }

  try {
    const { data, error, status } = await supabase
      .from("profiles")
      .select("name, hair_goal, allergies") // Corrected: was full_name, username, avatar_url etc.
      .eq("id", user.id)
      .single(); // .single() assumes 0 or 1 row, errors if multiple

    if (error && status !== 406) { // 406: "Not a single row" - means no profile yet, which is fine
      console.error("Error fetching profile:", error.message);
      // throw error;
      return { data: null, error };
    }

    // If data is null and status was 406, it means no profile exists yet.
    // This can happen if the handle_new_user trigger hasn't run or populated these fields.
    // It is not an error in itself, the ProfileScreen should handle this.
    return { data, error: (status === 406 && !data) ? null : error }; // Return null error if it was just "no row"
  } catch (e) {
    console.error("Exception fetching profile:", e);
    // throw e;
    return { data: null, error: { message: e.message || "An unexpected error occurred."} };
  }
};

// Update (or insert if not exists) the profile for the authenticated user
export const updateProfile = async (profileData) => { // profileData should contain name, hair_goal, allergies
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    // console.error("No user logged in to update profile.");
    // throw new Error("User not authenticated.");
    return { data: null, error: { message: "User not authenticated." } };
  }

  const updates = {
    id: user.id, // Ensure ID is part of the upsert object
    ...profileData, // Spread the fields from profileData (name, hair_goal, allergies)
    updated_at: new Date().toISOString(),
  };

  try {
    // Using upsert to either insert a new profile or update an existing one.
    // The `handle_new_user` trigger should have created a row, so this will usually be an update.
    // However, upsert is safer.
    const { data, error } = await supabase
      .from("profiles")
      .upsert(updates)
      .select("name, hair_goal, allergies") // Select the fields we care about back
      .single(); // Expect a single row back after upsert

    if (error) {
      console.error("Error updating profile:", error.message);
      // throw error;
    }
    return { data, error };
  } catch (e) {
    console.error("Exception updating profile:", e);
    // throw e;
    return { data: null, error: { message: e.message || "An unexpected error occurred."} };
  }
};
