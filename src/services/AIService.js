import { TOGETHER_AI_API_KEY } from '@env';
import Together from "together-ai";
import Constants from 'expo-constants';
import { getPrompt } from '../i18n/prompts';
import i18n from '../i18n';

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

// Get current language for AI prompts
const getCurrentLanguage = () => {
  try {
    return i18n.locale || 'en';
  } catch (error) {
    console.log('Error getting current language:', error);
    return 'en';
  }
};

export const getAIHairstyleAdvice = async (prompt) => {
  if (!prompt || typeof prompt !== 'string' || prompt.trim() === "") {
    return { success: false, error: "Prompt cannot be empty." };
  }

  // Get current language
  const currentLanguage = getCurrentLanguage();

  // Hair-related keywords for each language
  const hairKeywordsEn = [
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
  const hairKeywordsAr = [
    'شعر', 'فروة', 'الشعر', 'فروة الرأس', 'شامبو', 'بلسم', 'تصفيف', 'علاج', 'لون', 'صبغة',
    'قص', 'تقليم', 'تقصف', 'جاف', 'دهني', 'تساقط', 'حجم', 'ملمس', 'مجعد', 'مفرود', 'متموج',
    'قشرة', 'حكة', 'نمو', 'طول', 'ستايل', 'منتج', 'روتين', 'غسل', 'فرشاة', 'مشط',
    'سيروم', 'زيت', 'قناع', 'حرارة', 'مجفف', 'مكواة', 'طبيعي', 'كيميائي', 'دائم', 'مؤقت',
    'خصل', 'أطراف', 'تسريحة', 'تسريحات', 'تسريح', 'تنعيم', 'ترطيب', 'تغذية', 'حماية', 'تسريح حراري',
    'تسريح بارد', 'تسريح مبلل', 'تسريح جاف', 'تسريح يومي', 'تسريح أسبوعي', 'تسريح شهري', 'تسريح موسمي',
    'تسريح صيفي', 'تسريح شتوي', 'تسريح ربيعي', 'تسريح خريفي', 'تسريح احترافي', 'تسريح منزلي', 'تسريح سريع',
    'تسريح طويل', 'تسريح قصير', 'تسريح متوسط', 'تسريح كثيف', 'تسريح خفيف', 'تسريح ناعم', 'تسريح خشن',
    'تسريح مموج', 'تسريح مجعد', 'تسريح مفرود', 'تسريح طبيعي', 'تسريح صناعي', 'تسريح دائم', 'تسريح مؤقت'
  ];
  const hairKeywordsFr = [
    'cheveux', 'cuir chevelu', 'shampooing', 'après-shampooing', 'coiffure', 'traitement', 'couleur', 'teinture',
    'couper', 'tailler', 'fourches', 'sec', 'gras', 'chute', 'volume', 'texture', 'bouclé', 'lisse', 'ondulé',
    'pellicules', 'démangeaisons', 'croissance', 'longueur', 'style', 'produit', 'routine', 'laver', 'brosse', 'peigne',
    'sérum', 'huile', 'masque', 'chaleur', 'sèche-cheveux', 'fer à lisser', 'naturel', 'chimique', 'permanent', 'temporaire',
    'mèches', 'pointes', 'coiffure', 'coiffures', 'coiffer', 'lissage', 'hydratation', 'nutrition', 'protection', 'coiffage thermique',
    'coiffage à froid', 'coiffage mouillé', 'coiffage sec', 'coiffage quotidien', 'coiffage hebdomadaire', 'coiffage mensuel', 'coiffage saisonnier',
    'coiffage estival', 'coiffage hivernal', 'coiffage printanier', 'coiffage automnal', 'coiffage professionnel', 'coiffage maison', 'coiffage rapide',
    'coiffage long', 'coiffage court', 'coiffage moyen', 'coiffage épais', 'coiffage fin', 'coiffage doux', 'coiffage rugueux',
    'coiffage ondulé', 'coiffage bouclé', 'coiffage lisse', 'coiffage naturel', 'coiffage synthétique', 'coiffage permanent', 'coiffage temporaire'
  ];

  let hairKeywords = hairKeywordsEn;
  if (currentLanguage === 'ar') hairKeywords = hairKeywordsAr;
  if (currentLanguage === 'fr') hairKeywords = hairKeywordsFr;

  const promptLower = prompt.toLowerCase();
  const isHairRelated = hairKeywords.some(keyword => promptLower.includes(keyword));

  if (!isHairRelated) {
    return { 
      success: false, 
      error: currentLanguage === 'ar'
        ? 'يمكنني فقط تقديم النصائح حول الشعر وفروة الرأس ومواضيع العناية بالشعر. يرجى سؤالي عن مخاوفك المتعلقة بالشعر أو التصفيف أو المنتجات أو صحة الشعر.'
        : currentLanguage === 'fr'
        ? "Je ne peux donner des conseils que sur les cheveux, le cuir chevelu et les soins capillaires. Veuillez me poser des questions sur vos préoccupations capillaires, le coiffage, les produits ou la santé des cheveux."
        : "I can only provide advice about hair, scalp, and hair care topics. Please ask me about your hair concerns, styling, products, or hair health."
    };
  }

  try {
    console.log("Sending hair-related prompt to Together AI:", prompt);
    
    // Get language-specific AI advisor prompt
    const aiAdvisorPrompt = getPrompt('aiAdvisor', currentLanguage);
    
    const enhancedPrompt = `${aiAdvisorPrompt}

USER'S QUESTION: ${prompt}`;
    
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
      // Now combine all analyses into a comprehensive report using language-specific prompt
      const currentLanguage = getCurrentLanguage();
      const hairAnalysisPrompt = getPrompt('hairAnalysis', currentLanguage);
      
      const combinedPrompt = `${hairAnalysisPrompt}

INDIVIDUAL IMAGE ANALYSES:
${imageAnalyses.map(analysis => `**${analysis.angle.toUpperCase()} VIEW:**\n${analysis.analysis}`).join('\n\n')}`;

      const finalResponse = await together.chat.completions.create({
        messages: [{ role: 'user', content: combinedPrompt }],
        model: 'meta-llama/Llama-3.3-70B-Instruct-Turbo-Free',
        max_tokens: 1500,
        temperature: 0.7,
      });

      if (finalResponse && finalResponse.choices && finalResponse.choices[0] && finalResponse.choices[0].message) {
        console.log("Final analysis response:", finalResponse.choices[0].message.content);
        return { success: true, data: finalResponse.choices[0].message.content };
      } else {
        console.error("Unexpected final response structure:", finalResponse);
        return { success: false, error: "Failed to parse final AI analysis response." };
      }
    } else {
      console.error("No image analyses available");
      return { success: false, error: "No image analyses were successful." };
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

  // Use the selected language for the prompt
  const currentLanguage = getCurrentLanguage();
  const generalAnalysisPrompt = getPrompt('generalAnalysis', currentLanguage);

  const prompt = `${generalAnalysisPrompt}

USER'S QUESTION: ${question}`;

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
  const currentLanguage = getCurrentLanguage();
  const routinePrompt = getPrompt('routineGeneration', currentLanguage);
  
  const prompt = `${routinePrompt}

Hair Analysis:
${JSON.stringify(analysisData, null, 2)}`;

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
