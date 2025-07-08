import { createClient } from "@supabase/supabase-js";
import Constants from 'expo-constants';
// Import AsyncStorage if you decide to use it for auth persistence explicitly, though Supabase handles it by default in React Native.
// import AsyncStorage from "@react-native-async-storage/async-storage";

const getSupabaseConfig = () => {
  // Use Constants.expoConfig.extra for Expo builds
  const expoUrl = Constants?.expoConfig?.extra?.SUPABASE_URL;
  const expoKey = Constants?.expoConfig?.extra?.SUPABASE_ANON_KEY;
  
  console.log('DEBUG: SUPABASE_URL:', expoUrl);
  console.log('DEBUG: SUPABASE_ANON_KEY:', expoKey ? expoKey.slice(0, 8) + '...' : undefined);
  
  if (!expoUrl || !expoKey) {
    console.error("Supabase configuration is not provided! Please check your app.json configuration.");
    return null;
  }
  
  return { url: expoUrl, key: expoKey };
};

const config = getSupabaseConfig();
if (!config) {
  console.error("Cannot initialize Supabase - no configuration available");
}

// Initialize the Supabase client
// Note: Supabase JS V2 automatically uses AsyncStorage in React Native environments.
// Explicitly passing AsyncStorage is generally not needed unless you have specific advanced requirements.
export const supabase = config ? createClient(config.url, config.key, {
  auth: {
    // storage: AsyncStorage, // Not typically needed for React Native with Supabase V2+
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // Crucial for React Native to prevent issues with URL-based session detection
  },
}) : null;

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
    const userResult = await supabase.auth.getUser();
    if (!userResult.data.user) {
      return { data: null, error: { message: 'User not authenticated' } };
    }
    const userId = userResult.data.user.id;

    console.log('DEBUG getLatestAIRoutine userResult:', userResult);
    console.log('DEBUG getLatestAIRoutine userId:', userId);

    const { data, error } = await supabase
      .from('ai_routines')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1);

    console.log('DEBUG getLatestAIRoutine data:', data, 'error:', error);

    return { data: data?.[0] || null, error };
  } catch (e) {
    console.error('getLatestAIRoutine error:', e);
    return { data: null, error: { message: 'Failed to fetch routine' } };
  }
};

// Request a new AI routine (calls AI and upserts result)
export const requestAIRoutine = async () => {
  try {
    const userResult = await supabase.auth.getUser();
    if (!userResult.data.user) {
      return { data: null, error: { message: 'User not authenticated' } };
    }
    const userId = userResult.data.user.id;

    console.log('DEBUG requestAIRoutine userId:', userResult.data.user.id);

    // 1. Get latest analysis
    const { data: analysis, error: analysisError } = await getHairAnalysisResult(userId);
    if (analysisError || !analysis) {
      return { data: null, error: { message: 'No analysis found. Please complete a hair analysis first.' } };
    }

    // 2. Call AI to generate routine
    let aiResult = await callTogetherAIForRoutine(analysis);
    console.log('AI routine raw result:', aiResult);

    // Use fallback routine if AI fails
    if (!aiResult || !aiResult.steps || aiResult.steps.length === 0) {
      aiResult = {
        title: 'Sample Personalized Routine',
        steps: [
          { title: 'Gentle Cleansing', description: 'Use a sulfate-free shampoo' },
          { title: 'Conditioning', description: 'Apply conditioner from mid-lengths to ends' },
          { title: 'Styling', description: 'Apply heat protectant and style as desired' }
        ]
      };
    }

    let routineObj = aiResult;
    if (!routineObj || !routineObj.steps || routineObj.steps.length === 0) {
      // Use fallback routine if AI and parsing both fail
      routineObj = {
        title: 'Sample Personalized Routine',
        steps: [
          { title: 'Gentle Cleansing', description: 'Use a sulfate-free shampoo' },
          { title: 'Conditioning', description: 'Apply conditioner from mid-lengths to ends' },
          { title: 'Styling', description: 'Apply heat protectant and style as desired' }
        ]
      };
    }

    // 3. Upsert routine in ai_routines
    const { data: upserted, error: upsertError } = await supabase
      .from('ai_routines')
      .upsert({
        user_id: userId,
        analysis_id: analysis.id,
        routine: routineObj,
        created_at: new Date().toISOString()
      }, { onConflict: 'user_id' })
      .select();

    console.log('DEBUG requestAIRoutine upserted:', upserted, 'error:', upsertError);

    return { data: upserted?.[0] || null, error: upsertError };
  } catch (e) {
    console.log('Routine generation error:', e);
    // Use fallback routine if everything fails
    const fallbackRoutine = {
      title: 'Sample Personalized Routine',
      steps: [
        { title: 'Gentle Cleansing', description: 'Use a sulfate-free shampoo' },
        { title: 'Conditioning', description: 'Apply conditioner from mid-lengths to ends' },
        { title: 'Styling', description: 'Apply heat protectant and style as desired' }
      ]
    };
    return { data: { routine: fallbackRoutine }, error: null };
  }
};

