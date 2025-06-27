import { TOGETHER_AI_API_KEY } from '@env';
import Together from "together-ai";
import Constants from 'expo-constants';

// Basic error checking for the API key
if (!TOGETHER_AI_API_KEY) {
  console.error("Together AI API Key is not provided! Please check your .env configuration.");
}

const getTogetherApiKey = () => {
  const expoKey = Constants?.expoConfig?.extra?.TOGETHER_API_KEY;
  const envKey = process.env.TOGETHER_API_KEY;
  console.log('DEBUG Together API Key (expoConfig.extra):', expoKey);
  console.log('DEBUG Together API Key (process.env):', envKey);
  if (expoKey) {
    return expoKey;
  }
  return envKey;
};

const together = new Together({ apiKey: getTogetherApiKey() });

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

export const getHairAnalysis = async (profile, imageReferences) => {
  if (!imageReferences || !imageReferences.up || !imageReferences.back || !imageReferences.left || !imageReferences.right) {
    return { success: false, error: 'All four image angles are required.' };
  }

  const angles = ['up', 'back', 'left', 'right'];
  const imageAnalyses = [];

  for (const angle of angles) {
    const imageUrl = imageReferences[angle];
    const anglePrompt = `Analyze the ${angle} view of the user\'s hair. Focus on texture, scalp, color, and any visible issues.`;
    try {
      console.log(`Sending vision model request for ${angle}:`, imageUrl);
      const response = await together.chat.completions.create({
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: anglePrompt },
              { type: "image_url", image_url: { url: imageUrl } }
            ]
          }
        ],
        model: "meta-llama/Llama-Vision-Free",
        max_tokens: 500,
        temperature: 0.7,
      });
      console.log(`Vision model response for ${angle}:`, response);
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
      // Try alternative vision model if first one fails
      try {
        console.log(`Trying alternative vision model for ${angle} image...`);
        const altResponse = await together.chat.completions.create({
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: `Describe what you see in this hair image: ${anglePrompt}` },
                { type: "image_url", image_url: { url: imageUrl } }
              ]
            }
          ],
          model: "meta-llama/Llama-Vision-Free",
          max_tokens: 400,
          temperature: 0.5,
        });
        console.log(`Alternative vision model response for ${angle}:`, altResponse);
        if (altResponse && altResponse.choices && altResponse.choices[0] && altResponse.choices[0].message) {
          imageAnalyses.push({
            angle: angle,
            analysis: altResponse.choices[0].message.content
          });
          console.log(`${angle} alternative vision analysis complete:`, altResponse.choices[0].message.content.substring(0, 100) + "...");
        } else {
          imageAnalyses.push({
            angle: angle,
            analysis: `Unable to analyze ${angle} image due to technical issues.`
          });
        }
      } catch (altError) {
        console.error(`Alternative vision model also failed for ${angle} image:`, altError);
        imageAnalyses.push({
          angle: angle,
          analysis: `Unable to analyze ${angle} image due to technical issues.`
        });
      }
    }
  }

  try {
    console.log("Vision model analysis successful, combining results...");
    
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
    // If vision model fails completely, use a very direct text approach
    console.log("Using direct text model analysis...");
    let prompt = `You are analyzing hair images. The user has provided these image URLs:\n\n`;
    if (imageReferences.up) prompt += `Top view: ${imageReferences.up}\n`;
    if (imageReferences.back) prompt += `Back view: ${imageReferences.back}\n`;
    if (imageReferences.left) prompt += `Left view: ${imageReferences.left}\n`;
    if (imageReferences.right) prompt += `Right view: ${imageReferences.right}\n`;
    prompt += `\nYou need to analyze these hair images. Since you cannot directly view images, please provide a general analysis structure that the user can fill in based on what they observe in their own images.\n\n**1. Global Hair State Score:**\n[User should examine their images and provide a score based on what they see]\n\n**2. Detailed Scalp Analysis:**\n[User should describe what they observe about their scalp in the images]\n\n**3. Detailed Color Analysis:**\n[User should describe the hair color they see in the images]\n\n**4. Key Observations & Potential Issues:**\n[User should list specific observations from their images]\n\n**5. Recommendations:**\n[User should provide recommendations based on their observations]`;
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

// Call Together AI to generate a personalized routine from analysis data
export const callTogetherAIForRoutine = async (analysisData) => {
  const together = new Together({ apiKey: getTogetherApiKey() });
  const prompt = `You are a professional hair care assistant. Based on the following hair analysis, generate a personalized daily and weekly hair care routine.\n\nRequirements:\n- The routine must have AT LEAST 3 steps.\n- Each step must have a clear title and a detailed description.\n- The response MUST be valid JSON in the following format:\n{\n  \"title\": \"string\",\n  \"steps\": [\n    { \"title\": \"string\", \"description\": \"string\" },\n    ...\n  ]\n}\n- Do NOT include any markdown, explanations, or extra text.\n\nHair Analysis:\n${JSON.stringify(analysisData, null, 2)}`;

  try {
    const response = await together.chat.completions.create({
      messages: [
        { role: 'user', content: prompt },
      ],
      model: 'deepseek-ai/DeepSeek-R1-Distill-Llama-70B-free',
    });
    let aiText = response.choices?.[0]?.message?.content || '';
    console.log('Raw AI routine response:', aiText);
    let routineObj = null;
    // Try to extract the first JSON object from the response
    const jsonStart = aiText.indexOf('{');
    const jsonEnd = aiText.lastIndexOf('}');
    if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
      const jsonString = aiText.substring(jsonStart, jsonEnd + 1);
      try {
        routineObj = JSON.parse(jsonString);
      } catch (e) {
        // Fallback to old logic below
      }
    }
    if (!routineObj) {
      // Try to extract steps from plain text
      const steps = aiText.split(/\n\d+\.|\n- |\n\*/).filter(s => s.trim().length > 0);
      routineObj = {
        title: 'Personalized Routine',
        steps: steps.map((step, i) => ({ title: `Step ${i + 1}`, description: step.trim() })),
      };
    }
    // Only accept if at least 2 steps with non-empty descriptions
    const validSteps = routineObj.steps?.filter(s => s.description && s.description.trim().length > 0) || [];
    if (validSteps.length < 2) {
      return { error: 'Technical issue, try again a bit later.' };
    }
    routineObj.steps = validSteps;
    return routineObj;
  } catch (e) {
    console.log('Routine AI call error:', e);
    return { error: 'Technical issue, try again a bit later.' };
  }
};

// You can add other AI related functions here in the future
