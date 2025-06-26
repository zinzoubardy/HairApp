import { TOGETHER_AI_API_KEY } from "../config/apiKeys";
import Together from "together-ai";

const together = new Together({ apiKey: TOGETHER_AI_API_KEY });

export const getAIHairstyleAdvice = async (prompt) => {
  if (!prompt || typeof prompt !== 'string' || prompt.trim() === "") {
    return { success: false, error: "Prompt cannot be empty." };
  }

  // Check if the question is hair-related
  const hairKeywords = [
    'hair', 'scalp', 'shampoo', 'conditioner', 'styling', 'treatment', 'color', 'dye', 
    'cut', 'trim', 'frizz', 'dry', 'oily', 'damage', 'split ends', 'volume', 'texture',
    'curl', 'straight', 'wavy', 'coily', 'dandruff', 'itchy', 'falling', 'thinning',
    'growth', 'length', 'style', 'product', 'routine', 'wash', 'brush', 'comb',
    'serum', 'oil', 'mask', 'deep condition', 'heat', 'blow dry', 'flat iron',
    'curling iron', 'natural', 'chemical', 'permanent', 'semi-permanent', 'highlights',
    'lowlights', 'balayage', 'ombre', 'roots', 'ends', 'mid-lengths', 'crown',
    'bangs', 'layers', 'bob', 'pixie', 'long', 'short', 'medium', 'thick', 'thin',
    'fine', 'coarse', 'porous', 'non-porous', 'protein', 'moisture', 'humidity',
    'weather', 'seasonal', 'winter', 'summer', 'spring', 'fall', 'protective style',
    'braids', 'twists', 'buns', 'ponytail', 'updo', 'down', 'part', 'side part',
    'middle part', 'no part', 'hairline', 'edges', 'baby hairs', 'flyaways'
  ];

  const promptLower = prompt.toLowerCase();
  const isHairRelated = hairKeywords.some(keyword => promptLower.includes(keyword));

  if (!isHairRelated) {
    return { 
      success: false, 
      error: "I can only provide advice about hair, scalp, and hair care topics. Please ask me about your hair concerns, styling, products, or hair health." 
    };
  }

  try {
    console.log("Sending hair-related prompt to Together AI:", prompt);
    
    const enhancedPrompt = `
      You are an expert hair and scalp advisor. You can ONLY provide advice about hair, scalp, and hair care topics. 
      If the user asks about anything else, politely redirect them to hair-related questions.
      
      USER'S QUESTION: ${prompt}
      
      Please provide detailed, helpful advice about their hair concern. Focus on:
      - Professional hair care recommendations
      - Product suggestions when appropriate
      - Styling tips and techniques
      - Hair health and maintenance advice
      - Scalp care recommendations
      
      Be specific, detailed, and provide actionable advice. Always stay within the hair care domain.
    `;
    
    const response = await together.chat.completions.create({
      messages: [{ role: 'user', content: enhancedPrompt }],
      model: 'meta-llama/Llama-3.3-70B-Instruct-Turbo-Free',
      max_tokens: 1000,
      temperature: 0.7,
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
  if (!imageReferences || Object.keys(imageReferences).length === 0) {
    return { success: false, error: "Image references are required for analysis." };
  }

  // Prepare the prompt for image analysis
  let prompt = `
    You are an expert hair and scalp analyst with years of experience in visual hair assessment. Your task is to conduct a COMPREHENSIVE visual analysis of the provided hair images. 

    CRITICAL INSTRUCTIONS:
    - You MUST analyze ONLY what you can visually observe in the images
    - You MUST NOT use any user-provided profile information, goals, or preferences
    - You MUST examine every detail: texture, shine, damage, color, scalp condition, volume, etc.
    - You MUST be specific and detailed in your observations
    - You MUST provide evidence-based analysis from visual cues

    The user has provided hair images from different angles for analysis:
  `;
  
  if (imageReferences.up) prompt += `- Top/Up View: ${imageReferences.up}\n`;
  if (imageReferences.right) prompt += `- Right Side View: ${imageReferences.right}\n`;
  if (imageReferences.left) prompt += `- Left Side View: ${imageReferences.left}\n`;
  if (imageReferences.back) prompt += `- Back View: ${imageReferences.back}\n`;

  prompt += `
    CONDUCT A DETAILED VISUAL ANALYSIS:
    Examine each image carefully for:
    - Hair texture and pattern (straight, wavy, curly, coily)
    - Hair density and thickness
    - Visible damage (split ends, breakage, frizz)
    - Hair shine and moisture levels
    - Scalp condition (oiliness, dryness, flakiness, irritation)
    - Hair color and any variations
    - Volume and body
    - Any styling or treatment evidence
    - Hair length and shape
    - Any specific concerns visible in the images

    STRUCTURE YOUR RESPONSE EXACTLY AS FOLLOWS:

    **1. Global Hair State Score:**
    Provide a percentage score (0-100%) representing the overall health and condition based STRICTLY on visual analysis. Justify with specific visual evidence.
    Example: "Global Hair State Score: 75% - Hair shows good density but appears slightly dry with some frizz visible."

    **2. Detailed Scalp Analysis:**
    Analyze the scalp's condition based on visual evidence. Look for:
    - Oiliness or dryness signs
    - Flakiness or dandruff
    - Irritation or redness
    - Scalp texture and health
    - Any visible scalp conditions
    Example: "Scalp Analysis: The scalp appears to be normal to slightly oily based on the visible shine and texture. No signs of severe dryness or irritation are visible."

    **3. Detailed Color Analysis:**
    Analyze the hair color characteristics based ONLY on visual evidence. Identify:
    - Primary hair color (be specific: Dark Brown, Light Brown, Black, Blonde, Red, etc.)
    - Color variations or highlights
    - Color treatment evidence
    - Color health and vibrancy
    - Any color damage or fading
    Example: "Color Analysis: Based on the images, the hair appears to be Dark Brown with natural variations. The color shows good depth and appears to be natural without visible color treatments."

    **4. Key Observations & Potential Issues:**
    List 2-3 specific observations and potential issues based on visual evidence:
    - Texture observations
    - Damage assessment
    - Volume and body analysis
    - Any visible hair concerns
    Example: "Key Observations & Potential Issues:\n- Observation: Hair appears to have some frizz and dryness at the ends.\n- Potential Issue: Visible split ends suggest the need for a trim."

    **5. Recommendations:**
    Provide 3-5 actionable recommendations based on your visual analysis. For each recommendation, suggest a simple keyword for an icon.
    Example: "Recommendations:\n- Recommendation: Use a moisturizing shampoo and conditioner to address visible dryness. IconHint: shampoo\n- Recommendation: Consider a weekly deep conditioning treatment to improve hair texture. IconHint: conditioner-mask"

    REMEMBER: Base EVERYTHING on visual evidence from the images. Be specific, detailed, and evidence-based in your analysis.
  `;

  try {
    console.log("Sending image-based hair analysis prompt to Together AI with images:", imageReferences);
    
    const response = await together.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'meta-llama/Llama-3.3-70B-Instruct-Turbo-Free',
      max_tokens: 1500,
      temperature: 0.7,
    });

    console.log("Received image-based hair analysis response from Together AI:", response);
    
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

export const getGeneralHairAnalysis = async (imageUrl, question) => {
  if (!imageUrl || !question) {
    return { success: false, error: "Image URL and question are required for analysis." };
  }

  const prompt = `
    You are an expert hair and scalp advisor. Analyze the provided hair image and answer the user's specific question about their hair.

    USER'S QUESTION: ${question}

    Please provide a detailed, helpful response based on what you can observe in the image. Focus on:
    - Visual characteristics of the hair
    - Specific issues or concerns visible in the image
    - Practical advice and recommendations
    - Professional insights based on the image analysis

    Be specific, detailed, and provide actionable advice based on the visual evidence in the image.
  `;

  try {
    console.log("Sending general hair analysis with image:", imageUrl);
    
    const response = await together.chat.completions.create({
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: prompt
            },
            {
              type: "image_url",
              image_url: {
                url: imageUrl
              }
            }
          ]
        }
      ],
      model: "meta-llama/Llama-Vision-Free",
      max_tokens: 1000,
      temperature: 0.7,
    });

    console.log("Received general hair analysis response:", response);
    
    if (response && response.choices && response.choices[0] && response.choices[0].message) {
      return { success: true, data: response.choices[0].message.content };
    } else {
      console.error("Unexpected response structure for general analysis:", response);
      return { success: false, error: "Failed to parse AI response." };
    }
  } catch (error) {
    console.error("Error calling Together AI API for general analysis:", error);
    return { success: false, error: error.message || "An unknown error occurred with the AI service." };
  }
};

// You can add other AI related functions here in the future
