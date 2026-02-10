import { useState } from 'react';
import { Wand2, X, Loader2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { geminiService } from '../../utils/geminiService';

export default function MagicLogger({ onUpdate }) {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleMagicLog = async () => {
        if (!input.trim()) return;

        setIsLoading(true);
        setError(null);

        const result = await geminiService.parseMealDescription(input);

        setIsLoading(false);

        if (result.error) {
            setError("Oops! Couldn't understand that. Try again?");
            return;
        }

        onUpdate(result);
        setIsOpen(false);
        setInput('');
    };

    return (
        <>
            {/* The Magic Button */}
            <motion.button
                onClick={() => setIsOpen(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="glass-panel"
                style={{
                    position: 'fixed',
                    bottom: '100px',
                    right: '25px', // Slightly shifted to not overlap with chat if it existed
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 100,
                    border: '1px solid var(--primary-500)',
                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(59, 130, 246, 0.2))',
                    boxShadow: '0 0 20px rgba(16, 185, 129, 0.3)',
                    color: 'var(--primary-400)'
                }}
            >
                <Wand2 size={28} />
            </motion.button>

            {/* Modal */}
            <AnimatePresence>
                {isOpen && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        zIndex: 1000,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '20px',
                        background: 'rgba(0,0,0,0.6)',
                        backdropFilter: 'blur(5px)'
                    }}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="glass-panel"
                            style={{
                                width: '100%',
                                maxWidth: '500px',
                                padding: '24px',
                                background: 'rgba(20, 20, 30, 0.95)',
                                border: '1px solid var(--primary-500)',
                                boxShadow: '0 0 50px rgba(16, 185, 129, 0.1)'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Sparkles size={20} color="var(--primary-400)" />
                                    <h3 className="text-gradient" style={{ margin: 0, fontSize: '1.2rem' }}>Magic Logger</h3>
                                </div>
                                <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                                    <X size={24} />
                                </button>
                            </div>

                            <p style={{ color: 'var(--text-muted)', marginBottom: '16px', fontSize: '0.9rem' }}>
                                Tell me what you ate today! <br />
                                <i>"Oatmeal for breakfast and a chicken salad for lunch."</i>
                            </p>

                            <textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Type here..."
                                autoFocus
                                style={{
                                    width: '100%',
                                    height: '120px',
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid var(--glass-border)',
                                    borderRadius: '12px',
                                    color: 'white',
                                    padding: '12px',
                                    fontSize: '1rem',
                                    marginBottom: '20px',
                                    resize: 'none',
                                    outline: 'none',
                                    fontFamily: 'inherit'
                                }}
                            />

                            {error && (
                                <p style={{ color: '#ef4444', marginBottom: '16px', fontSize: '0.9rem' }}>{error}</p>
                            )}

                            <button
                                className="btn"
                                onClick={handleMagicLog}
                                disabled={isLoading || !input.trim()}
                                style={{
                                    width: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    background: input.trim() ? 'linear-gradient(135deg, var(--primary-600), var(--primary-500))' : 'rgba(255,255,255,0.1)',
                                    cursor: input.trim() ? 'pointer' : 'not-allowed'
                                }}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 size={20} className="spin" /> Magic is happening...
                                    </>
                                ) : (
                                    <>
                                        <Wand2 size={20} /> Auto-Fill My Day
                                    </>
                                )}
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
