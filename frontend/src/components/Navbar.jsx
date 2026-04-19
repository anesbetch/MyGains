import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Navbar({ user, cartCount, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const close = () => setMenuOpen(false);

  const handleLogout = () => {
    close();
    onLogout();
    navigate('/');
  };

  return (
    <nav>
      <Link to="/" className="nav-logo" onClick={close}>
        My<span>Gains</span>
      </Link>

      {/* Hamburger button — only visible on mobile */}
      <button
        className="nav-hamburger"
        onClick={() => setMenuOpen(o => !o)}
        aria-label="Toggle menu"
      >
        {menuOpen ? '✕' : '☰'}
      </button>

      {/* Nav links */}
      <div className={`nav-links ${menuOpen ? 'nav-links--open' : ''}`}>
        <Link to="/shop" onClick={close}>Shop</Link>
        <Link to="/guidance" onClick={close}>Guidance</Link>
        <Link to="/about" onClick={close}>About</Link>
        <Link to="/wishlist" onClick={close}>🤍 Wishlist</Link>
        <Link to="/cart" className="nav-cart" onClick={close}>
          🛒 Cart {cartCount > 0 && <span style={{
            background: '#52b788',
            borderRadius: '999px',
            padding: '1px 7px',
            fontSize: '0.75rem',
            fontWeight: 700,
          }}>{cartCount}</span>}
        </Link>
        {user ? (
          <>
            <Link to="/profile" onClick={close}>👤 {user.first_name || user.username}</Link>
            <button className="nav-logout" onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" onClick={close}>Login</Link>
            <Link to="/signup" className="nav-btn-signup" onClick={close}>Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
