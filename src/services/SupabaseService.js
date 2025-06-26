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
    console.log('=== UPLOAD DEBUG START ===');
    console.log('userId:', userId);
    console.log('fileUri:', fileUri);
    console.log('angle:', angle);
    
    const fileExtension = fileUri.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `${angle}.${fileExtension}`;
    const filePath = `${userId}/${fileName}`; // Store in folder named after userId
    
    console.log('fileExtension:', fileExtension);
    console.log('fileName:', fileName);
    console.log('filePath:', filePath);

    // Use base64 approach for better React Native compatibility
    console.log('Converting file to base64...');
    const response = await fetch(fileUri);
    console.log('Fetch response status:', response.status);
    console.log('Fetch response ok:', response.ok);
    
    if (!response.ok) {
      console.error('Fetch failed:', response.status, response.statusText);
      return { data: null, error: { message: `Failed to fetch file: ${response.status} ${response.statusText}` } };
    }
    
    // Convert to base64
    const blob = await response.blob();
    const reader = new FileReader();
    
    const base64Promise = new Promise((resolve, reject) => {
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
    });
    
    reader.readAsDataURL(blob);
    const base64Data = await base64Promise;
    
    // Extract the base64 part (remove data:image/jpeg;base64, prefix)
    const base64String = base64Data.split(',')[1];
    
    console.log('Base64 conversion successful');
    console.log('Base64 length:', base64String.length);
    
    if (!base64String) {
      console.error('Base64 conversion failed!');
      return { data: null, error: { message: 'Failed to convert image to base64' } };
    }

    // Determine content type
    let contentType = 'image/jpeg'; // Default
    if (fileExtension === 'png') {
      contentType = 'image/png';
    } else if (fileExtension === 'webp') {
      contentType = 'image/webp';
    }
    
    console.log('Content type:', contentType);
    console.log('Upload path:', filePath);
    console.log('Bucket name: user.hair.images');

    // Upload using base64
    const { data, error: uploadError } = await supabase.storage
      .from('user.hair.images')
      .upload(filePath, decode(base64String), {
        contentType: contentType,
        upsert: true,
      });

    console.log('=== UPLOAD DEBUG END ===');

    if (uploadError) {
      console.error(`Error uploading ${angle} image:`, uploadError.message);
      console.error('Upload error details:', uploadError);
      return { data: null, error: uploadError };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('user.hair.images')
      .getPublicUrl(filePath);

    if (!urlData || !urlData.publicUrl) {
        console.error(`Error getting public URL for ${angle} image.`);
        return { data: null, error: { message: `Failed to get public URL for ${angle} image after upload.`} };
    }

    return { data: { publicUrl: urlData.publicUrl }, error: null };

  } catch (e) {
    console.error(`Exception during ${angle} image upload:`, e);
    console.error('Exception details:', e);
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
