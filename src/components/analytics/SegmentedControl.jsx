import { motion } from 'framer-motion';

export default function SegmentedControl({ options, value, onChange }) {
    return (
        <div style={{
            display: 'flex',
            background: 'var(--glass-surface)',
            backdropFilter: 'blur(20px)',
            border: '1px solid var(--glass-border)',
            borderRadius: '16px',
            padding: '4px',
            position: 'relative',
            marginBottom: '24px',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
        }}>
            {options.map((option) => {
                const isActive = value === option.value;
                return (
                    <button
                        key={option.value}
                        onClick={() => onChange(option.value)}
                        style={{
                            flex: 1,
                            position: 'relative',
                            border: 'none',
                            background: 'transparent',
                            color: isActive ? '#fff' : 'var(--text-muted)',
                            padding: '10px 4px',
                            fontSize: '0.85rem',
                            fontWeight: isActive ? '600' : '500',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            zIndex: 1,
                            transition: 'color 0.2s ease',
                            outline: 'none'
                        }}
                    >
                        {isActive && (
                            <motion.div
                                layoutId="activeTab"
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    background: 'var(--glass-highlight)',
                                    borderRadius: '12px',
                                    zIndex: -1,
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                                }}
                                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                            />
                        )}
                        {option.label}
                    </button>
                );
            })}
        </div>
    );
}
