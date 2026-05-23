import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchCartCount } from '../lib/cartApi';
import CreamyIcon from './CreamyIcon';
import BrandLogo from './BrandLogo';

export default function Header() {
  const navigate = useNavigate();
  const [cartCount, setCartCount] = useState(0);
  const { user, profile, logout } = useAuth();

  const refreshCount = () => {
    fetchCartCount()
      .then((data) => setCartCount(Number(data.count || 0)))
      .catch(() => setCartCount(0));
  };

  useEffect(() => {
    refreshCount();
    const onUpdate = (e) => setCartCount(Number(e.detail?.count ?? 0));
    window.addEventListener('cart-updated', onUpdate);
    return () => window.removeEventListener('cart-updated', onUpdate);
  }, []);

  const accountLink = () => {
    if (!user) return '/login';
    if (profile?.role === 'admin') return '/admin';
    if (profile?.role === 'staff') return '/staff';
    return '/orders';
  };

  const accountLabel = user
    ? (profile?.fullname || profile?.username || 'Account')
    : 'Log in';

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header>
      <BrandLogo className="header-logo" linkTo="/" iconSize={40} />
      <nav>
        <Link to="/">Home</Link>
        <Link to="/products">Product</Link>
        <Link to="/about">About Us</Link>
        <Link to="/orders">My Orders</Link>
        <Link to="/testimonial">Testimonial</Link>
      </nav>
      <div className="header-actions">
        <Link className="icon cart-link" to="/cart" aria-label="View cart" data-cart-link>
          🛒
          <span className="cart-badge" data-cart-badge hidden={cartCount <= 0} aria-hidden={cartCount <= 0}>
            {cartCount > 0 ? cartCount : ''}
          </span>
        </Link>
        {user ? (
          <>
            <button
              type="button"
              className="btn-contact"
              style={{ background: 'transparent', color: 'var(--primary-pink, #ff4d8d)', border: '1px solid rgba(255,77,141,0.3)' }}
              onClick={() => navigate(accountLink())}
            >
              Hi, {profile?.fullname?.split(' ')[0] || 'there'}
            </button>
            <button
              type="button"
              className="btn-contact"
              style={{ background: '#ff4d8d', color: '#fff', border: 'none' }}
              onClick={handleLogout}
            >
              Log Out
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              className="btn-contact"
              style={{ background: '#fff', color: '#000', border: '1px solid #000' }}
              onClick={() => navigate('/register')}
            >
              Sign Up
            </button>
            <button
              type="button"
              className="btn-contact"
              onClick={() => navigate('/login')}
            >
              Log In
            </button>
          </>
        )}
      </div>
    </header>
  );
}
