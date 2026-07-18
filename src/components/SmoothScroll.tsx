import { useEffect } from 'react';
import Lenis from 'lenis';

/**
 * Momentum smooth-scrolling via Lenis. Mounted once at the app root.
 * Disabled under prefers-reduced-motion so the OS setting always wins.
 */
const SmoothScroll = () => {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // lerp-based momentum feels smooth but stays snappy/responsive; a bigger
    // wheelMultiplier keeps it fast. Native (non-smoothed) scrolling on touch.
    const lenis = new Lenis({
      lerp: 0.14,
      wheelMultiplier: 1.15,
      smoothWheel: true,
      syncTouch: false,
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
