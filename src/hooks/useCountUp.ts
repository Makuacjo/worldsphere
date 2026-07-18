import { useEffect, useRef, useState } from 'react';

/**
 * Animates a number toward `target` with an ease-out-cubic curve.
 * Skips the animation (jumps straight to target) under reduced-motion or when
 * the value hasn't changed, so it's safe to feed changing filter counts.
 */
export const useCountUp = (target: number, duration = 550) => {
  const [value, setValue] = useState(target);
  const prev = useRef(target);

  useEffect(() => {
    const from = prev.current;
    const to = target;
    prev.current = target;

    if (from === to) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setValue(to);
      return;
    }

    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(from + (to - from) * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);

  return value;
};
