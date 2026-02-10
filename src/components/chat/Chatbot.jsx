import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../hooks/useChat';
import { useDailyEntry } from '../../hooks/useDailyEntry';
import { AnimatePresence, motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';

export default function Chatbot() {
    const { user } = useAuth();
    const location = useLocation();

    // Debugging: Log status
    useEffect(() => {
        console.log("Chatbot Render Check:", { user: !!user, path: location.pathname });
    }, [user, location.pathname]);

    // Hide on auth pages
    const isAuthPage = ['/login', '/register', '/privacy', '/terms'].includes(location.pathname);
    if (isAuthPage) return null;

    // If not on auth page, we should be logged in (protected by RequireUser), so show it.
    // We remove the strict `!user` check here because RequireUser handles it, 
    // and sometimes user object might be refreshing.
    // If user is truly null on a protected page, RequireUser will redirect anyway.

    const [isOpen, setIsOpen] = useState(false);
    const [hasUnread, setHasUnread] = useState(false);
    const { messages, isTyping, sendMessage, askQuestion, lastPromptType } = useChat();
    const [input, setInput] = useState('');
    const messagesEndRef = useRef(null);

    // Get today's data for proactive prompting
    const todayStr = new Date().toISOString().split('T')[0];
    const { entry, updateEntry, saveEntry, hasExistingData } = useDailyEntry(todayStr);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    // Proactive Logic: Check for missing data
    useEffect(() => {
        if (!entry) return;

        // Simple check: unique ID for the check to avoid spamming
        const checkId = `checked-${todayStr}`;
        if (sessionStorage.getItem(checkId)) return;

        const timer = setTimeout(() => {
            if (!entry.weight) {
                askQuestion("Hi! I noticed you haven't logged your weight today. What is it in kg?", 'WEIGHT');
                setHasUnread(true);
                sessionStorage.setItem(checkId, 'true');
            } else {
                // Check meal times (Mock logic for now)
                const hour = new Date().getHours();
                if (hour >= 14 && !entry.lunch) {
                    askQuestion("How was your lunch? What did you have?", 'MEAL_LUNCH');
                    setHasUnread(true);
                    sessionStorage.setItem(checkId, 'true');
                }
            }
        }, 3000); // Wait 3s after load

        return () => clearTimeout(timer);
    }, [entry, todayStr, askQuestion]);

    const handleSend = async () => {
        if (!input.trim()) return;
        const text = input;
        setInput('');

        await sendMessage(text, (action) => {
            if (action.type === 'UPDATE_ENTRY') {
                console.log("Applying Action:", action);
                updateEntry(action.payload);
                // Auto-save after update
                setTimeout(() => saveEntry(), 500);
            }
        });
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') handleSend();
    };

    return (
        <>
            {/* Floating Action Button */}
            <motion.button
                className="glass-panel"
                onClick={() => { setIsOpen(!isOpen); setHasUnread(false); }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                    position: 'fixed',
                    bottom: '100px', // Above nav bar
                    right: '20px',
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 9999, // Ensure it is consistently on top
                    background: 'var(--primary-600)',
                    border: 'none',
                    boxShadow: '0 10px 30px -5px var(--primary-glow)',
                    color: '#000',
                    padding: 0
                }}
            >
                {isOpen ? <X size={28} /> : <MessageCircle size={28} />}

                {/* Notification Badge */}
                {!isOpen && hasUnread && (
                    <span style={{
                        position: 'absolute',
                        top: '0',
                        right: '0',
                        width: '16px',
                        height: '16px',
                        background: 'var(--danger)',
                        borderRadius: '50%',
                        border: '2px solid var(--bg-deep)'
                    }} />
                )}
            </motion.button>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="glass-panel"
                        style={{
                            position: 'fixed',
                            bottom: '170px',
                            right: '20px',
                            width: '350px',
                            height: '500px',
                            maxHeight: '70vh',
                            background: 'rgba(20, 20, 22, 0.85)', // Darker background for contrast
                            zIndex: 200,
                            display: 'flex',
                            flexDirection: 'column',
                            padding: 0,
                            overflow: 'hidden',
                            border: '1px solid var(--glass-border)'
                        }}
                    >
                        {/* Header */}
                        <div style={{
                            padding: '16px',
                            borderBottom: '1px solid var(--glass-border)',
                            background: 'rgba(255,255,255,0.02)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                        }}>
                            <Bot size={20} color="var(--primary-500)" />
                            <h3 style={{ fontSize: '1rem', margin: 0 }}>Diet Assistant</h3>
                        </div>

                        {/* Messages */}
                        <div style={{
                            flex: 1,
                            padding: '16px',
                            overflowY: 'auto',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px'
                        }}>
                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    style={{
                                        alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                                        maxWidth: '80%',
                                        padding: '10px 14px',
                                        borderRadius: '16px',
                                        background: msg.sender === 'user'
                                            ? 'var(--primary-600)'
                                            : 'rgba(255,255,255,0.1)',
                                        color: msg.sender === 'user' ? '#000' : 'var(--text-main)',
                                        borderBottomRightRadius: msg.sender === 'user' ? '4px' : '16px',
                                        borderBottomLeftRadius: msg.sender === 'ai' ? '4px' : '16px',
                                        fontSize: '0.95rem'
                                    }}
                                >
                                    {msg.text}
                                </div>
                            ))}
                            {isTyping && (
                                <div style={{
                                    alignSelf: 'flex-start',
                                    padding: '8px 12px',
                                    background: 'rgba(255,255,255,0.05)',
                                    borderRadius: '12px',
                                    fontSize: '0.8rem',
                                    color: 'var(--text-muted)'
                                }}>
                                    Thinking...
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div style={{
                            padding: '12px',
                            borderTop: '1px solid var(--glass-border)',
                            display: 'flex',
                            gap: '8px',
                            background: 'rgba(0,0,0,0.2)'
                        }}>
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Type a message..."
                                style={{
                                    flex: 1,
                                    padding: '10px 14px',
                                    borderRadius: '20px',
                                    border: '1px solid var(--glass-border)',
                                    background: 'rgba(255,255,255,0.05)',
                                    color: 'white',
                                    outline: 'none',
                                    fontSize: '0.9rem'
                                }}
                            />
                            <button
                                onClick={handleSend}
                                style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '50%',
                                    border: 'none',
                                    background: input.trim() ? 'var(--primary-600)' : 'rgba(255,255,255,0.1)',
                                    color: input.trim() ? '#000' : 'rgba(255,255,255,0.3)',
                                    cursor: input.trim() ? 'pointer' : 'default',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 0.2s'
                                }}
                                disabled={!input.trim()}
                            >
                                <Send size={18} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
