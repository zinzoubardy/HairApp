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
    console.log("Starting hair analysis with vision model...");
    
    // Try vision model first - this is the only way to actually see the images
    try {
      console.log("Attempting vision model analysis...");
      
      // Analyze each image separately using the vision model
      const imageAnalyses = [];
      const imageKeys = Object.keys(imageReferences);
      
      for (const angle of imageKeys) {
        const imageUrl = imageReferences[angle];
        if (!imageUrl) continue;
        
        console.log(`Analyzing ${angle} image with vision model:`, imageUrl);
        
        const anglePrompt = `Analyze this hair image from the ${angle} angle. Look at the actual image and describe what you see:
- Hair texture and pattern
- Hair density and thickness
- Visible damage, split ends, or frizz
- Hair shine and moisture levels
- Scalp condition
- Hair color and any variations
- Volume and body
- Any styling or treatment evidence
- Hair length and shape
- Any specific concerns

Be specific about what you actually see in this image.`;
        
        try {
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
            max_tokens: 500,
            temperature: 0.7,
          });
          
          if (response && response.choices && response.choices[0] && response.choices[0].message) {
            imageAnalyses.push({
              angle: angle,
              analysis: response.choices[0].message.content
            });
            console.log(`${angle} vision analysis complete:`, response.choices[0].message.content.substring(0, 100) + "...");
          } else {
            console.warn(`No valid response for ${angle} image`);
          }
        } catch (imageError) {
          console.error(`Error analyzing ${angle} image with vision model:`, imageError);
          // Continue with other images even if one fails
          imageAnalyses.push({
            angle: angle,
            analysis: `Unable to analyze ${angle} image due to technical issues.`
          });
        }
      }
      
      // If we have some successful analyses, proceed with combination
      if (imageAnalyses.length > 0) {
        console.log("Vision model analysis successful, combining results...");
        
        // Now combine all analyses into a comprehensive report
        const combinedPrompt = `Based on the individual image analyses below, create a comprehensive hair analysis report:

INDIVIDUAL IMAGE ANALYSES:
${imageAnalyses.map(analysis => `**${analysis.angle.toUpperCase()} VIEW:**\n${analysis.analysis}`).join('\n\n')}

Create a comprehensive report with:

**1. Global Hair State Score:**
Based on the combined analyses above, provide a percentage score (0-100%) and justify with specific observations.

**2. Detailed Scalp Analysis:**
Summarize the scalp condition based on the analyses above.

**3. Detailed Color Analysis:**
Analyze the hair color characteristics based on the analyses above.

**4. Key Observations & Potential Issues:**
List specific observations and potential issues based on the analyses above.

**5. Recommendations:**
Provide 3-5 actionable recommendations based on the analyses above. For each recommendation, suggest a simple keyword for an icon.
Format: "Recommendation: [advice]. IconHint: [icon-keyword]"`;
        
        const finalResponse = await together.chat.completions.create({
          messages: [{ role: 'user', content: combinedPrompt }],
          model: 'meta-llama/Llama-3.3-70B-Instruct-Turbo-Free',
          max_tokens: 1500,
          temperature: 0.7,
        });

        if (finalResponse && finalResponse.choices && finalResponse.choices[0] && finalResponse.choices[0].message) {
          return { success: true, data: finalResponse.choices[0].message.content };
        }
      }
    } catch (visionError) {
      console.error("Vision model analysis failed:", visionError);
    }
    
    // If vision model fails completely, use a very direct text approach
    console.log("Using direct text model analysis...");
    
    let prompt = `You are analyzing hair images. The user has provided these image URLs:

`;
    
    if (imageReferences.up) prompt += `Top view: ${imageReferences.up}\n`;
    if (imageReferences.back) prompt += `Back view: ${imageReferences.back}\n`;
    if (imageReferences.left) prompt += `Left view: ${imageReferences.left}\n`;
    if (imageReferences.right) prompt += `Right view: ${imageReferences.right}\n`;

    prompt += `
You need to analyze these hair images. Since you cannot directly view images, please provide a general analysis structure that the user can fill in based on what they observe in their own images.

**1. Global Hair State Score:**
[User should examine their images and provide a score based on what they see]

**2. Detailed Scalp Analysis:**
[User should describe what they observe about their scalp in the images]

**3. Detailed Color Analysis:**
[User should describe the hair color they see in the images]

**4. Key Observations & Potential Issues:**
[User should list specific observations from their images]

**5. Recommendations:**
[User should provide recommendations based on their observations]`;

    const response = await together.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'meta-llama/Llama-3.3-70B-Instruct-Turbo-Free',
      max_tokens: 1500,
      temperature: 0.7,
    });

    console.log("Received hair analysis response:", response);
    
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
