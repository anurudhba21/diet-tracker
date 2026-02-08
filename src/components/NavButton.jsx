import { NavLink } from 'react-router-dom';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

export default function NavButton({ to, icon: Icon, label }) {
    const handleClick = async () => {
        try {
            await Haptics.impact({ style: ImpactStyle.Light });
        } catch (e) {
            // Ignore if haptics not available
        }
    };

    return (
        <NavLink
            to={to}
            onClick={handleClick}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
            <Icon size={24} />
            <span className="nav-label" style={{ fontSize: '0.7rem', marginTop: '4px' }}>
                {label}
            </span>
        </NavLink>
    );
}
