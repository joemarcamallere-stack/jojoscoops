import React, { useEffect, useLayoutEffect, useState, useRef, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import '../styles/login.css'; // use same interface as login
import { useToast } from '../context/ToastContext';

export default function Register() {
  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeDot, setActiveDot] = useState(0);
  const scrollRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const [ready, setReady] = useState(!location.state?.showForm);

  useEffect(() => {
    document.body.classList.add('auth-page');
    return () => document.body.classList.remove('auth-page');
  }, []);

  useLayoutEffect(() => {
    if (location.state?.showForm) {
      if (scrollRef.current) {
        scrollRef.current.style.scrollBehavior = 'auto';
        scrollRef.current.scrollLeft = scrollRef.current.offsetWidth;
        setActiveDot(1);
        requestAnimationFrame(() => {
          if (scrollRef.current) scrollRef.current.style.scrollBehavior = '';
          setReady(true);
        });
      } else {
        setReady(true);
      }
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, location.pathname, navigate]);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const idx = Math.round(el.scrollLeft / el.offsetWidth);
    setActiveDot(idx);
  }, []);

  const scrollTo = (idx) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ left: idx * el.offsetWidth, behavior: 'smooth' });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      const msg = 'Passwords do not match!';
      setError(msg);
      showToast(msg, 'error');
      return;
    }

    setLoading(true);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            fullname,
            username,
            role: 'user', // default role
          }
        }
      });

      if (signUpError) {
        throw signUpError;
      }

      showToast('Registration successful! Please log in.', 'success');
      navigate('/login');
    } catch (err) {
      console.error(err);
      const msg = err.message || 'An error occurred during registration.';
      setError(msg);
      showToast(msg, 'error');
      setLoading(false);
    }
  };

  return (
    <div className="login-page register-page">
      <main className="login-hero" ref={scrollRef} onScroll={handleScroll} style={{ opacity: ready ? 1 : 0, transition: 'opacity 0.15s ease' }}>
        <section className="login-intro login-snap-panel" aria-label="Brand messaging">
          <p className="intro-kicker">Join the club</p>
          <h1>Sign up to keep your <span className="accent">creamy cravings</span> curated.</h1>
          <p>Create an account to review carts, follow deliveries, and reorder your favorite scoops without missing a drop from the Jojo's experience.</p>
          <ul className="login-highlights">
            <li>
              <span className="icon-pill">1</span>
              Securely manage orders and saved carts in one place.
            </li>
            <li>
              <span className="icon-pill">2</span>
              Unlock seasonal drops plus member-only flavors.
            </li>
            <li>
              <span className="icon-pill">3</span>
              Sync every purchase with staff support for faster help.
            </li>
          </ul>
        </section>

        <section className="login-card login-snap-panel" aria-label="Register form">
          <h2>Create Account</h2>
          <p className="card-subtitle">Enter your details to register.</p>
          {error && <div className="form-error" id="error-box">{error}</div>}
          <form className="login-form" onSubmit={handleRegister}>
            <label htmlFor="fullname">
              Full Name
              <input
                id="fullname"
                type="text"
                name="fullname"
                placeholder="Enter full name"
                value={fullname}
                onChange={e => setFullname(e.target.value)}
                required
              />
            </label>
            <label htmlFor="email">
              Email
              <input
                id="email"
                type="email"
                name="email"
                placeholder="Enter email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </label>
            <label htmlFor="username">
              Username
              <input
                id="username"
                type="text"
                name="username"
                placeholder="Choose a username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
              />
            </label>
            <label htmlFor="password">
              Password
              <div style={{ position: 'relative' }}>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Choose a password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  style={{ width: '100%', paddingRight: '40px', boxSizing: 'border-box' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#666',
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {showPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  )}
                </button>
              </div>
            </label>
            <label htmlFor="confirm_password">
              Confirm Password
              <div style={{ position: 'relative' }}>
                <input
                  id="confirm_password"
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirm_password"
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                  style={{ width: '100%', paddingRight: '40px', boxSizing: 'border-box' }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#666',
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {showConfirmPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  )}
                </button>
              </div>
            </label>
            <button className="btn-login" type="submit" disabled={loading}>
              {loading ? 'Registering...' : 'Register'}
            </button>
          </form>
          <p className="signup-hint">Already have an account? <Link to="/login" state={{ showForm: true }}>Log in</Link></p>
        </section>
      </main>

      {/* Dot indicators — visible only on mobile via CSS */}
      <div className="login-dots">
        <button
          type="button"
          className={`login-dot${activeDot === 0 ? ' active' : ''}`}
          onClick={() => scrollTo(0)}
          aria-label="View intro"
        />
        <button
          type="button"
          className={`login-dot${activeDot === 1 ? ' active' : ''}`}
          onClick={() => scrollTo(1)}
          aria-label="View form"
        />
      </div>
    </div>
  );
}
