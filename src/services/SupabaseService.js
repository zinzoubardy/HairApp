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
    const selectFields = `
      username, full_name, avatar_url, hair_goal, allergies,
      hair_color, hair_condition, hair_concerns_preferences,
      profile_pic_up_url, profile_pic_right_url, profile_pic_left_url, profile_pic_back_url
    `;
    const { data, error, status } = await supabase
      .from("profiles")
      .select(selectFields)
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

// --- Hair Analysis Results Helper Functions ---

export const saveHairAnalysisResult = async (userId, analysisResponse, imageReferences, notes = null) => {
  if (!userId || !analysisResponse) {
    console.error("User ID and analysis data are required to save hair analysis result.");
    return { data: null, error: { message: "User ID and analysis data are required." } };
  }

  // Consolidate image_url logic: use a primary image if available, or just store all refs in analysis_data
  // For now, per decision, image_url will be a placeholder or derived if needed,
  // and main image info is within analysis_data.
  // The schema has `image_url` as NOT NULL. We need to provide something.
  // Let's use the 'up' view if available, otherwise a placeholder.
  const primaryImageUrl = imageReferences?.up || imageReferences?.right || imageReferences?.left || imageReferences?.back || "no_primary_image";


  const newAnalysisEntry = {
    user_id: userId,
    // Store the actual AI response string in analysis_data for now.
    // Or, if AI response is structured JSON, it can be stored directly.
    // Assuming analysisResponse is the text string from AI.
    analysis_data: {
        ai_response: analysisResponse,
        image_references: imageReferences || {} // Store the image references object
    },
    image_url: primaryImageUrl, // Fulfill NOT NULL constraint, can be improved later
    notes: notes, // Optional notes
    // created_at is auto-generated by Supabase
  };

  try {
    const { data, error } = await supabase
      .from("hair_analysis_results")
      .insert(newAnalysisEntry)
      .select() // Select the newly created record
      .single();

    if (error) {
      console.error("Error saving hair analysis result:", error.message);
    }
    return { data, error };
  } catch (e) {
    console.error("Exception saving hair analysis result:", e);
    return { data: null, error: { message: e.message || "An unexpected error occurred while saving analysis." } };
  }
};

// Update (or insert if not exists) the profile for the authenticated user
export const updateProfile = async (profileData) => { // profileData should contain username, full_name, avatar_url, hair_goal, allergies
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
    const selectFields = `
      username, full_name, avatar_url, hair_goal, allergies,
      hair_color, hair_condition, hair_concerns_preferences,
      profile_pic_up_url, profile_pic_right_url, profile_pic_left_url, profile_pic_back_url
    `;
    const { data, error } = await supabase
      .from("profiles")
      .upsert(updates)
      .select(selectFields) // Select all fields back
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

// --- Routine Helper Functions ---

// Get all routines for the currently authenticated user
export const getRoutines = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { data: null, error: { message: "User not authenticated." } };
  }

  try {
    const { data, error } = await supabase
      .from("routines")
      .select("*") // Select all columns for routines
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }); // Order by creation date

    if (error) {
      console.error("Error fetching routines:", error.message);
    }
    return { data, error };
  } catch (e) {
    console.error("Exception fetching routines:", e);
    return { data: null, error: { message: e.message || "An unexpected error occurred."} };
  }
};

// Create a new routine for the authenticated user
export const createRoutine = async (routineData) => { // routineData: { title, description, routine_type, steps }
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { data: null, error: { message: "User not authenticated." } };
  }

  const newRoutine = {
    user_id: user.id,
    ...routineData, // title, description, routine_type, steps
  };

  try {
    const { data, error } = await supabase
      .from("routines")
      .insert(newRoutine)
      .select("*") // Select all columns of the newly created routine
      .single(); // Expect a single row back

    if (error) {
      console.error("Error creating routine:", error.message);
    }
    return { data, error };
  } catch (e) {
    console.error("Exception creating routine:", e);
    return { data: null, error: { message: e.message || "An unexpected error occurred."} };
  }
};

// Update an existing routine
export const updateRoutine = async (routineId, updates) => { // updates: { title, description, routine_type, steps }
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    // Although RLS would prevent unauthorized updates, checking user upfront is good practice.
    return { data: null, error: { message: "User not authenticated." } };
  }

  try {
    // We don't explicitly check if the routine belongs to the user here,
    // as RLS policies on the 'routines' table should enforce this.
    // The .eq('user_id', user.id) in RLS policy is key.
    const { data, error } = await supabase
      .from("routines")
      .update(updates)
      .eq("id", routineId) // Specify which routine to update
      .select("*") // Select all columns of the updated routine
      .single(); // Expect a single row back

    if (error) {
      console.error("Error updating routine:", error.message);
    }
    return { data, error };
  } catch (e) {
    console.error("Exception updating routine:", e);
    return { data: null, error: { message: e.message || "An unexpected error occurred."} };
  }
};

// Delete a routine
export const deleteRoutine = async (routineId) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { data: null, error: { message: "User not authenticated." } };
  }

  try {
    // RLS policies should ensure users can only delete their own routines.
    const { data, error } = await supabase // 'data' will be null on successful delete with no select
      .from("routines")
      .delete()
      .eq("id", routineId);
      // Removed .single() and .select() as delete might not return the record by default
      // or it might error if select() is used and no row is found (e.g. already deleted)

    if (error) {
      console.error("Error deleting routine:", error.message);
    }
    // For delete, Supabase client often returns { data: null, error: null } on success
    // or { data: null, error: SomeError } on failure.
    // If you need to confirm a row was deleted, you might need a select before delete or check count.
    // For simplicity, we return the direct result.
    return { data, error };
  } catch (e) {
    console.error("Exception deleting routine:", e);
    return { data: null, error: { message: e.message || "An unexpected error occurred."} };
  }
};
