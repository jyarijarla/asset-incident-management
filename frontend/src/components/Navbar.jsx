import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!user || location.pathname === '/login') return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 2rem',
    height: '60px',
    backgroundColor: '#1e1e2e',
    color: '#fff',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  };

  const linkStyle = {
    color: '#cdd6f4',
    textDecoration: 'none',
    marginRight: '1.5rem',
    fontSize: '14px',
  };

  const activeLinkStyle = {
    ...linkStyle,
    color: '#89b4fa',
    fontWeight: '500',
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav style={navStyle}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
        <span style={{ fontWeight: '600', fontSize: '16px' }}>
          Asset Manager
        </span>
        <div>
          <Link to="/dashboard" style={isActive('/dashboard') ? activeLinkStyle : linkStyle}>Dashboard</Link>
          <Link to="/assets" style={isActive('/assets') ? activeLinkStyle : linkStyle}>Assets</Link>
          <Link to="/tickets" style={isActive('/tickets') ? activeLinkStyle : linkStyle}>Tickets</Link>
          {user.role === 'admin' && (
            <Link to="/users" style={isActive('/users') ? activeLinkStyle : linkStyle}>Users</Link>
          )}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <span style={{ fontSize: '13px', color: '#a6adc8' }}>
          {user.name} · <span style={{ textTransform: 'capitalize' }}>{user.role}</span>
        </span>
        <button
          onClick={handleLogout}
          style={{
            padding: '6px 14px',
            backgroundColor: '#f38ba8',
            color: '#1e1e2e',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: '500',
          }}
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;