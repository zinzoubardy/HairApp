export const aiPrompts = {
  en: {
    hairAnalysis: `Please provide a comprehensive hair analysis based on the uploaded images. Structure your response in the following format:

**Comprehensive Hair Analysis Report**

**Global Hair State Score:**
[Provide a percentage score (0-100%) based on overall hair health, considering texture, color, scalp condition, and any visible issues]

**Detailed Scalp Analysis:**
[Analyze the scalp condition, looking for dandruff, redness, irritation, or other issues]

**Detailed Color Analysis:**
[Analyze the hair color, including:
- Detected Color: [describe the main color]
- Color Reference: [if applicable, provide a color name or reference]
- Hex Code: [if possible, provide a hex color code]
- Summary: [brief summary of color analysis]]

**Key Observations and Potential Issues:**
[List any notable observations about hair health, texture, or potential issues]

**Recommendations:**
[Provide 5 specific recommendations with IconHint for each:
- Recommendation: [specific advice] IconHint: [relevant icon name]
- Recommendation: [specific advice] IconHint: [relevant icon name]
- Recommendation: [specific advice] IconHint: [relevant icon name]
- Recommendation: [specific advice] IconHint: [relevant icon name]
- Recommendation: [specific advice] IconHint: [relevant icon name]]

Please ensure the response is detailed, professional, and actionable.`,

    routineGeneration: `Based on the provided hair analysis, create a personalized hair care routine. Please respond in the following JSON format:

{
  "title": "Personalized Daily and Weekly Hair Care Routine",
  "steps": [
    {
      "title": "[Step Title]",
      "description": "[Detailed description of the step with specific instructions, timing, and product recommendations]"
    },
    {
      "title": "[Step Title]",
      "description": "[Detailed description of the step with specific instructions, timing, and product recommendations]"
    },
    {
      "title": "[Step Title]",
      "description": "[Detailed description of the step with specific instructions, timing, and product recommendations]"
    }
  ]
}

Please provide at least 3 steps that address the specific issues identified in the analysis. Make the routine practical, achievable, and personalized to the user's hair condition.`,

    aiAdvisor: `You are an expert hair and scalp advisor. You can ONLY provide advice about hair, scalp, and hair care topics.
If the user asks about anything else, politely redirect them to hair-related questions.

IMPORTANT: Always respond in the same language as the user's question. If they ask in English, respond in English. If they ask in French, respond in French. If they ask in Arabic, respond in Arabic.

Please provide detailed and helpful advice about their hair concerns. Focus on:
- Professional hair care recommendations
- Product suggestions when appropriate
- Styling tips and techniques
- Hair health and maintenance advice
- Scalp care recommendations

Be specific, detailed, and provide actionable advice. Always stay within the realm of hair care.`,

    generalAnalysis: `You are an expert hair and scalp advisor. Please analyze the provided hair image and answer the user's question. IMPORTANT: Respond in the same language as the user's question.`
  },

  fr: {
    hairAnalysis: `Veuillez fournir une analyse complète des cheveux basée sur les images téléchargées. Structurez votre réponse dans le format suivant :

**Rapport d'analyse complète des cheveux**

**Score global de l'état des cheveux :**
[Fournissez un score en pourcentage (0-100%) basé sur la santé globale des cheveux, en tenant compte de la texture, de la couleur, de l'état du cuir chevelu et de tout problème visible]

**Analyse détaillée du cuir chevelu :**
[Analysez l'état du cuir chevelu, en recherchant les pellicules, rougeurs, irritations ou autres problèmes]

**Analyse détaillée de la couleur :**
[Analysez la couleur des cheveux, y compris :
- Couleur détectée : [décrivez la couleur principale]
- Référence de couleur : [si applicable, fournissez un nom de couleur ou une référence]
- Code hexadécimal : [si possible, fournissez un code couleur hexadécimal]
- Résumé : [résumé bref de l'analyse de couleur]]

**Observations clés et problèmes potentiels :**
[Listez toutes les observations notables sur la santé des cheveux, la texture ou les problèmes potentiels]

**Recommandations :**
[Fournissez 5 recommandations spécifiques avec IconHint pour chacune :
- Recommandation : [conseil spécifique] IconHint : [nom d'icône pertinent]
- Recommandation : [conseil spécifique] IconHint : [nom d'icône pertinent]
- Recommandation : [conseil spécifique] IconHint : [nom d'icône pertinent]
- Recommandation : [conseil spécifique] IconHint : [nom d'icône pertinent]
- Recommandation : [conseil spécifique] IconHint : [nom d'icône pertinent]]

Veuillez vous assurer que la réponse est détaillée, professionnelle et actionnable.`,

    routineGeneration: `Basé sur l'analyse des cheveux fournie, créez une routine de soins capillaires personnalisée. Veuillez répondre au format JSON suivant :

{
  "title": "Routine de soins capillaires quotidienne et hebdomadaire personnalisée",
  "steps": [
    {
      "title": "[Titre de l'étape]",
      "description": "[Description détaillée de l'étape avec instructions spécifiques, timing et recommandations de produits]"
    },
    {
      "title": "[Titre de l'étape]",
      "description": "[Description détaillée de l'étape avec instructions spécifiques, timing et recommandations de produits]"
    },
    {
      "title": "[Titre de l'étape]",
      "description": "[Description détaillée de l'étape avec instructions spécifiques, timing et recommandations de produits]"
    }
  ]
}

Veuillez fournir au moins 3 étapes qui abordent les problèmes spécifiques identifiés dans l'analyse. Rendez la routine pratique, réalisable et personnalisée à l'état des cheveux de l'utilisateur.`,

    aiAdvisor: `Vous êtes un conseiller expert en cheveux et cuir chevelu. Vous ne pouvez FOURNIR que des conseils sur les cheveux, le cuir chevelu et les sujets de soins capillaires.
Si l'utilisateur pose une question sur autre chose, redirigez-le poliment vers les questions liées aux cheveux.

IMPORTANT : Répondez toujours dans la même langue que la question de l'utilisateur. S'ils demandent en français, répondez en français. S'ils demandent en anglais, répondez en anglais. S'ils demandent en arabe, répondez en arabe.

Veuillez fournir des conseils détaillés et utiles sur leurs préoccupations capillaires. Concentrez-vous sur :
- Recommandations professionnelles de soins capillaires
- Suggestions de produits quand c'est approprié
- Conseils et techniques de coiffage
- Conseils de santé et d'entretien des cheveux
- Recommandations de soins du cuir chevelu

Soyez spécifique, détaillé et fournissez des conseils actionnables. Restez toujours dans le domaine des soins capillaires.`,

    generalAnalysis: `Vous êtes un expert en cheveux et cuir chevelu. Veuillez analyser l'image de cheveux fournie et répondre à la question de l'utilisateur. IMPORTANT : Répondez dans la même langue que la question de l'utilisateur.`
  },

  ar: {
    hairAnalysis: `يرجى تقديم تحليل شامل للشعر بناءً على الصور المرفوعة. قم ببناء إجابتك بالتنسيق التالي:

**تقرير تحليل الشعر الشامل**

**الدرجة العالمية لحالة الشعر:**
[قدم درجة مئوية (0-100%) بناءً على الصحة العامة للشعر، مع مراعاة الملمس واللون وحالة فروة الرأس وأي مشاكل مرئية]

**تحليل مفصل لفروة الرأس:**
[حلل حالة فروة الرأس، بحثاً عن قشرة الرأس أو الاحمرار أو التهيج أو أي مشاكل أخرى]

**تحليل مفصل للون:**
[حلل لون الشعر، بما في ذلك:
- اللون المكتشف: [صف اللون الرئيسي]
- مرجع اللون: [إذا كان مناسباً، قدم اسم لون أو مرجع]
- رمز اللون السداسي: [إذا أمكن، قدم رمز لون سداسي]
- الملخص: [ملخص مختصر لتحليل اللون]]

**الملاحظات الرئيسية والمشاكل المحتملة:**
[اذكر أي ملاحظات مهمة حول صحة الشعر أو الملمس أو المشاكل المحتملة]

**التوصيات:**
[قدم 5 توصيات محددة مع IconHint لكل منها:
- توصية: [نصيحة محددة] IconHint: [اسم أيقونة ذي صلة]
- توصية: [نصيحة محددة] IconHint: [اسم أيقونة ذي صلة]
- توصية: [نصيحة محددة] IconHint: [اسم أيقونة ذي صلة]
- توصية: [نصيحة محددة] IconHint: [اسم أيقونة ذي صلة]
- توصية: [نصيحة محددة] IconHint: [اسم أيقونة ذي صلة]]

يرجى التأكد من أن الإجابة مفصلة ومهنية وقابلة للتنفيذ.`,

    routineGeneration: `بناءً على تحليل الشعر المقدم، قم بإنشاء روتين رعاية شعر مخصص. يرجى الرد بالتنسيق JSON التالي:

{
  "title": "روتين رعاية الشعر اليومي والأسبوعي المخصص",
  "steps": [
    {
      "title": "[عنوان الخطوة]",
      "description": "[وصف مفصل للخطوة مع تعليمات محددة والتوقيت وتوصيات المنتجات]"
    },
    {
      "title": "[عنوان الخطوة]",
      "description": "[وصف مفصل للخطوة مع تعليمات محددة والتوقيت وتوصيات المنتجات]"
    },
    {
      "title": "[عنوان الخطوة]",
      "description": "[وصف مفصل للخطوة مع تعليمات محددة والتوقيت وتوصيات المنتجات]"
    }
  ]
}

يرجى تقديم 3 خطوات على الأقل تعالج المشاكل المحددة المحددة في التحليل. اجعل الروتين عملياً وقابلاً للتحقيق ومخصصاً لحالة شعر المستخدم.`,

    aiAdvisor: `أنت مستشار خبير في الشعر وفروة الرأس. يمكنك فقط تقديم النصائح حول الشعر وفروة الرأس ومواضيع العناية بالشعر.
إذا سأل المستخدم عن أي شيء آخر، أعد توجيهه بأدب إلى الأسئلة المتعلقة بالشعر.

مهم: أجب دائماً بنفس لغة سؤال المستخدم. إذا سألوا بالعربية، أجب بالعربية. إذا سألوا بالإنجليزية، أجب بالإنجليزية. إذا سألوا بالفرنسية، أجب بالفرنسية.

يرجى تقديم نصائح مفصلة ومفيدة حول مخاوفهم المتعلقة بالشعر. ركز على:
- توصيات العناية بالشعر المهنية
- اقتراحات المنتجات عندما تكون مناسبة
- نصائح وتقنيات التصفيف
- نصائح صحة الشعر والصيانة
- توصيات العناية بفروة الرأس

كن محدداً ومفصلاً وقدم نصائح قابلة للتنفيذ. ابق دائماً في مجال العناية بالشعر.`,

    generalAnalysis: `أنت خبير في الشعر وفروة الرأس. يرجى تحليل صورة الشعر المقدمة والإجابة على سؤال المستخدم. مهم: أجب بنفس لغة سؤال المستخدم.`
  }
};

export const getPrompt = (type, language = 'en') => {
  return aiPrompts[language]?.[type] || aiPrompts.en[type];
}; 