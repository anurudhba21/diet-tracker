export const nlp = {
    // Diet Categories & Keywords
    categories: {
        'High Protein': ['chicken', 'egg', 'fish', 'tofu', 'paneer', 'protein', 'steak', 'meat', 'dal', 'lentil', 'beef', 'pork', 'turkey', 'yogurt', 'whey'],
        'Carb Heavy': ['rice', 'bread', 'roti', 'chapati', 'pasta', 'pizza', 'potato', 'sugar', 'sweet', 'noodle', 'idli', 'dosa', 'oats', 'upma', 'sandwich', 'burger', 'fries'],
        'Green/Healthy': ['salad', 'veg', 'vegetable', 'spinach', 'fruit', 'apple', 'banana', 'smoothie', 'detox', 'soup', 'berries', 'broccoli', 'cucumber', 'carrot'],
        'Cheat/Junk': ['burger', 'pizza', 'fries', 'cola', 'soda', 'sweet', 'cake', 'chocolate', 'alcohol', 'beer', 'ice cream', 'chips', 'candy', 'fried'],
        'Hydration': ['water', 'coffee', 'tea', 'buttermilk', 'juice', 'drink']
    },

    // Classify a single string of text
    classifyText: (text) => {
        if (!text || typeof text !== 'string') return [];

        const lowerText = text.toLowerCase();
        const foundCategories = new Set();

        Object.entries(nlp.categories).forEach(([category, keywords]) => {
            if (keywords.some(keyword => lowerText.includes(keyword))) {
                foundCategories.add(category);
            }
        });

        return Array.from(foundCategories);
    },

    // Analyze all entries to get diet composition stats
    analyzeDietComposition: (entries) => {
        const stats = {
            'High Protein': 0,
            'Carb Heavy': 0,
            'Green/Healthy': 0,
            'Cheat/Junk': 0
            // Hydration is usually tracked separately, so exclude for diet pie chart
        };

        let totalTagged = 0;

        Object.values(entries).forEach(entry => {
            // Combine all meal text for the day
            const mealText = [
                entry.breakfast,
                entry.lunch,
                entry.dinner,
                entry.snacks
            ].join(' ');

            const categories = nlp.classifyText(mealText);

            categories.forEach(cat => {
                if (stats[cat] !== undefined) {
                    stats[cat]++;
                }
            });

            if (categories.some(cat => stats[cat] !== undefined)) {
                totalTagged++;
            }
        });

        // Convert to array for Recharts
        return Object.entries(stats)
            .map(([name, value]) => ({ name, value }))
            .filter(item => item.value > 0)
            .sort((a, b) => b.value - a.value);
    }
};
