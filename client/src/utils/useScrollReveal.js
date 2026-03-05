import { useEffect } from 'react';

/**
 * Watches all elements with class "reveal", "reveal-left", "reveal-scale",
 * or "stagger-children" and adds "visible" when they scroll into the viewport.
 *
 * Also uses a MutationObserver to pick up elements rendered after the initial
 * mount (e.g. product cards loaded via API).
 */
const SELECTORS = '.reveal, .reveal-left, .reveal-scale, .stagger-children';

const useScrollReveal = () => {
  useEffect(() => {
    const observed = new Set();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -30px 0px' }
    );

    /** Observe an element if we haven't already */
    const observe = (el) => {
      if (!observed.has(el)) {
        observed.add(el);
        observer.observe(el);
      }
    };

    /** Scan DOM and observe every matching element */
    const scanAndObserve = () => {
      document.querySelectorAll(SELECTORS).forEach(observe);
    };

    // Initial scan
    scanAndObserve();

    // Watch for dynamically added elements (e.g. trending products from API)
    const mutationObs = new MutationObserver((mutations) => {
      let hasNew = false;
      for (const m of mutations) {
        if (m.addedNodes.length) { hasNew = true; break; }
      }
      if (hasNew) scanAndObserve();
    });
    mutationObs.observe(document.body, { childList: true, subtree: true });

    // Safety fallback — force-reveal everything after 1.5s
    const fallback = setTimeout(() => {
      document.querySelectorAll(SELECTORS).forEach((el) => {
        el.classList.add('visible');
      });
    }, 1500);

    return () => {
      clearTimeout(fallback);
      observer.disconnect();
      mutationObs.disconnect();
    };
  }, []);
};

export default useScrollReveal;
