import { supabase } from "./SupabaseService"; // Assuming Supabase client is exported from here

/**
 * Calls the Supabase Edge Function to get hair advice from the AI.
 * @param {string} prompt - The user's query or prompt for the AI.
 * @returns {Promise<{aiResponse: string | null, error: string | null}>}
 *          An object containing the AI response or an error message.
 */
export const getAIHairAdvice = async (prompt) => {
  if (!prompt || typeof prompt !== "string" || prompt.trim() === "") {
    console.error("AIService: Prompt is empty or invalid.");
    return { aiResponse: null, error: "Prompt cannot be empty." };
  }

  try {
    console.log("AIService: Invoking Edge Function \"get-ai-hair-advice\" with prompt:", prompt);

    // Invoke the Supabase Edge Function.
    // The body will be automatically serialized to JSON.
    const { data, error } = await supabase.functions.invoke("get-ai-hair-advice", {
      body: { prompt: prompt },
    });

    if (error) {
      console.error("AIService: Error invoking Edge Function:", error.message);
      // The error object from functions.invoke might have more details, e.g., error.context
      let errorMessage = error.message;
      if (error.context && error.context.message) { // Check for nested error message from function
        errorMessage = error.context.message;
      } else if (typeof error === 'object' && error !== null && 'message' in error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      return { aiResponse: null, error: `Failed to get AI advice: ${errorMessage}` };
    }

    // The Edge Function is expected to return a JSON object like: { aiResponse: "..." }
    // or { error: "..." }
    if (data && data.error) { // Check if the function itself returned an error object
        console.error("AIService: Edge Function returned an error:", data.error);
        return { aiResponse: null, error: data.error };
    }

    if (data && data.aiResponse) {
      console.log("AIService: Successfully received AI response.");
      return { aiResponse: data.aiResponse, error: null };
    } else {
      console.warn("AIService: AI response format is unexpected or empty.", data);
      return { aiResponse: null, error: "Received an unexpected or empty response from the AI service." };
    }

  } catch (e) {
    console.error("AIService: Exception calling Edge Function:", e);
    let errorMessage = "An unexpected error occurred while contacting the AI service.";
    if (e instanceof Error) {
        errorMessage = e.message;
    }
    return { aiResponse: null, error: errorMessage };
  }
};

// Placeholder for other AI related services if needed in the future
// export const analyzeHairImage = async (imageUri) => { ... }
