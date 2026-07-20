import { NavLink, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../auth/useAuth';

const Header = () => {
  const { totalQuantity } = useCart();
  const { isAuthenticated, role, user, logout } = useAuth();
  const navigate = useNavigate();

  const linkStyle = ({ isActive }) => ({
    marginRight: '14px',
    textDecoration: 'none',
    color: isActive ? '#1976d2' : '#555',
    fontWeight: isActive ? 'bold' : 'normal',
  });

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header style={{ padding: '16px 24px', borderBottom: '1px solid #ddd', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <h1 style={{ margin: 0 }}>
        <NavLink to="/" style={{ textDecoration: 'none', color: '#1976d2' }}>📚 Vietbook</NavLink>
      </h1>
      <nav style={{ display: 'flex', alignItems: 'center' }}>
        <NavLink to="/" style={linkStyle} end>Home</NavLink>
        <NavLink to="/books" style={linkStyle}>Books</NavLink>
        <NavLink to="/cart" style={linkStyle}>Cart ({totalQuantity})</NavLink>

        {isAuthenticated && (
          <NavLink to="/orders" style={linkStyle}>Orders</NavLink>
        )}

        {role === 'ADMIN' && (
          <>
            <NavLink to="/admin/books" style={linkStyle}>Admin Books</NavLink>
            <NavLink to="/admin/orders" style={linkStyle}>Admin Orders</NavLink>
            <NavLink to="/admin/dashboard" style={linkStyle}>Dashboard</NavLink>
          </>
        )}

        {isAuthenticated ? (
          <>
            <span style={{ marginRight: '12px', color: '#888', fontSize: '0.9rem' }}>{user?.full_name}</span>
            <button onClick={handleLogout} style={{ padding: '6px 12px', cursor: 'pointer' }}>Logout</button>
          </>
        ) : (
          <NavLink to="/login" style={linkStyle}>Login</NavLink>
        )}
      </nav>
    </header>
  );
};

export default Header;
