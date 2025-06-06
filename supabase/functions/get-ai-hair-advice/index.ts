// supabase/functions/get-ai-hair-advice/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts"; // Assuming a shared CORS file

// The Together AI API endpoint and model
const TOGETHER_AI_API_URL = "https://api.together.xyz/chat/completions";
const TOGETHER_AI_MODEL = "deepseek-ai/DeepSeek-R1-Distill-Llama-70B-free";

console.log("Edge Function `get-ai-hair-advice` is setting up.");

serve(async (req: Request) => {
  console.log("Request received:", req.method, req.url);

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    console.log("Handling OPTIONS request");
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Ensure the request method is POST
    if (req.method !== "POST") {
      console.warn("Invalid method:", req.method);
      return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse the request body
    let requestBody;
    try {
      requestBody = await req.json();
    } catch (e) {
      console.error("Error parsing request body:", e.message);
      return new Response(JSON.stringify({ error: "Invalid JSON payload" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { prompt } = requestBody;
    console.log("Received prompt:", prompt);

    if (!prompt) {
      console.warn("Prompt is missing from request body.");
      return new Response(JSON.stringify({ error: "Missing \"prompt\" in request body" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get the Together AI API key from environment variables
    const togetherAIApiKey = Deno.env.get("TOGETHER_AI_API_KEY");
    if (!togetherAIApiKey) {
      console.error("TOGETHER_AI_API_KEY is not set in environment variables.");
      return new Response(
        JSON.stringify({ error: "AI API key not configured on the server." }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    console.log("TOGETHER_AI_API_KEY retrieved successfully (first few chars):", togetherAIApiKey.substring(0,5));


    // Construct the payload for Together AI
    const togetherAIPayload = {
      messages: [{ role: "user", content: prompt }],
      model: TOGETHER_AI_MODEL,
      // You can add other parameters here if needed, e.g., max_tokens, temperature
      // stream: false, // Ensure stream is false for a single response object
    };

    console.log("Sending request to Together AI with payload:", JSON.stringify(togetherAIPayload));

    const response = await fetch(TOGETHER_AI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${togetherAIApiKey}`,
      },
      body: JSON.stringify(togetherAIPayload),
    });

    console.log("Received response from Together AI. Status:", response.status);

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("Together AI API request failed:", response.status, errorBody);
      return new Response(
        JSON.stringify({ error: `AI API request failed: ${response.status} ${errorBody}` }),
        {
          status: 500, // Or map to response.status if appropriate
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const responseData = await response.json();
    console.log("Together AI response data:", JSON.stringify(responseData));

    if (!responseData.choices || responseData.choices.length === 0 || !responseData.choices[0].message || !responseData.choices[0].message.content) {
      console.error("Invalid response structure from Together AI:", responseData);
      return new Response(
        JSON.stringify({ error: "Invalid response structure from AI." }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const aiMessageContent = responseData.choices[0].message.content;

    return new Response(JSON.stringify({ aiResponse: aiMessageContent }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Unhandled error in Edge Function:", error.message, error.stack);
    return new Response(JSON.stringify({ error: error.message || "An unexpected error occurred." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

// Create a _shared/cors.ts file if it does not exist
// This is a common pattern for Supabase Edge Functions
// supabase/functions/_shared/cors.ts
// export const corsHeaders = {
//  "Access-Control-Allow-Origin": "*", // Or specify your app's domain for production
//  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
// };
