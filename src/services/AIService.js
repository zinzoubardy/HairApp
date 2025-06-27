import { TOGETHER_AI_API_KEY } from '@env';
import Together from "together-ai";

// Basic error checking for the API key
if (!TOGETHER_AI_API_KEY) {
  console.error("Together AI API Key is not provided! Please check your .env configuration.");
}

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

  try {
    console.log("Starting multi-image hair analysis with vision model...");
    
    // Analyze each image separately using the vision model
    const imageAnalyses = [];
    const imageKeys = Object.keys(imageReferences);
    
    for (const angle of imageKeys) {
      const imageUrl = imageReferences[angle];
      if (!imageUrl) continue;
      
      console.log(`Analyzing ${angle} image:`, imageUrl);
      
      const anglePrompt = `
        You are an expert hair and scalp analyst. Analyze this hair image from the ${angle} angle.
        
        Please provide a detailed visual analysis focusing on:
        - Hair texture and pattern visible from this angle
        - Hair density and thickness
        - Visible damage (split ends, breakage, frizz)
        - Hair shine and moisture levels
        - Scalp condition (oiliness, dryness, flakiness, irritation)
        - Hair color and any variations
        - Volume and body
        - Any styling or treatment evidence
        - Hair length and shape
        - Any specific concerns visible from this angle
        
        Be specific and evidence-based. Only describe what you can actually see in this image.
      `;
      
      const response = await together.chat.completions.create({
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: anglePrompt
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
        max_tokens: 800,
        temperature: 0.7,
      });
      
      if (response && response.choices && response.choices[0] && response.choices[0].message) {
        imageAnalyses.push({
          angle: angle,
          analysis: response.choices[0].message.content
        });
        console.log(`${angle} analysis complete:`, response.choices[0].message.content.substring(0, 100) + "...");
      }
    }
    
    // Now combine all analyses into a comprehensive report
    const combinedPrompt = `
      You are an expert hair and scalp analyst. I have analyzed hair images from multiple angles and need you to create a comprehensive report based on these individual analyses.
      
      INDIVIDUAL IMAGE ANALYSES:
      ${imageAnalyses.map(analysis => `**${analysis.angle.toUpperCase()} VIEW:**\n${analysis.analysis}`).join('\n\n')}
      
      Based on these multiple angle analyses, please create a comprehensive hair analysis report structured exactly as follows:
      
      **1. Global Hair State Score:**
      Provide a percentage score (0-100%) representing the overall health and condition based on the combined visual evidence from all angles. Justify with specific observations.
      
      **2. Detailed Scalp Analysis:**
      Summarize the scalp's condition based on evidence from all angles. Look for:
      - Oiliness or dryness signs
      - Flakiness or dandruff
      - Irritation or redness
      - Scalp texture and health
      - Any visible scalp conditions
      
      **3. Detailed Color Analysis:**
      Analyze the hair color characteristics based on evidence from all angles. Identify:
      - Primary hair color (be specific: Dark Brown, Light Brown, Black, Blonde, Red, etc.)
      - Color variations or highlights
      - Color treatment evidence
      - Color health and vibrancy
      - Any color damage or fading
      
      **4. Key Observations & Potential Issues:**
      List 2-3 specific observations and potential issues based on the combined visual evidence:
      - Texture observations
      - Damage assessment
      - Volume and body analysis
      - Any visible hair concerns
      
      **5. Recommendations:**
      Provide 3-5 actionable recommendations based on the combined analysis. For each recommendation, suggest a simple keyword for an icon.
      Format: "Recommendation: [advice]. IconHint: [icon-keyword]"
      
      Be comprehensive, specific, and evidence-based in your analysis.
    `;
    
    console.log("Combining analyses into comprehensive report...");
    
    const finalResponse = await together.chat.completions.create({
      messages: [{ role: 'user', content: combinedPrompt }],
      model: 'meta-llama/Llama-3.3-70B-Instruct-Turbo-Free',
      max_tokens: 1500,
      temperature: 0.7,
    });

    console.log("Received comprehensive hair analysis response:", finalResponse);
    
    if (finalResponse && finalResponse.choices && finalResponse.choices[0] && finalResponse.choices[0].message) {
      return { success: true, data: finalResponse.choices[0].message.content };
    } else {
      console.error("Unexpected response structure from Together AI for hair analysis:", finalResponse);
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
