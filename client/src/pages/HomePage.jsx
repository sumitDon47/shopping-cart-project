import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FiShoppingBag, FiArrowRight, FiZap, FiShield, FiRefreshCw, FiTruck } from 'react-icons/fi';
import { ROUTES } from '../utils/constants';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import './HomePage.css';

const features = [
  { icon: <FiZap />,       title: 'Lightning Fast',    desc: 'Next-day delivery on thousands of products.' },
  { icon: <FiShield />,    title: 'Secure & Safe',      desc: '256-bit SSL encryption on every transaction.' },
  { icon: <FiRefreshCw />, title: 'Easy Returns',       desc: 'Hassle-free 30-day return policy.' },
  { icon: <FiTruck />,     title: 'Free Shipping',      desc: 'Free shipping on orders over $50.' },
];

const categories = [
  { label: 'Electronics',   emoji: '📱', color: '#7c3aed' },
  { label: 'Laptops',       emoji: '💻', color: '#2563eb' },
  { label: 'Headphones',    emoji: '🎧', color: '#db2777' },
  { label: 'Books',         emoji: '📚', color: '#d97706' },
  { label: 'Sports',        emoji: '⚽', color: '#16a34a' },
  { label: 'Home',          emoji: '🏠', color: '#0891b2' },
];

const HomePage = () => {
  const { isAuthenticated } = useSelector((s) => s.auth);

  return (
    <div className="home-page">
      <Navbar />

      {/* ── Hero ──────────────────────────────────────────── */}
      <section className="home-hero">
        <div className="home-hero-bg">
          <div className="home-orb home-orb-1" />
          <div className="home-orb home-orb-2" />
          <div className="home-grid" />
        </div>

        <div className="home-hero-inner">
          <div className="home-hero-badge">
            <FiZap /> New arrivals every week
          </div>

          <h1 className="home-hero-title">
            Shop Smarter,<br />
            <span className="home-gradient">Live Better.</span>
          </h1>

          <p className="home-hero-desc">
            Discover thousands of premium products at unbeatable prices.
            Fast delivery, easy returns, and top-rated customer service.
          </p>

          <div className="home-hero-btns">
            <Link to={ROUTES.PRODUCTS} className="home-btn-primary">
              <FiShoppingBag /> Shop Now
            </Link>
            {!isAuthenticated && (
              <Link to={ROUTES.REGISTER} className="home-btn-outline">
                Get Started <FiArrowRight />
              </Link>
            )}
          </div>

          <div className="home-hero-stats">
            {[['50K+','Products'],['2M+','Customers'],['4.9★','Rating'],['24/7','Support']].map(([val, label]) => (
              <div key={label} className="home-stat">
                <span className="home-stat-val">{val}</span>
                <span className="home-stat-label">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────── */}
      <section className="home-features">
        <div className="home-section-inner">
          <div className="home-features-grid">
            {features.map(({ icon, title, desc }) => (
              <div key={title} className="home-feature-card">
                <div className="home-feature-icon">{icon}</div>
                <h3 className="home-feature-title">{title}</h3>
                <p className="home-feature-desc">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categories ────────────────────────────────────── */}
      <section className="home-categories">
        <div className="home-section-inner">
          <div className="home-section-header">
            <h2 className="home-section-title">Shop by Category</h2>
            <Link to={ROUTES.PRODUCTS} className="home-see-all">See all <FiArrowRight /></Link>
          </div>
          <div className="home-categories-grid">
            {categories.map(({ label, emoji, color }) => (
              <Link
                key={label}
                to={`${ROUTES.PRODUCTS}?category=${label}`}
                className="home-category-card"
                style={{ '--cat-color': color }}
              >
                <span className="home-category-emoji">{emoji}</span>
                <span className="home-category-label">{label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────── */}
      {!isAuthenticated && (
        <section className="home-cta">
          <div className="home-cta-inner">
            <h2 className="home-cta-title">Ready to start shopping?</h2>
            <p className="home-cta-desc">Join 2 million+ happy customers today.</p>
            <Link to={ROUTES.REGISTER} className="home-btn-primary large">
              Create Free Account <FiArrowRight />
            </Link>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
};

export default HomePage;
