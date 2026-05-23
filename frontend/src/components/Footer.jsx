import React from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import BrandLogo from './BrandLogo';

export default function Footer() {
  const { showToast } = useToast();

  const handleSubscribe = (e) => {
    e.preventDefault();
    showToast('Thanks for subscribing to the Scoop List!', 'success');
    e.currentTarget.reset();
  };

  return (
    <footer className="site-footer">
      <div className="footer-top">
        <div className="footer-brand">
          <BrandLogo className="footer-logo" linkTo="/" iconSize={32} />
          <p>Fresh scoops, smooth browsing, and a sweeter way to shop.</p>
        </div>

        <form className="footer-newsletter" onSubmit={handleSubscribe}>
          <h3>Join the Scoop List</h3>
          <p>Get flavor drops, seasonal offers, and shop updates.</p>
          <div className="newsletter-row">
            <input type="email" name="email" placeholder="Enter your email" required />
            <button type="submit">Subscribe</button>
          </div>
        </form>
      </div>

      <div className="footer-columns">
        <div className="footer-column">
          <h3>Explore</h3>
          <Link to="/">Home</Link>
          <Link to="/about">About Us</Link>
          <a href="mailto:hello@jojos.com">Contact Us</a>
        </div>

        <div className="footer-column">
          <h3>Support</h3>
          <a href="#">FAQs</a>
          <a href="#">Terms and Conditions</a>
          <a href="#">Privacy Policy</a>
        </div>

        <div className="footer-column">
          <h3>Contact</h3>
          <a href="mailto:hello@jojos.com">hello@jojos.com</a>
          <a href="tel:+10000000000">+1 (000) 000-0000</a>
          <a href="#">Open Daily: 10 AM - 9 PM</a>
        </div>

        <div className="footer-column">
          <h3>Social</h3>
          <div className="social-links" aria-label="Social media links">
            <a href="#" aria-label="Facebook">FB</a>
            <a href="#" aria-label="Instagram">IG</a>
            <a href="#" aria-label="X">X</a>
            <a href="#" aria-label="YouTube">YT</a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; 2026 Jojo&apos;s. All rights reserved.</p>
        <a href="#" onClick={() => window.scrollTo(0, 0)}>Back to top</a>
      </div>
    </footer>
  );
}
