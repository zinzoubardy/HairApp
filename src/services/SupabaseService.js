import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@env';
// Import AsyncStorage if you decide to use it for auth persistence explicitly, though Supabase handles it by default in React Native.
// import AsyncStorage from "@react-native-async-storage/async-storage";

// Ideally, these would come from environment variables
// For example, using react-native-dotenv:
// import { SUPABASE_URL, SUPABASE_ANON_KEY } from "@env";

// Basic error checking for the keys
if (!SUPABASE_URL) {
  console.error("Supabase URL is not provided! Please check your configuration.");
}
if (!SUPABASE_ANON_KEY) {
  console.error("Supabase Anon Key is not provided! Please check your configuration.");
}

console.log('DEBUG: SUPABASE_URL:', SUPABASE_URL);
console.log('DEBUG: SUPABASE_ANON_KEY:', SUPABASE_ANON_KEY ? SUPABASE_ANON_KEY.slice(0, 8) + '...' : undefined);

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
      id, username, full_name, avatar_url, hair_goal, allergies,
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

// --- Trending Recipes Helper Functions ---
export const getTrendingRecipes = async (limit = 10) => {
  try {
    const { data, error } = await supabase
      .from("trending_recipes")
      .select("id, title, short_description, image_url, ingredients, instructions, preparation_time_minutes, difficulty, tags")
      .order("created_at", { ascending: false }) // Or order by some popularity metric later
      .limit(limit);

    if (error) {
      console.error("Error fetching trending recipes:", error.message);
      // throw error; // Or return error object
    }
    return { data, error };
  } catch (e) {
    console.error("Exception fetching trending recipes:", e);
    // throw e; // Or return error object
    return { data: null, error: { message: e.message || "An unexpected error occurred while fetching recipes." } };
  }
};

// --- Storage Helper Functions ---
export const uploadProfileImage = async (userId, fileUri, angle) => {
  if (!userId || !fileUri || !angle) {
    return { data: null, error: { message: "User ID, file URI, and angle are required." } };
  }

  try {
    console.log('=== CLOUDINARY UPLOAD START ===');
    console.log('userId:', userId);
    console.log('fileUri:', fileUri);
    console.log('angle:', angle);

    // Prepare form data for Cloudinary
    const data = new FormData();
    data.append('file', {
      uri: fileUri,
      type: 'image/jpeg',
      name: `${angle}.jpg`,
    });
    data.append('upload_preset', 'user_hair_images');
    data.append('folder', `${userId}`); // Optional: organize by user

    // Upload to Cloudinary
    const res = await fetch('https://api.cloudinary.com/v1_1/db4j4kycn/image/upload', {
      method: 'POST',
      body: data,
    });
    const result = await res.json();
    if (!result.secure_url) {
      console.error('Cloudinary upload failed:', result);
      return { data: null, error: { message: 'Failed to upload image to Cloudinary.' } };
    }
    console.log('Cloudinary upload successful:', result.secure_url);
    return { data: { publicUrl: result.secure_url }, error: null };
  } catch (e) {
    console.error(`Exception during ${angle} image upload to Cloudinary:`, e);
    return { data: null, error: { message: e.message || `An unexpected error occurred during ${angle} image upload.` } };
  }
};

// Helper function to decode base64 to Uint8Array
function decode(base64) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

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

