
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

        // 4. Data-Aware Q&A (Requires context)
        if (context.stats && context.history) {
            // Workout Queries
            if (lowerText.includes('how many workouts') || lowerText.includes('workout count')) {
                const count = context.stats.workoutsCompletedLast7Days;
                return { text: `You've completed ${count} workouts in the last 7 days. Keep it up!` };
            }

            // Weight Queries
            if (lowerText.includes('weight') && (lowerText.includes('lost') || lowerText.includes('progress'))) {
                const lost = context.stats.weightLost;
                const current = context.stats.currentWeight;
                if (lost > 0) return { text: `You've lost ${lost}kg so far! Current weight: ${current}kg.` };
                if (lost < 0) return { text: `You've gained ${Math.abs(lost)}kg. Current weight: ${current}kg.` };
                return { text: `Your weight is stable at ${current}kg.` };
            }

            if (lowerText.includes('current weight') || lowerText.includes('my weight')) {
                return { text: `Your latest logged weight is ${context.stats.currentWeight}kg.` };
            }

            // History Queries
            if (lowerText.includes('eat') && lowerText.includes('yesterday')) {
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                const yDateStr = yesterday.toISOString().split('T')[0];
                const yEntry = context.history.find(e => e.date === yDateStr);

                if (!yEntry) return { text: "I don't have any food logs for yesterday." };

                const meals = [];
                if (yEntry.breakfast) meals.push(`Breakfast: ${yEntry.breakfast}`);
                if (yEntry.lunch) meals.push(`Lunch: ${yEntry.lunch}`);
                if (yEntry.dinner) meals.push(`Dinner: ${yEntry.dinner}`);

                if (meals.length === 0) return { text: "You didn't log any specific meals yesterday." };
                return { text: `Yesterday you had:\n${meals.join('\n')}` };
            }
        }

        // 3. AI Analysis Simulation (Context: WORKOUT_ANALYSIS)
        if (context.type === 'WORKOUT_ANALYSIS') {
            await new Promise(resolve => setTimeout(resolve, 1500)); // Longer delay for "analysis"

            // Simulate logic based on simulated data (since we don't have full history in context here yet)
            // In real app, we'd analyze context.entry.workouts vs scheduled

            const adherence = Math.floor(Math.random() * 30) + 70; // Random 70-100%
            let trend = "Stable";
            let rec = "Keep consistent with your sets.";

            const weight = context.entry?.weight || 0;
            const prevWeight = context.previousWeight || 0;

            if (weight < prevWeight) {
                trend = "Down";
                rec = "Great progress! Your routine is effective. Keep the intensity high.";
            } else if (weight > prevWeight) {
                trend = "Up";
                rec = "Weight is slightly up. Ensure you aren't overeating to compensate for workouts.";
            } else {
                trend = "Stagnant";
                rec = "Plateau detected. Try increasing reps or shortening rest periods (Progressive Overload)."
            }

            return {
                text: "Analysis Complete",
                analysis: {
                    adherence_score: adherence,
                    trend_analysis: trend,
                    recommendation: rec
                }
            };
        }

        // Default fallback
        return { text: "I'm not connected to a real brain yet, so I only know simple things! Try telling me your weight if I ask, or just log your meals normally for now." };
    }
};
