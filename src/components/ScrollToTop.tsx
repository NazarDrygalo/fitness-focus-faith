import { useEffect, useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";

/** Scrolls window (and the main scroll container, if any) to the top on route change. */
const ScrollToTop = () => {
  const { pathname, search } = useLocation();

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  useLayoutEffect(() => {
    const scrollTop = () => {
      window.scrollTo(0, 0);
      document.scrollingElement?.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      document.getElementById("root")?.scrollTo(0, 0);
    };

    scrollTop();
    requestAnimationFrame(scrollTop);
    const timers = [0, 75, 200].map((delay) => window.setTimeout(scrollTop, delay));
    return () => timers.forEach(window.clearTimeout);
  }, [pathname, search]);

  return null;
};

export default ScrollToTop;
