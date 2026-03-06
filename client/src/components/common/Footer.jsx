import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiShoppingBag, FiGithub, FiTwitter, FiInstagram, FiMail, FiArrowRight, FiShield, FiTruck, FiRefreshCw } from 'react-icons/fi';
import { ROUTES } from '../../utils/constants';
import toast from 'react-hot-toast';
import './Footer.css';

const Footer = () => {
  const year = new Date().getFullYear();
  const [email, setEmail] = useState('');

  const links = {
    Shop:    [{ label: 'All Products', path: ROUTES.PRODUCTS }, { label: 'Cart', path: ROUTES.CART }, { label: 'Orders', path: ROUTES.ORDERS }],
    Account: [{ label: 'Profile',  path: ROUTES.PROFILE }, { label: 'About', path: ROUTES.ABOUT }],
    Legal:   [{ label: 'Privacy Policy', path: '#' }, { label: 'Terms of Service', path: '#' }],
  };

  const handleNewsletter = (e) => {
    e.preventDefault();
    if (email.trim()) {
      toast.success('Thanks for subscribing!');
      setEmail('');
    }
  };

  return (
    <footer className="footer">
      <div className="footer-glow" />

      {/* Newsletter Section */}
      <div className="footer-newsletter">
        <div className="footer-newsletter-inner">
          <div className="footer-newsletter-text">
            <h3 className="footer-newsletter-title">Stay in the loop</h3>
            <p className="footer-newsletter-desc">Get the latest deals, new arrivals, and exclusive offers straight to your inbox.</p>
          </div>
          <form className="footer-newsletter-form" onSubmit={handleNewsletter}>
            <div className="footer-newsletter-input-wrap">
              <FiMail className="footer-newsletter-icon" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="footer-newsletter-input"
                required
              />
            </div>
            <button type="submit" className="footer-newsletter-btn">
              Subscribe <FiArrowRight />
            </button>
          </form>
        </div>
      </div>

      {/* Trust badges */}
      <div className="footer-trust">
        <div className="footer-trust-inner">
          <div className="footer-trust-item"><FiShield /> Secure Payments</div>
          <div className="footer-trust-item"><FiTruck /> Fast Delivery</div>
          <div className="footer-trust-item"><FiRefreshCw /> Easy Returns</div>
        </div>
      </div>

      <div className="footer-inner">
        {/* Brand */}
        <div className="footer-brand-col">
          <Link to={ROUTES.HOME} className="footer-brand">
            <span className="footer-logo"><FiShoppingBag /></span>
            <span className="footer-logo-text">ShopCart</span>
          </Link>
          <p className="footer-tagline">
            Your premium shopping destination. Quality products, fast delivery, easy returns.
          </p>
          <div className="footer-socials">
            {[FiGithub, FiTwitter, FiInstagram].map((Icon, i) => (
              <a key={i} href="#" className="footer-social" aria-label="social">
                <Icon />
              </a>
            ))}
          </div>
        </div>

        {/* Links */}
        {Object.entries(links).map(([title, items]) => (
          <div key={title} className="footer-col">
            <h4 className="footer-col-title">{title}</h4>
            <ul className="footer-col-links">
              {items.map(({ label, path }) => (
                <li key={label}>
                  <Link to={path} className="footer-link">{label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom */}
      <div className="footer-bottom">
        <p className="footer-copy">© {year} ShopCart. All rights reserved.</p>
        <p className="footer-built">Built with ❤️ using MERN Stack</p>
      </div>
    </footer>
  );
};

export default Footer;
