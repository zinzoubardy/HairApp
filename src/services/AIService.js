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

// You can add other AI related functions here in the future
