
import React, { useEffect, useLayoutEffect, useState, useRef, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import '../styles/login.css'; 
import { useToast } from '../context/ToastContext';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [logoutMessage, setLogoutMessage] = useState('');
  const [logoutIsError, setLogoutIsError] = useState(false);
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

  useEffect(() => {
    if (location.state?.logoutMessage) {
      setLogoutMessage(location.state.logoutMessage);
      setLogoutIsError(false);
      navigate(location.pathname, { replace: true, state: {} });
    } else if (location.state?.logoutError) {
      setLogoutMessage(location.state.logoutError);
      setLogoutIsError(true);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, location.pathname, navigate]);

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

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLogoutMessage('');
    setLoading(true);

    try {
      // Allow a pseudo password "faith" for admin by appending "1" to meet Supabase's 6 char minimum
      let finalPassword = password;
      if (username.toLowerCase() === 'jireh' && password === 'faith') {
        finalPassword = 'faith1';
      }

      const { data: profileForLogin, error: lookupError } = await supabase
        .from('profiles')
        .select('email')
        .eq('username', username)
        .single();

      if (lookupError || !profileForLogin?.email) {
        throw new Error('Invalid username or password.');
      }

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: profileForLogin.email,
        password: finalPassword,
      });

      if (signInError) {
        throw signInError;
      }

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
         throw profileError;
      }

      showToast('Welcome back!', 'success');
      
      const role = profileData?.role || 'user';
      if (role === 'admin') {
        navigate('/admin', { replace: true });
      } else if (role === 'staff') {
        navigate('/staff', { replace: true });
      } else {
        navigate('/orders', { replace: true });
      }
    } catch (err) {
      console.error(err);
      const msg = err.message === 'Invalid login credentials' ? 'Invalid username or password.' : (err.message || 'An error occurred during login.');
      setError(msg);
      showToast(msg, 'error');
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <main className="login-hero" ref={scrollRef} onScroll={handleScroll} style={{ opacity: ready ? 1 : 0, transition: 'opacity 0.15s ease' }}>
        <section className="login-intro login-snap-panel" aria-label="Brand messaging">
          <p className="intro-kicker">Welcome back</p>
          <h1>Sign in to keep your <span className="accent">creamy cravings</span> curated.</h1>
          <p>Use your existing account to review carts, follow deliveries, and reorder your favorite scoops without missing a drop from the Jojo's experience.</p>
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

        <section className="login-card login-snap-panel" aria-label="Login form">
          <h2>Account Login</h2>
          <p className="card-subtitle">Enter your details to continue.</p>
          {logoutMessage && (
            <div
              className={`form-notice ${logoutIsError ? 'form-notice-error' : 'form-notice-success'}`}
              role="status"
            >
              {logoutMessage}
            </div>
          )}
          {error && <div className="form-error" id="error-box">{error}</div>}
          <form className="login-form" onSubmit={handleLogin}>
            <label htmlFor="username">
              Username
              <input
                id="username"
                type="text"
                name="username"
                placeholder="Enter username"
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
                  placeholder="Enter password"
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
            <button className="btn-login" type="submit" disabled={loading}>
              {loading ? 'Logging In...' : 'Log In'}
            </button>
          </form>
          <p className="signup-hint">Need an account? <Link to="/register" state={{ showForm: true }}>Sign up</Link></p>
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
