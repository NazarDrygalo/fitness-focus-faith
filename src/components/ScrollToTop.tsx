import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/** Scrolls window (and the main scroll container, if any) to the top on route change. */
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Run after paint so lazy-loaded routes don't reset our scroll.
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0 });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    });
  }, [pathname]);

  return null;
};

export default ScrollToTop;