// Get the latest hair analysis result for a user
export const getHairAnalysisResult = async (userId) => {
  if (!userId) {
    console.error("User ID is required to fetch hair analysis result.");
    return { data: null, error: { message: "User ID is required." } };
  }

  try {
    const { data, error } = await supabase
      .from("hair_analysis_results")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false }) // Get the most recent analysis
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      console.error("Error fetching hair analysis result:", error.message);
      return { data: null, error };
    }

    // If no analysis found, return null data but no error
    if (error && error.code === 'PGRST116') {
      return { data: null, error: null };
    }

    return { data, error: null };
  } catch (e) {
    console.error("Exception fetching hair analysis result:", e);
    return { data: null, error: { message: e.message || "An unexpected error occurred while fetching analysis." } };
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
      id, username, full_name, avatar_url, hair_goal, allergies,
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

// --- AI Routine Helper Functions ---

// Get the latest AI-generated routine for the current user
export const getLatestAIRoutine = async () => {
  try {
    console.log('getLatestAIRoutine called');
    const userResult = await supabase.auth.getUser();
    console.log('DEBUG getLatestAIRoutine userResult:', userResult);
    const userId = userResult.data.user?.id;
    console.log('DEBUG getLatestAIRoutine userId:', userId);
    const { data, error } = await supabase
      .from('ai_routines')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    console.log('DEBUG getLatestAIRoutine data:', data, 'error:', error);
    return { data, error };
  } catch (e) {
    console.error('getLatestAIRoutine error:', e);
    return { data: null, error: e };
  }
};

// Request a new AI routine (calls AI and upserts result)
export const requestAIRoutine = async () => {
  try {
    // 1. Get latest hair analysis for the user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: { message: 'User not authenticated.' } };
    console.log('DEBUG requestAIRoutine userId:', user.id);
    const { data: analysis, error: analysisError } = await supabase
      .from('hair_analysis_results')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    if (analysisError || !analysis) {
      return { data: null, error: { message: 'No hair analysis found.' } };
    }

    // 2. Call AI to generate routine
    let aiResult = await callTogetherAIForRoutine(analysis);
    console.log('AI routine raw result:', aiResult);
    if (aiResult && aiResult.error) {
      // Use fallback routine if AI fails
      aiResult = {
        title: 'Sample Personalized Routine',
        steps: [
          { title: 'Step 1: Gentle Cleansing', description: 'Use a gentle shampoo and conditioner to maintain the health and integrity of your hair.' },
          { title: 'Step 2: Regular Trimming', description: 'Schedule regular trimming or styling sessions to keep your hair tidy and reduce messiness.' },
          { title: 'Step 3: Nourish & Protect', description: 'Apply a hair serum or oil to tame texture and add shine. Protect your hair from wind and environmental damage.' },
        ],
      };
    }
    let routineObj = aiResult;
    if (!routineObj || !routineObj.steps || routineObj.steps.length === 0) {
      // Use fallback routine if AI and parsing both fail
      routineObj = {
        title: 'Sample Personalized Routine',
        steps: [
          { title: 'Step 1: Gentle Cleansing', description: 'Use a gentle shampoo and conditioner to maintain the health and integrity of your hair.' },
          { title: 'Step 2: Regular Trimming', description: 'Schedule regular trimming or styling sessions to keep your hair tidy and reduce messiness.' },
          { title: 'Step 3: Nourish & Protect', description: 'Apply a hair serum or oil to tame texture and add shine. Protect your hair from wind and environmental damage.' },
        ],
      };
    }

    // 3. Upsert routine in ai_routines
    const { data: upserted, error: upsertError } = await supabase
      .from('ai_routines')
      .upsert({
        user_id: user.id,
        analysis_id: analysis.id,
        routine: routineObj,
        created_at: new Date().toISOString(),
      }, { onConflict: ['user_id'] })
      .select()
      .single();
    console.log('DEBUG requestAIRoutine upserted:', upserted, 'error:', upsertError);
    if (upsertError) {
      return { data: null, error: upsertError };
    }
    return { data: upserted, error: null };
  } catch (e) {
    console.log('Routine generation error:', e);
    // Use fallback routine if everything fails
    const fallbackRoutine = {
      title: 'Sample Personalized Routine',
      steps: [
        { title: 'Step 1: Gentle Cleansing', description: 'Use a gentle shampoo and conditioner to maintain the health and integrity of your hair.' },
        { title: 'Step 2: Regular Trimming', description: 'Schedule regular trimming or styling sessions to keep your hair tidy and reduce messiness.' },
        { title: 'Step 3: Nourish & Protect', description: 'Apply a hair serum or oil to tame texture and add shine. Protect your hair from wind and environmental damage.' },
      ],
    };
    return { data: { routine: fallbackRoutine }, error: null };
  }
};

// Helper: Call Together AI to generate a routine from analysis data
import { callTogetherAIForRoutine } from './AIService';
const generateRoutineFromAI = async (analysisData) => {
  try {
    return await callTogetherAIForRoutine(analysisData);
  } catch (e) {
    return null;
  }
};

// --- Routine Progress Functions ---

export const getRoutineProgress = async (routineId) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return {};
  const { data, error } = await supabase
    .from('routine_progress')
    .select('step_index, checked')
    .eq('user_id', user.id)
    .eq('routine_id', routineId);
  if (error || !data) return {};
  // Return as { [stepIndex]: checked }
  return data.reduce((acc, row) => {
    acc[row.step_index] = row.checked;
    return acc;
  }, {});
};

export const setRoutineStepChecked = async (routineId, stepIndex, checked) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase
    .from('routine_progress')
    .upsert({
      user_id: user.id,
      routine_id: routineId,
      step_index: stepIndex,
      checked,
      updated_at: new Date().toISOString(),
    }, { onConflict: ['user_id', 'routine_id', 'step_index'] });
};
