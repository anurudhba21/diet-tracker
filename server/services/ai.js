
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
dotenv.config();

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "dummy_key_for_build");

export const analyzeMeal = async (mealText) => {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is missing in server environment");
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
        Analyze the following meal description and provide a nutritional estimate.
        Meal: "${mealText}"
        
        Return ONLY a raw JSON object (no markdown, no backticks) with:
        - calories (number)
        - protein (string, e.g. "20g")
        - fat (string)
        - carbs (string)
        - short_summary (max 10 words summary)

        JSON:
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Clean up markdown if Gemini adds it
        const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();

        return JSON.parse(cleanJson);
    } catch (error) {
        console.error("AI Analysis Failed:", error);
        throw new Error("Failed to analyze meal. Please try again.");
    }
};
