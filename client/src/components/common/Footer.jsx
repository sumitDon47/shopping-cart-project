import React from 'react';
import { Link } from 'react-router-dom';
import { FiShoppingBag, FiGithub, FiTwitter, FiInstagram } from 'react-icons/fi';
import { ROUTES } from '../../utils/constants';
import './Footer.css';

const Footer = () => {
  const year = new Date().getFullYear();

  const links = {
    Shop:    [{ label: 'All Products', path: ROUTES.PRODUCTS }, { label: 'Cart', path: ROUTES.CART }, { label: 'Orders', path: ROUTES.ORDERS }],
    Account: [{ label: 'Profile',  path: ROUTES.PROFILE }, { label: 'Sign In', path: ROUTES.LOGIN }, { label: 'Register', path: ROUTES.REGISTER }],
    Legal:   [{ label: 'Privacy Policy', path: '#' }, { label: 'Terms of Service', path: '#' }],
  };

  return (
    <footer className="footer">
      <div className="footer-glow" />
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
