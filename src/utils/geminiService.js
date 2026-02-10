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
            const response = await result.response;
            const textResponse = response.text();

            // Clean up code blocks if present
            const cleanJson = textResponse.replace(/^```json/, '').replace(/```$/, '').trim();

            return JSON.parse(cleanJson);
        } catch (error) {
            console.error("Gemini Parse Error:", error);
            return { error: "Failed to parse meal" };
        }
    }
};
