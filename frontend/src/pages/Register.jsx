import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import '../styles/login.css'; // use same interface as login
import { useToast } from '../context/ToastContext';

export default function Register() {
  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeDot, setActiveDot] = useState(0);
  const scrollRef = useRef(null);
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    document.body.classList.add('auth-page');
    return () => document.body.classList.remove('auth-page');
  }, []);

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
      <main className="login-hero" ref={scrollRef} onScroll={handleScroll}>
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
              <input
                id="password"
                type="password"
                name="password"
                placeholder="Choose a password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </label>
            <label htmlFor="confirm_password">
              Confirm Password
              <input
                id="confirm_password"
                type="password"
                name="confirm_password"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
              />
            </label>
            <button className="btn-login" type="submit" disabled={loading}>
              {loading ? 'Registering...' : 'Register'}
            </button>
          </form>
          <p className="signup-hint">Already have an account? <Link to="/login">Log in</Link></p>
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
