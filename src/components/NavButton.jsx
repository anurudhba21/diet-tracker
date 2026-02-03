import { NavLink } from 'react-router-dom';

export default function NavButton({ to, icon: Icon, label }) {
    return (
        <NavLink
            to={to}
            className={({ isActive }) => `nav-btn ${isActive ? 'active' : ''}`}
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--color-text-muted)',
                transition: 'color 0.2s',
                textDecoration: 'none'
            }}
        >
            {({ isActive }) => (
                <>
                    <Icon size={24} color={isActive ? 'var(--color-primary)' : 'currentColor'} />
                    <span style={{ fontSize: '0.75rem', marginTop: '4px', color: isActive ? 'var(--color-primary)' : 'currentColor' }}>
                        {label}
                    </span>
                </>
            )}
        </NavLink>
    );
}
