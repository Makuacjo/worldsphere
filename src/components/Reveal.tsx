import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  className?: string;
  /** Stagger offset in seconds. */
  delay?: number;
  /** Vertical travel distance in px. */
  y?: number;
}

/**
 * Scroll-reveal wrapper. Enhances an already-rendered element: the content is
 * real DOM at all times, framer only animates its entrance once it scrolls into
 * view. Honors reduced-motion globally via <MotionConfig reducedMotion="user">.
 */
const Reveal = ({ children, className, delay = 0, y = 28 }: Props) => (
  <motion.div
    className={className}
    initial={{ opacity: 0, y }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-12% 0px' }}
    transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay }}
  >
    {children}
  </motion.div>
);

export default Reveal;
