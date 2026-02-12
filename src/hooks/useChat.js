import { useState, useCallback } from 'react';
import { chatService } from '../utils/chatService';

export function useChat() {
    const [messages, setMessages] = useState([
        { id: 'welcome', sender: 'ai', text: "Hi there! I'm here to help you track your progress." }
    ]);
    const [isTyping, setIsTyping] = useState(false);
    const [lastPromptType, setLastPromptType] = useState(null); // 'WEIGHT', 'MEAL_LUNCH', etc.

    const addMessage = useCallback((text, sender = 'user') => {
        const newMessage = {
            id: Date.now().toString() + Math.random(),
            text,
            sender,
            timestamp: new Date()
        };
        setMessages(prev => [...prev, newMessage]);
    }, []);

    const sendMessage = useCallback(async (text, context = {}, onAction = null) => {
        // Handle optional context argument for backward compatibility if needed, 
        // but we will update call sites.
        // If 2nd arg is function, treat as onAction (legacy support)
        if (typeof context === 'function') {
            onAction = context;
            context = {};
        }

        // 1. Add User Message
        addMessage(text, 'user');
        setIsTyping(true);

        try {
            // 2. Get Response from Service
            const response = await chatService.processMessage(text, {
                lastPromptType,
                ...context
            });

            // 3. Add AI Message
            addMessage(response.text, 'ai');

            // 4. Handle Actions (e.g. Update DB)
            if (response.action && onAction) {
                onAction(response.action);
            }

            // 5. Clear prompt context if action was successful or if flow is done
            if (response.action || !lastPromptType) {
                setLastPromptType(null);
            }

        } catch (error) {
            console.error(error);
            addMessage("Sorry, I had trouble processing that.", 'ai');
        } finally {
            setIsTyping(false);
        }
    }, [addMessage, lastPromptType]);

    // Used by the proactive logic to ask a question and set context
    const askQuestion = useCallback((text, promptType) => {
        addMessage(text, 'ai');
        setLastPromptType(promptType);
    }, [addMessage]);

    return {
        messages,
        isTyping,
        sendMessage,
        addMessage,
        askQuestion,
        lastPromptType
    };
}
