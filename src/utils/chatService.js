
// Simple Intent Recognition Service
// In a real app, this would connect to an LLM or a more robust NLU service.

export const chatService = {
    // Analyze user message and return a response + optional action
    processMessage: async (text, context = {}) => {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 600));

        const lowerText = text.toLowerCase();

        // 1. Check for specific context-based answers (e.g. answering a prompt)
        if (context.lastPromptType === 'WEIGHT') {
            const weightMatch = text.match(/(\d+(\.\d+)?)/);
            if (weightMatch) {
                const weight = parseFloat(weightMatch[0]);
                if (weight > 30 && weight < 200) {
                    return {
                        text: `Got it! I've updated your weight to ${weight}kg.`,
                        action: { type: 'UPDATE_ENTRY', payload: { weight: weight } }
                    };
                } else {
                    return { text: "That weight seems a bit off. Could you double-check? (Enter a number between 30 and 200)" };
                }
            }
        }

        if (context.lastPromptType === 'MEAL_LUNCH') {
            return {
                text: `Yum! I've logged "${text}" for lunch.`,
                action: { type: 'UPDATE_ENTRY', payload: { lunch: text } }
            };
        }

        if (context.lastPromptType === 'MEAL_BREAKFAST') {
            return {
                text: `Good start! I've logged "${text}" for breakfast.`,
                action: { type: 'UPDATE_ENTRY', payload: { breakfast: text } }
            };
        }

        if (context.lastPromptType === 'MEAL_DINNER') {
            return {
                text: `Sounds good. I've logged "${text}" for dinner.`,
                action: { type: 'UPDATE_ENTRY', payload: { dinner: text } }
            };
        }

        // 2. General Intent Recognition
        if (lowerText.includes('hello') || lowerText.includes('hi')) {
            return { text: "Hello! I'm your diet assistant. I can help you log meals or track your weight. How can I help today?" };
        }

        if (lowerText.includes('joke')) {
            return { text: "Why did the tofu cross the road? To prove he wasn't chicken!" };
        }

        if (lowerText.includes('thank')) {
            return { text: "You're welcome! Keep up the good work!" };
        }

        if (lowerText.includes('bye')) {
            return { text: "Goodbye! improved everyday!" };
        }

        // Default fallback
        return { text: "I'm not connected to a real brain yet, so I only know simple things! Try telling me your weight if I ask, or just log your meals normally for now." };
    }
};
