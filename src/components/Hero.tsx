import { lazy, Suspense, useEffect, useState } from 'react';
import { Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
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
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  },
};

const HEADLINE = [
  { text: 'Explore', emphasis: false },
  { text: 'the', emphasis: false },
  { text: 'Planet.', emphasis: true },
];

const ExplodingHeadline = () => {
  const reduceMotion = useReducedMotion();
  let characterIndex = 0;

  return (
    <motion.h1 className="hero__title hero__title--animated" variants={item} aria-label="Explore the Planet.">
      {HEADLINE.map((word, wordIndex) => {
        const Word = word.emphasis ? 'em' : 'span';
        return (
          <Word className="hero__word" key={word.text} aria-hidden="true">
            {Array.from(word.text).map((character) => {
              const index = characterIndex++;
              const direction = index % 2 === 0 ? -1 : 1;
              const x = ((index % 5) - 2) * 18;
              const y = ((index % 3) - 1) * 24;
              return (
                <motion.span
                  className="hero__letter"
                  key={`${word.text}-${index}`}
                  animate={reduceMotion ? { opacity: 1 } : {
                    opacity: [1, 1, 0.18, 1],
                    x: [0, 0, x, 0],
                    y: [0, 0, y, 0],
                    rotate: [0, 0, direction * (7 + index % 4 * 3), 0],
                    scale: [1, 1, 1.12, 1],
                  }}
                  transition={reduceMotion ? { duration: 0 } : {
                    duration: 3.2,
                    times: [0, 0.55, 0.76, 1],
                    delay: index * 0.018,
                    ease: [0.34, 1.2, 0.64, 1],
                  }}
                >
                  {character}
                </motion.span>
              );
            })}
            {wordIndex < HEADLINE.length - 1 && <span className="hero__word-space"> </span>}
          </Word>
        );
      })}
    </motion.h1>
  );
};
const Hero = () => {
  const [showShader, setShowShader] = useState(false);

  useEffect(() => {
    const shouldSkip = window.matchMedia('(max-width: 767px), (prefers-reduced-motion: reduce)').matches;
    if (shouldSkip) return;
    const idle = window.requestIdleCallback?.(() => setShowShader(true), { timeout: 1200 });
    const timer = idle === undefined ? window.setTimeout(() => setShowShader(true), 600) : undefined;
    return () => {
      if (idle !== undefined) window.cancelIdleCallback?.(idle);
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, []);
  const magPrimary = useMagnetic<HTMLAnchorElement>();
  const magGhost = useMagnetic<HTMLAnchorElement>(0.25);

  return (
    <section className="hero">
      {showShader ? (
        <Suspense fallback={<div className="shader-stage" aria-hidden="true"><div className="shader-fallback" /></div>}>
          <ShaderBackground />
        </Suspense>
      ) : <div className="shader-stage" aria-hidden="true"><div className="shader-fallback" /></div>}

      <Container>
        <motion.div className="hero__inner" variants={container} initial="hidden" animate="show">
          <motion.div className="hero__kicker mb-3" variants={item}>
            <img src="/WorldSphere-Logo-Package/WorldSphere-Logo.png" alt="WorldSphere" />
          </motion.div>

          <ExplodingHeadline />

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