// Helper: Call Together AI to generate a routine from analysis data
import { callTogetherAIForRoutine } from './AIService';
const generateRoutineFromAI = async (analysisData) => {
  try {
    return await callTogetherAIForRoutine(analysisData);
  } catch (error) {
    console.error('Error generating routine from AI:', error);
    return null;
  }
};

// --- Enhanced Routine Functions ---

// Get all user routines with progress
export const getUserRoutines = async () => {
  try {
    const userResult = await supabase.auth.getUser();
    if (!userResult.data.user) {
      return { data: null, error: { message: 'User not authenticated' } };
    }
    const userId = userResult.data.user.id;

    // Try to use the database function first
    const { data, error } = await supabase
      .rpc('get_user_routines_with_progress', { user_uuid: userId });

    if (error) {
      console.error('getUserRoutines database function error:', error);
      
      // Fallback: Get routines without progress
      const { data: routines, error: routinesError } = await supabase
        .from('user_routines')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (routinesError) {
        console.error('getUserRoutines fallback error:', routinesError);
        return { data: null, error: routinesError };
      }

      // Transform data to match expected format
      const transformedRoutines = routines.map(routine => ({
        routine_id: routine.id,
        title: routine.title,
        description: routine.description,
        category: routine.category,
        icon: routine.icon,
        color: routine.color,
        is_ai_generated: routine.is_ai_generated,
        total_steps: 0,
        completed_steps: 0,
        progress_percentage: 0
      }));

      return { data: transformedRoutines, error: null };
    }

    return { data, error: null };
  } catch (e) {
    console.error('getUserRoutines error:', e);
    return { data: null, error: { message: 'Failed to fetch routines' } };
  }
};

// Get a specific routine with its steps
export const getRoutineWithSteps = async (routineId) => {
  try {
    const { data, error } = await supabase
      .rpc('get_routine_with_steps', { routine_uuid: routineId });

    if (error) {
      console.error('getRoutineWithSteps error:', error);
      return { data: null, error };
    }

    return { data: data[0], error: null };
  } catch (e) {
    console.error('getRoutineWithSteps error:', e);
    return { data: null, error: { message: 'Failed to fetch routine' } };
  }
};

// Create a new routine
export const createRoutine = async (routineData) => {
  try {
    const userResult = await supabase.auth.getUser();
    if (!userResult.data.user) {
      return { data: null, error: { message: 'User not authenticated' } };
    }
    const userId = userResult.data.user.id;

    // Insert routine
    const { data: routine, error: routineError } = await supabase
      .from('user_routines')
      .insert({
        user_id: userId,
        title: routineData.title,
        description: routineData.description,
        category: routineData.category,
        icon: routineData.icon,
        color: routineData.color,
        is_ai_generated: routineData.is_ai_generated || false,
        analysis_id: routineData.analysis_id
      })
      .select()
      .single();

    if (routineError) {
      console.error('createRoutine routine error:', routineError);
      return { data: null, error: routineError };
    }

    // Insert steps if provided
    if (routineData.steps && routineData.steps.length > 0) {
      const stepsData = routineData.steps.map((step, index) => ({
        routine_id: routine.id,
        step_order: index,
        title: step.title,
        description: step.description,
        duration: step.duration
      }));

      const { error: stepsError } = await supabase
        .from('routine_steps')
        .insert(stepsData);

      if (stepsError) {
        console.error('createRoutine steps error:', stepsError);
        // Delete the routine if steps insertion fails
        await supabase.from('user_routines').delete().eq('id', routine.id);
        return { data: null, error: stepsError };
      }
    }

    return { data: routine, error: null };
  } catch (e) {
    console.error('createRoutine error:', e);
    return { data: null, error: { message: 'Failed to create routine' } };
  }
};

