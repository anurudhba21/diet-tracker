// Simple Intent Recognition Service + Gemini API
// Rule-based for speed/safety, LLM for intelligence.

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

async function callGeminiAPI(prompt, context) {
    if (!GEMINI_API_KEY) {
        return { text: "I'm ready to be smart, but I need my VITE_GEMINI_API_KEY in the .env file!" };
    }

    try {
        const systemPrompt = `
You are an expert fitness and nutrition coach. 
Your goal is to help the user achieve their health goals (weight loss, muscle gain, consistency).
You have access to the user's data in the JSON object below.
Use this data to give specific, personalized advice.
Be encouraging but realistic. Keep answers concise (under 3 sentences) unless asked for a plan.

User Context:
${JSON.stringify(context, null, 2)}
`;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [
                        { text: systemPrompt },
                        { text: `User Question: ${prompt}` }
                    ]
                }]
            })
        });

        const data = await response.json();
        if (data.error) throw new Error(data.error.message);

        let text = data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't think of a response.";

        // Clean up formatting for chat
        text = text.replace(/\*\*/g, '').replace(/\*/g, '-');

        return { text };

    } catch (error) {
        console.error("Gemini API Error:", error);
        return { text: "My brain is having trouble connecting to the cloud right now. Try again later!" };
    }
}

export const chatService = {
    // Analyze user message and return a response + optional action
    processMessage: async (text, context = {}) => {
        const lowerText = text.toLowerCase();

        // --- LAYER 1: RULE-BASED (Fast, Deterministic, Actions) ---

        // 1. Check for specific context-based answers (e.g. answering a prompt)
        if (context.lastPromptType === 'WEIGHT') {
            const weightMatch = text.match(/(\d+(\.\d+)?)/);
            if (weightMatch) {
                const weight = parseFloat(weightMatch[0]);
                if (weight > 30 && weight < 300) {
                    return {
                        text: `Got it! I've updated your weight to ${weight}kg.`,
                        action: { type: 'UPDATE_ENTRY', payload: { weight: weight } }
                    };
                } else {
                    return { text: "That weight seems a bit off. Could you double-check? (Enter a number between 30 and 300)" };
                }
            }
        }

        if (context.lastPromptType && context.lastPromptType.startsWith('MEAL_')) {
            const mealType = context.lastPromptType.split('_')[1].toLowerCase(); // LUNCH -> lunch
            return {
                text: `Yum! I've logged "${text}" for ${mealType}.`,
                action: { type: 'UPDATE_ENTRY', payload: { [mealType]: text } }
            };
        }

        // 2. Specific Action Triggers
        if (lowerText.includes('log weight') || (lowerText.includes('weight') && lowerText.includes('is'))) {
            // Simple parser for "Weight is 70"
            const match = text.match(/(\d+(\.\d+)?)/);
            if (match) {
                const val = parseFloat(match[0]);
                return {
                    text: `Saved weight: ${val}kg`,
                    action: { type: 'UPDATE_ENTRY', payload: { weight: val } }
                };
            }
        }

        // 3. Data-Aware Rules (Fast Lookup)
        if (lowerText.includes('how many workouts')) {
            const count = context.stats?.workoutsCompletedLast7Days ?? 0;
            return { text: `You've completed ${count} workouts in the last 7 days.` };
        }

        // --- LAYER 2: AI BRAIN (Gemini) ---

        // Holistic Metabolism Analysis (Workouts + Weight)
        if (context.type === 'HOLISTIC_ANALYSIS') {
            const prompt = `
Analyze the correlation between the user's workout volume/consistency and their weight trends.
Data:
- Goal: ${JSON.stringify(context.data.goal)}
- Weights: ${JSON.stringify(context.data.weights)}
- Workouts: ${JSON.stringify(context.data.workouts)}

Return a JSON object with these EXACT keys:
- insight: A detailed (2-3 sentences) correlation between their activity and weight trends.
- metabolicRating: A number 1-10 representing their metabolic progress and consistency.
- nextSteps: A list of 2 actionable improvements they should make.

Do NOT return markdown code blocks. Just the raw JSON string.
`;
            try {
                if (!GEMINI_API_KEY) return { text: "Missing API Key for Analysis." };

                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{
                            parts: [
                                { text: "You are a metabolic fitness coach analysis agent." },
                                { text: prompt }
                            ]
                        }],
                        generationConfig: { responseMimeType: "application/json" }
                    })
                });

                const data = await response.json();
                const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
                const analysis = JSON.parse(text);

                return {
                    text: "Holistic Analysis Complete",
                    analysis: {
                        insight: analysis.insight || "Keep logging data for deeper correlations.",
                        metabolicRating: analysis.metabolicRating || 5,
                        nextSteps: analysis.nextSteps || ["Stay consistent", "Log more data"]
                    }
                };
            } catch (e) {
                console.error("Holistic Analysis Failed", e);
                return {
                    text: "Holistic Analysis Failed",
                    analysis: { insight: "Could not connect to AI for metabolic insights.", metabolicRating: 0, nextSteps: ["Try again later"] }
                };
            }
        }

        // Special Case: Workout Analysis Report (Needs JSON)
        if (context.type === 'WORKOUT_ANALYSIS') {
            const prompt = `
Analyze the user's workout data and return a JSON object with these EXACT keys:
- adherence: A number 0-100 indicating consistency.
- trend: A string (e.g., "Trending Up", "Stable", "Needs Work").
- recommendation: A string (max 2 sentences) with specific advice.

Do NOT return markdown code blocks. Just the raw JSON string.
`;
            // Call Gemini with specific prompt, expecting JSON
            // We can reuse callGeminiAPI with a modified sys prompt or just handle it here
            // Let's modify callGeminiAPI to support JSON mode or just ask for it.

            try {
                // Determine logic: We can pass a flag or just do it inline?
                // Inline for clarity since callGeminiAPI is generic text

                if (!GEMINI_API_KEY) return { text: "Missing API Key for Analysis." };

                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{
                            parts: [
                                { text: `You are a fitness analyst. Context: ${JSON.stringify(context)}` },
                                { text: prompt }
                            ]
                        }],
                        generationConfig: { responseMimeType: "application/json" } // Force JSON
                    })
                });

                const data = await response.json();
                const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
                const analysis = JSON.parse(text);

                return {
                    text: "Analysis Complete",
                    analysis: {
                        adherence: analysis.adherence || 0,
                        trend: analysis.trend || "Unknown",
                        recommendation: analysis.recommendation || "Keep pushing!"
                    }
                };
            } catch (e) {
                console.error("Gemini JSON Analysis Failed", e);
                // Fallback to mock
                return {
                    text: "Analysis Failed (Fallback)",
                    analysis: { adherence: 50, trend: "Error", recommendation: "Could not connect to AI." }
                };
            }
        }

        // General Chat Query
        // If no rules matched, asking the LLM
        return await callGeminiAPI(text, context);
    }
};
