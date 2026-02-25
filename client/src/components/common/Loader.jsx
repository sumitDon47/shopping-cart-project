import React from 'react';

/* ─── Inline styles so this file is zero-dependency ─────── */
const styles = {
  overlay: {
    position: 'fixed', inset: 0, zIndex: 9999,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'rgba(9,9,11,0.85)', backdropFilter: 'blur(6px)',
  },
  page: {
    minHeight: '60vh',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  inline: {
    display: 'inline-flex', alignItems: 'center', gap: '0.625rem',
  },
  box: {
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', gap: '1.25rem',
  },
  ring: (size) => ({
    width: size, height: size,
    border: `${size === 48 ? 4 : 3}px solid rgba(255,255,255,0.1)`,
    borderTopColor: '#7c3aed',
    borderRadius: '50%',
    animation: 'loader-spin 0.75s linear infinite',
    display: 'inline-block',
  }),
  text: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '0.9375rem',
    color: '#a1a1aa',
    letterSpacing: '0.02em',
  },
};

const styleTag = `@keyframes loader-spin { to { transform: rotate(360deg); } }`;

const InjectKeyframes = () => (
  <style>{styleTag}</style>
);

/* ─── Variants ───────────────────────────────────────────── */

// Full-screen overlay loader
export const FullLoader = ({ text = 'Loading...' }) => (
  <>
    <InjectKeyframes />
    <div style={styles.overlay}>
      <div style={styles.box}>
        <span style={styles.ring(48)} />
        <span style={styles.text}>{text}</span>
      </div>
    </div>
  </>
);

// Page-level loader (centered in content area)
export const PageLoader = ({ text = 'Loading...' }) => (
  <>
    <InjectKeyframes />
    <div style={styles.page}>
      <div style={styles.box}>
        <span style={styles.ring(48)} />
        <span style={styles.text}>{text}</span>
      </div>
    </div>
  </>
);

// Small inline loader (for buttons, etc.)
export const InlineLoader = ({ text = '' }) => (
  <>
    <InjectKeyframes />
    <span style={styles.inline}>
      <span style={styles.ring(18)} />
      {text && <span style={styles.text}>{text}</span>}
    </span>
  </>
);

// Default export = PageLoader
const Loader = PageLoader;
export default Loader;
