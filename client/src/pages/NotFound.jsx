import React from 'react';
import { Link } from 'react-router-dom';
import { FiHome, FiArrowLeft } from 'react-icons/fi';
import { ROUTES } from '../utils/constants';

const NotFound = () => (
  <div style={{
    minHeight: '100vh', background: '#09090b',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: "'DM Sans', sans-serif", padding: '2rem', textAlign: 'center',
  }}>
    <div>
      <p style={{ fontFamily: "'Syne', sans-serif", fontSize: '8rem', fontWeight: 800, color: 'rgba(124,58,237,0.3)', lineHeight: 1, marginBottom: '1rem' }}>404</p>
      <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: '2rem', fontWeight: 800, color: 'white', marginBottom: '0.75rem' }}>Page not found</h1>
      <p style={{ color: '#71717a', marginBottom: '2rem', fontSize: '1rem' }}>Looks like you wandered off the beaten path.</p>
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
        <button onClick={() => window.history.back()}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#a1a1aa', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", fontSize: '0.9375rem' }}>
          <FiArrowLeft /> Go Back
        </button>
        <Link to={ROUTES.HOME}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', background: 'linear-gradient(135deg, #7c3aed, #a855f7)', borderRadius: '10px', color: 'white', textDecoration: 'none', fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '0.9375rem' }}>
          <FiHome /> Go Home
        </Link>
      </div>
    </div>
  </div>
);

export default NotFound;
