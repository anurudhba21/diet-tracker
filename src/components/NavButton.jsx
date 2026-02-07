import { NavLink } from 'react-router-dom';

export default function NavButton({ to, icon: Icon, label }) {
    return (
        <NavLink
            to={to}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
            <Icon size={24} />
            <span className="nav-label" style={{ fontSize: '0.7rem', marginTop: '4px' }}>
                {label}
            </span>
        </NavLink>
    );
}