// Update a routine
export const updateRoutine = async (routineId, routineData) => {
  try {
    const { data, error } = await supabase
      .from('user_routines')
      .update({
        title: routineData.title,
        description: routineData.description,
        category: routineData.category,
        icon: routineData.icon,
        color: routineData.color
      })
      .eq('id', routineId)
      .select()
      .single();

    if (error) {
      console.error('updateRoutine error:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (e) {
    console.error('updateRoutine error:', e);
    return { data: null, error: { message: 'Failed to update routine' } };
  }
};

// Delete a routine
export const deleteRoutine = async (routineId) => {
  try {
    const { error } = await supabase
      .from('user_routines')
      .delete()
      .eq('id', routineId);

    if (error) {
      console.error('deleteRoutine error:', error);
      return { error };
    }

    return { error: null };
  } catch (e) {
    console.error('deleteRoutine error:', e);
    return { error: { message: 'Failed to delete routine' } };
  }
};

// Get routine categories
export const getRoutineCategories = async () => {
  try {
    const { data, error } = await supabase
      .from('routine_categories')
      .select('*')
      .order('id');

    if (error) {
      console.error('getRoutineCategories error:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (e) {
    console.error('getRoutineCategories error:', e);
    return { data: null, error: { message: 'Failed to fetch categories' } };
  }
};

// Save routine notification
export const saveRoutineNotification = async (notificationData) => {
  try {
    const userResult = await supabase.auth.getUser();
    if (!userResult.data.user) {
      return { data: null, error: { message: 'User not authenticated' } };
    }
    const userId = userResult.data.user.id;

    const { data, error } = await supabase
      .from('routine_notifications')
      .insert({
        user_id: userId,
        routine_id: notificationData.routine_id,
        step_index: notificationData.step_index,
        notification_id: notificationData.notification_id,
        notification_type: notificationData.notification_type,
        scheduled_time: notificationData.scheduled_time
      })
      .select()
      .single();

    if (error) {
      console.error('saveRoutineNotification error:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (e) {
    console.error('saveRoutineNotification error:', e);
    return { data: null, error: { message: 'Failed to save notification' } };
  }
};

// Get user's routine notifications
export const getUserRoutineNotifications = async () => {
  try {
    const userResult = await supabase.auth.getUser();
    if (!userResult.data.user) {
      return { data: null, error: { message: 'User not authenticated' } };
    }
    const userId = userResult.data.user.id;

    const { data, error } = await supabase
      .from('routine_notifications')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('scheduled_time');

    if (error) {
      console.error('getUserRoutineNotifications error:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (e) {
    console.error('getUserRoutineNotifications error:', e);
    return { data: null, error: { message: 'Failed to fetch notifications' } };
  }
};

// Deactivate routine notification
export const deactivateRoutineNotification = async (notificationId) => {
  try {
    const { error } = await supabase
      .from('routine_notifications')
      .update({ is_active: false })
      .eq('id', notificationId);

    if (error) {
      console.error('deactivateRoutineNotification error:', error);
      return { error };
    }

    return { error: null };
  } catch (e) {
    console.error('deactivateRoutineNotification error:', e);
    return { error: { message: 'Failed to deactivate notification' } };
  }
};

// --- Enhanced Progress Functions ---

// Update the existing setRoutineStepChecked function to work with new schema
export const setRoutineStepChecked = async (routineId, stepIndex, checked) => {
  try {
    const userResult = await supabase.auth.getUser();
    if (!userResult.data.user) {
      return { data: null, error: { message: 'User not authenticated' } };
    }
    const userId = userResult.data.user.id;

    const { data, error } = await supabase
      .from('routine_progress')
      .upsert({
        user_id: userId,
        routine_id: routineId,
        step_index: stepIndex,
        completed: checked,
        completed_at: checked ? new Date().toISOString() : null
      }, { onConflict: ['user_id', 'routine_id', 'step_index'] })
      .select()
      .single();

    if (error) {
      console.error('setRoutineStepChecked error:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (e) {
    console.error('setRoutineStepChecked error:', e);
    return { data: null, error: { message: 'Failed to update progress' } };
  }
};

// Get routine progress (updated for new schema)
export const getRoutineProgress = async (routineId) => {
  try {
    const userResult = await supabase.auth.getUser();
    if (!userResult.data.user) {
      return { data: null, error: { message: 'User not authenticated' } };
    }
    const userId = userResult.data.user.id;

    const { data, error } = await supabase
      .from('routine_progress')
      .select('step_index, completed')
      .eq('user_id', userId)
      .eq('routine_id', routineId);

    if (error) {
      console.error('getRoutineProgress error:', error);
      return { data: null, error };
    }

    // Convert to object with step_index as key
    const progressObj = {};
    data.forEach(item => {
      progressObj[item.step_index] = item.completed;
    });

    return { data: progressObj, error: null };
  } catch (e) {
    console.error('getRoutineProgress error:', e);
    return { data: null, error: { message: 'Failed to fetch progress' } };
  }
};
