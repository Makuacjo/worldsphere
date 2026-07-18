import { AnimatePresence, motion } from 'framer-motion';
import { Row } from 'react-bootstrap';
import WildlifeCard from './WildlifeCard';
import { useCountUp } from '../hooks/useCountUp';
import type { WildlifeEntry } from '../types/wildlife';

interface Props {
  entries: WildlifeEntry[];
  /** Message shown when the filtered set is empty. */
  emptyLabel: string;
}

const item = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  show: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, scale: 0.96 },
};

/**
 * Catalog grid with FLIP filtering: when the filtered set changes, cards
 * reflow to their new positions (framer `layout`) while entering/leaving cards
 * animate via AnimatePresence. Also renders an animated result count.
 */
const AnimatedCardGrid = ({ entries, emptyLabel }: Props) => {
  const count = useCountUp(entries.length);

  return (
    <>
      <p className="result-count">
        <strong>{count}</strong> {entries.length === 1 ? 'result' : 'results'}
      </p>

      {entries.length === 0 ? (
        <p className="empty-note">{emptyLabel}</p>
      ) : (
        <Row className="g-4">
          <AnimatePresence mode="popLayout">
            {entries.map(entry => (
              <motion.div
                key={entry.id}
                className="col-lg-4 col-md-6"
                layout
                variants={item}
                initial="hidden"
                animate="show"
                exit="exit"
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                <WildlifeCard entry={entry} />
              </motion.div>
            ))}
          </AnimatePresence>
        </Row>
      )}
    </>
  );
};

export default AnimatedCardGrid;
