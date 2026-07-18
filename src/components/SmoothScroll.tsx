import { useEffect } from 'react';
import Lenis from 'lenis';

/**
 * Momentum smooth-scrolling via Lenis. Mounted once at the app root.
 * Disabled under prefers-reduced-motion so the OS setting always wins.
 */
const SmoothScroll = () => {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });

    let raf = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
    };
  }, []);

  return null;
};

export default SmoothScroll;
