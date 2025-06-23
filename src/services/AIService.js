import Together from "together-ai";
import { TOGETHER_AI_API_KEY } from "../config/apiKeys.js";

const together = new Together({ apiKey: TOGETHER_AI_API_KEY });

export const getAIHairstyleAdvice = async (prompt) => {
  if (!prompt || typeof prompt !== 'string' || prompt.trim() === "") {
    return { success: false, error: "Prompt cannot be empty." };
  }
  try {
    console.log("Sending prompt to Together AI:", prompt);
    const response = await together.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free",
    });
    console.log("Received response from Together AI:", response);
    if (response && response.choices && response.choices[0] && response.choices[0].message) {
      return { success: true, data: response.choices[0].message.content };
    } else {
      console.error("Unexpected response structure from Together AI:", response);
      return { success: false, error: "Failed to parse AI response." };
    }
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
    Please structure your response with:
    1.  **Overall Hair & Scalp Assessment:** Your general conclusions about the user's current hair and scalp state based on the provided details.
    2.  **Key Observations & Potential Issues:** Specific points you've noted (e.g., potential dryness if mentioned in condition, possible effects of allergies).
    3.  **Preliminary Recommendations:** Actionable first steps or advice for products, routines, or practices.

    Keep the tone helpful, informative, and professional.
  `;

  try {
    console.log("Sending hair analysis prompt to Together AI:", prompt);
    const response = await together.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free", // Using the specified model
      // Consider adding max_tokens if you want to control response length, e.g., max_tokens: 500
    });
    console.log("Received hair analysis response from Together AI:", response);
    if (response && response.choices && response.choices[0] && response.choices[0].message) {
      return { success: true, data: response.choices[0].message.content };
    } else {
      console.error("Unexpected response structure from Together AI for hair analysis:", response);
      return { success: false, error: "Failed to parse AI hair analysis response." };
    }
  } catch (error) {
    console.error("Error calling Together AI API for hair analysis:", error);
    return { success: false, error: error.message || "An unknown error occurred with the AI analysis service." };
  }
};

// You can add other AI related functions here in the future
