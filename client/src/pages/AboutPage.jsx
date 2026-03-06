import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FiShoppingBag, FiZap, FiShield, FiRefreshCw, FiTruck, FiArrowRight } from 'react-icons/fi';
import { ROUTES } from '../utils/constants';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import './AboutPage.css';

const values = [
  { icon: <FiZap />,       title: 'Lightning Fast',  desc: 'Next-day delivery on thousands of products across the country.' },
  { icon: <FiShield />,    title: 'Secure & Safe',    desc: '256-bit SSL encryption protects every transaction you make.' },
  { icon: <FiRefreshCw />, title: 'Easy Returns',     desc: 'Hassle-free 30-day return policy — no questions asked.' },
  { icon: <FiTruck />,     title: 'Free Shipping',    desc: 'Free shipping on all orders over $50, delivered to your door.' },
];

const AboutPage = () => {
  const { isAuthenticated } = useSelector((s) => s.auth);

  return (
    <div className="about-page">
      <Navbar />

      <main className="about-main">
        <div className="about-hero">
          <h1>About ShopCart</h1>
          <p>
            We're on a mission to make online shopping simple, affordable, and
            delightful for everyone. Since our launch we've served millions of
            happy customers with premium products and world-class service.
          </p>
        </div>

        <section className="about-section">
          <h2>Our Story</h2>
          <p>
            ShopCart started with a simple idea — everyone deserves access to
            quality products at fair prices. Today we offer over 50,000 products
            across electronics, fashion, home goods, and more. Our dedicated
            team works around the clock to curate the best selection and ensure
            every order reaches you quickly and safely.
          </p>
        </section>

        <section className="about-section">
          <h2>Why Choose Us</h2>
          <div className="about-values">
            {values.map(({ icon, title, desc }) => (
              <div key={title} className="about-value-card">
                <div className="about-value-icon">{icon}</div>
                <h3>{title}</h3>
                <p>{desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="about-section">
          <h2>Our Promise</h2>
          <p>
            Customer satisfaction is at the heart of everything we do. Whether
            you're browsing or buying, we want you to feel confident and cared
            for at every step. If something isn't right, our 24/7 support team
            is always here to help.
          </p>
        </section>

        <div className="about-cta">
          <h2>Ready to explore?</h2>
          <p>Browse thousands of products and find your next favourite thing.</p>
          <Link to={ROUTES.PRODUCTS} className="about-cta-btn">
            <FiShoppingBag /> Shop Now <FiArrowRight />
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AboutPage;
