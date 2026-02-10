import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

let genAI = null;
if (API_KEY) {
    genAI = new GoogleGenerativeAI(API_KEY);
}

export const geminiService = {
    parseMealDescription: async (text) => {
        if (!genAI) {
            console.error("Gemini API Key is missing");
            return { error: "API Key missing" };
        }

        try {
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

            const prompt = `
                You are a nutrition assistant. 
                Extract food items from the following text and categorize them into: breakfast, lunch, dinner, snacks.
                Return ONLY a JSON object with these keys. Values should be simple strings describing the food.
                If a category is not mentioned, use an empty string.
                
                Input: "${text}"
                
                Example Output:
                {
                    "breakfast": "Oatmeal and coffee",
                    "lunch": "",
                    "dinner": "Grilled chicken salad",
                    "snacks": "Apple"
                }
            `;

            const result = await model.generateContent(prompt);
            const textResponse = response.text();
            console.log("Raw Gemini Response:", textResponse); // For debugging

            // Robust JSON extraction: Find ANY JSON object in the text
            const jsonMatch = textResponse.match(/\{[\s\S]*\}/);

            if (!jsonMatch) {
                console.error("No JSON found in response");
                return { error: "I understood that, but couldn't format it properly. Try again?" };
            }

            const cleanJson = jsonMatch[0];
            return JSON.parse(cleanJson);
        } catch (error) {
            console.error("Gemini Parse Error:", error);
            return { error: "Oops! Technical hiccup. Try again?" };
        }
    }
};
