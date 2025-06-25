import { TOGETHER_AI_API_KEY } from "../config/apiKeys";
// import Together from "together-ai";

// const together = new Together({ apiKey: TOGETHER_AI_API_KEY });

export const getAIHairstyleAdvice = async (prompt) => {
  if (!prompt || typeof prompt !== 'string' || prompt.trim() === "") {
    return { success: false, error: "Prompt cannot be empty." };
  }
  try {
    console.log("Sending prompt to Together AI:", prompt);
    // const response = await together.chat.completions.create({
    //   messages: [{ role: "user", content: prompt }],
    //   model: "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free",
    // });
    // console.log("Received response from Together AI:", response);
    // if (response && response.choices && response.choices[0] && response.choices[0].message) {
    //   return { success: true, data: response.choices[0].message.content };
    // } else {
    //   console.error("Unexpected response structure from Together AI:", response);
    //   return { success: false, error: "Failed to parse AI response." };
    // }
    return { success: true, data: "AI service temporarily disabled for debugging." };
  } catch (error) {
    console.error("Error calling Together AI API:", error);
    return { success: false, error: error.message || "An unknown error occurred with the AI service." };
  }
};

export const getHairAnalysis = async (profileData, imageReferences) => {
  if (!profileData) {
    return { success: false, error: "Profile data is required for analysis." };
  }

  // Destructure necessary fields from profileData, providing defaults for robustness
  const {
    hair_goal = "Not specified",
    allergies = "Not specified",
    hair_color = "Not specified",
    hair_condition = "Not specified",
    hair_concerns_preferences = "Not specified",
    // Image URLs will be passed in imageReferences
  } = profileData;

  let prompt = `
    As an expert AI hair and scalp advisor, please analyze the following user profile information and provide an initial assessment of their hair and scalp state. Offer some preliminary advice and suggestions based on this analysis.

    User's Hair Profile:
    - Primary Hair Goal: ${hair_goal}
    - Known Allergies/Sensitivities: ${allergies}
    - Hair Color: ${hair_color}
    - Current Hair Condition: ${hair_condition}
    - Hair Concerns & Preferences: ${hair_concerns_preferences}
  `;

  if (imageReferences && Object.keys(imageReferences).length > 0) {
    prompt += "\n\nThe user has provided references to images of their hair from different angles:\n";
    if (imageReferences.up) prompt += `- Image (Up View): Represents the top of the head/scalp. Reference: ${imageReferences.up}\n`;
    if (imageReferences.right) prompt += `- Image (Right Side View): Represents the right side of the hair. Reference: ${imageReferences.right}\n`;
    if (imageReferences.left) prompt += `- Image (Left Side View): Represents the left side of the hair. Reference: ${imageReferences.left}\n`;
    if (imageReferences.back) prompt += `- Image (Back View): Represents the back of the hair. Reference: ${imageReferences.back}\n`;
    prompt += "While you cannot see the images directly, consider what these perspectives might typically reveal about hair density, scalp health, hair texture, and potential damage when formulating your analysis.\n";
  } else {
    prompt += "\n\nNo images were provided for this analysis. Base your assessment on the textual information only.\n";
  }

  prompt += `
    Please structure your response STRICTLY as follows, using the exact headings and formatting:

    **1. Global Hair State Score:**
    Provide a percentage score (e.g., "75%") representing the overall health and condition of the hair and scalp based on all provided information. Briefly justify this score in one sentence.
    Example: "Global Hair State Score: 75% - Hair shows good potential but needs attention to dryness."

    **2. Detailed Scalp Analysis:**
    Provide a specific analysis of the scalp's condition. Mention any observed or inferred issues (dryness, oiliness, flakiness, sensitivity) and positive aspects.
    Example: "Scalp Analysis: The scalp appears to be normal to dry. There might be slight tightness if not moisturized regularly. No signs of severe irritation are inferred from the text."

    **3. Detailed Color Analysis:**
    Analyze the hair color characteristics based on user's input and typical considerations for such hair color (e.g., maintenance, potential for dryness if color-treated). If the user mentions color treatments, comment on their potential impact.
    Example: "Color Analysis: User states hair color is 'Dark Brown'. Dark brown hair can sometimes appear dull if not properly clarified. If color-treated, porosity might be a concern."

    **4. Key Observations & Potential Issues:**
    List 2-3 key observations or potential issues not covered above.
    Example: "Key Observations & Potential Issues:\n- Observation: User mentions 'frizz' as a concern.\n- Potential Issue: Allergies to 'Aloe Vera' need careful product selection."

    **5. Recommendations:**
    Provide 3-5 actionable recommendations. For each recommendation, suggest a simple keyword that could represent an icon (e.g., "IconHint: water-drop", "IconHint: leaf", "IconHint: scissors").
    Example: "Recommendations:\n- Recommendation: Use a sulfate-free moisturizing shampoo. IconHint: shampoo\n- Recommendation: Incorporate a weekly deep conditioning treatment. IconHint: conditioner-mask"

    Keep the tone helpful, informative, and professional. Ensure each section is clearly delineated.
  `;

  try {
    console.log("Sending hair analysis prompt to Together AI:", prompt);
    // const response = await together.chat.completions.create({
    //   messages: [{ role: "user", content: prompt }],
    //   model: "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free", // Using the specified model
    //   // Consider adding max_tokens if you want to control response length, e.g., max_tokens: 500
    // });
    // console.log("Received hair analysis response from Together AI:", response);
    // if (response && response.choices && response.choices[0] && response.choices[0].message) {
    //   return { success: true, data: response.choices[0].message.content };
    // } else {
    //   console.error("Unexpected response structure from Together AI for hair analysis:", response);
    //   return { success: false, error: "Failed to parse AI hair analysis response." };
    // }
    return { success: true, data: "AI hair analysis temporarily disabled for debugging." };
  } catch (error) {
    console.error("Error calling Together AI API for hair analysis:", error);
    return { success: false, error: error.message || "An unknown error occurred with the AI analysis service." };
  }
};

// You can add other AI related functions here in the future
