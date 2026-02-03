import React from 'react';
import { AVATARS } from '../../utils/avatars';

export default function AvatarPicker({ selectedId, onSelect }) {
    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '12px',
            padding: '12px',
            maxHeight: '300px',
            overflowY: 'auto',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '16px',
            border: '1px solid var(--color-border)'
        }}>
            {AVATARS.map((avatar) => (
                <button
                    key={avatar.id}
                    type="button"
                    onClick={() => onSelect(avatar.id)}
                    style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        border: selectedId === avatar.id ? '3px solid var(--color-primary)' : '2px solid transparent',
                        background: avatar.bgColor,
                        fontSize: '32px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                        transform: selectedId === avatar.id ? 'scale(1.1)' : 'scale(1)',
                        boxShadow: selectedId === avatar.id ? '0 0 15px var(--color-primary)' : 'none'
                    }}
                    title={avatar.label}
                >
                    {avatar.emoji}
                </button>
            ))}
        </div>
    );
}
