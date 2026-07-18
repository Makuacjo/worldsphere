import { useEffect, useRef, useState, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  /** Placeholder shown until the block scrolls into view. */
  placeholder?: ReactNode;
  rootMargin?: string;
  className?: string;
}

/**
 * Defers mounting heavy children (e.g. the Three.js globe) until they scroll
 * near the viewport — keeps the landing page light and fast.
 */
const LazyInView = ({ children, placeholder = null, rootMargin = '200px', className }: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || show) return;
    const io = new IntersectionObserver(
      entries => {
        if (entries.some(e => e.isIntersecting)) {
          setShow(true);
          io.disconnect();
        }
      },
      { rootMargin }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [show, rootMargin]);

  return (
    <div ref={ref} className={className}>
      {show ? children : placeholder}
    </div>
  );
};

export default LazyInView;
