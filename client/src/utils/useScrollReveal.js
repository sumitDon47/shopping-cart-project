import { useEffect } from 'react';

/**
 * Watches all elements with class "reveal", "reveal-left", or "reveal-scale"
 * and adds "visible" when they scroll into the viewport.
 *
 * Usage: call useScrollReveal() in any page component.
 * Elements with those classes will automatically animate in.
 */
const useScrollReveal = () => {
  useEffect(() => {
    const selectors = '.reveal, .reveal-left, .reveal-scale, .stagger-children';
    const elements = document.querySelectorAll(selectors);

    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target); // only animate once
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);
};

export default useScrollReveal;
