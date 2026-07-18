import { lazy, Suspense } from 'react';
import { Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Compass, Play } from 'lucide-react';
import { useMagnetic } from '../hooks/useMagnetic';

// The WebGL field (ogl) loads after the hero paints; the CSS gradient in
// ShaderBackground's own fallback markup covers the gap, so first paint is instant.
const ShaderBackground = lazy(() => import('./ShaderBackground'));

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.15 } },
};

const item = {
  hidden: { opacity: 0, y: 26, filter: 'blur(8px)' },
  show: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  },
};

const Hero = () => {
  const magPrimary = useMagnetic<HTMLAnchorElement>();
  const magGhost = useMagnetic<HTMLAnchorElement>(0.25);

  return (
    <section className="hero">
      <Suspense fallback={<div className="shader-stage" aria-hidden="true"><div className="shader-fallback" /></div>}>
        <ShaderBackground />
      </Suspense>

      <Container>
        <motion.div className="hero__inner" variants={container} initial="hidden" animate="show">
          <motion.p className="kicker hero__kicker mb-3" variants={item}>WORLDSPHERE</motion.p>

          <motion.h1 className="hero__title" variants={item}>
            Explore the <em>Planet.</em>
          </motion.h1>

          <motion.p className="hero__lede" variants={item}>
            Discover knowledge. Connect humanity. A living atlas of Earth's
            animals, plants, and waters — told with the care of a field expedition.
          </motion.p>

          <motion.div className="hero__actions" variants={item}>
            <Link ref={magPrimary} to="/explore" className="btn btn-solar">
              <Compass size={18} strokeWidth={2} /> Begin Exploring
            </Link>
            <Link ref={magGhost} to="/stories" className="btn btn-ghost">
              <Play size={16} strokeWidth={2} /> Watch Stories
            </Link>
          </motion.div>
        </motion.div>
      </Container>

      <div className="hero__scroll" aria-hidden="true">
        Scroll
        <span />
      </div>
    </section>
  );
};

export default Hero;
