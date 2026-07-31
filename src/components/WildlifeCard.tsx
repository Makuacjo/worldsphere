import { useRef, type PointerEvent } from 'react';
import { Link, useViewTransitionState } from 'react-router-dom';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import type { WildlifeEntry } from '../types/wildlife';
import { getOptimizedImage } from '../utils/cloudinary';

interface Props {
  entry: WildlifeEntry;
}

const SUMMARY_LIMIT = 100;

// Badge text per entry type, from the discriminated union in types/wildlife.ts.
const getBadgeLabel = (entry: WildlifeEntry): string => {
  switch (entry.category) {
    case 'animal': return entry.status;
    case 'plant': return entry.growthSeason;
    case 'water': return entry.bodyType;
  }
};

// Water carries `region` instead of `scientificName`, so the subtitle switches
// on category rather than reading a field that isn't on every variant.
const getSubtitle = (entry: WildlifeEntry): string => {
  switch (entry.category) {
    case 'animal':
    case 'plant': return entry.scientificName;
    case 'water': return entry.region;
  }
};

const WildlifeCard = ({ entry }: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  const to = `/species/${entry.id}`;
  // True only while navigating to THIS card's detail page â€” so the shared
  // view-transition-name is present on exactly one image at a time.
  const isTransitioning = useViewTransitionState(to);
  const image = getOptimizedImage(entry.image, 'card');
  const summary = entry.summary.length > SUMMARY_LIMIT
    ? entry.summary.slice(0, SUMMARY_LIMIT).trimEnd() + 'â€¦'
    : entry.summary;

  // Pointer-driven tilt â€” small, spring-damped. Disabled under reduced-motion
  // globally by <MotionConfig reducedMotion="user">.
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(py, [0, 1], [6, -6]), { stiffness: 200, damping: 20 });
  const rotateY = useSpring(useTransform(px, [0, 1], [-6, 6]), { stiffness: 200, damping: 20 });

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width);
    py.set((e.clientY - r.top) / r.height);
  };
  const onLeave = () => { px.set(0.5); py.set(0.5); };

  return (
    <motion.div
      ref={ref}
      className="wcard"
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      style={{ rotateX, rotateY, transformPerspective: 900 }}
    >
      <Link to={to} viewTransition className="wcard__media">
        <img
          src={image}
          alt={entry.name}
          loading="lazy" decoding="async"
          style={{ viewTransitionName: isTransitioning ? 'species-media' : undefined }}
        />
        <span className="wcard__badge">{getBadgeLabel(entry)}</span>
      </Link>

      <div className="wcard__body">
        <h3 className="wcard__title">{entry.name}</h3>
        <p className="wcard__subtitle">{getSubtitle(entry)}</p>
        <p className="wcard__summary">{summary}</p>
        <Link to={to} viewTransition className="wcard__link">
          Learn more <span aria-hidden="true">â†’</span>
        </Link>
      </div>
    </motion.div>
  );
};

export default WildlifeCard;
