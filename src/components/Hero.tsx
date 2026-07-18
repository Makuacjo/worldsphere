import { lazy, Suspense } from 'react';
import { Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

// The WebGL field (ogl) loads after the hero paints; the CSS gradient in
// ShaderBackground's own fallback markup covers the gap, so first paint is instant.
const ShaderBackground = lazy(() => import('./ShaderBackground'));

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.1, delayChildren: 0.15 },
  },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  },
};

const categories = [
  { label: 'Animals', to: '/animals' },
  { label: 'Plants', to: '/plants' },
  { label: 'Waters', to: '/waters' },
];

const Hero = () => {
  return (
    <section className="hero">
      <Suspense fallback={<div className="shader-stage" aria-hidden="true"><div className="shader-fallback" /></div>}>
        <ShaderBackground />
      </Suspense>

      <Container>
        <motion.div
          className="hero__inner"
          variants={container}
          initial="hidden"
          animate="show"
        >
          <motion.p className="kicker mb-3" variants={item} style={{ color: 'var(--highlight-color)' }}>
            A living atlas of Earth
          </motion.p>

          <motion.h1 className="hero__title" variants={item}>
            The wild, <em>documented</em> with care.
          </motion.h1>

          <motion.p className="hero__lede" variants={item}>
            Explore the animals, plants, and waters that hold our ecosystems together —
            field notes, conservation status, and living data, all in one place.
          </motion.p>

          <motion.div className="hero__actions" variants={item}>
            <Link to="/animals" className="btn btn-solar">Start exploring</Link>
            {categories.map(c => (
              <Link key={c.to} to={c.to} className="btn btn-ghost">{c.label}</Link>
            ))}
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
