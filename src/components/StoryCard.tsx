import { Link, useViewTransitionState } from 'react-router-dom';
import { ArrowRight, Clock, MapPin } from 'lucide-react';
import { getOptimizedImage } from '../utils/cloudinary';
import type { WildlifeEntry } from '../types/wildlife';

interface Props {
  entry: WildlifeEntry;
  /** Featured cards span wider and taller. */
  featured?: boolean;
}

const CATEGORY_LABEL: Record<WildlifeEntry['category'], string> = {
  animal: 'Wildlife',
  plant: 'Flora',
  water: 'Waters',
};

// Rough reading time from the article body (~180 wpm), min 1 minute.
const readingTime = (content: string) =>
  Math.max(1, Math.round(content.trim().split(/\s+/).length / 180));

// Editorial "location" line, per entry variant.
const locationOf = (entry: WildlifeEntry): string => {
  switch (entry.category) {
    case 'animal': return entry.habitat;
    case 'plant': return entry.growthSeason;
    case 'water': return entry.region;
  }
};

const StoryCard = ({ entry, featured = false }: Props) => {
  const to = `/species/${entry.id}`;
  const isTransitioning = useViewTransitionState(to);
  const image = getOptimizedImage(entry.image, featured ? 'hero' : 'card');

  return (
    <Link to={to} viewTransition className={`story ${featured ? 'story--featured' : ''}`}>
      <div className="story__media">
        <img
          src={image}
          alt={entry.name}
          loading="lazy" decoding="async"
          style={{ viewTransitionName: isTransitioning ? 'species-media' : undefined }}
        />
        <div className="story__scrim" />
      </div>

      <div className="story__body">
        <div className="story__eyebrow">
          <span className="story__tag">{CATEGORY_LABEL[entry.category]}</span>
          <span className="story__meta"><MapPin size={13} strokeWidth={2} /> {locationOf(entry)}</span>
          <span className="story__meta"><Clock size={13} strokeWidth={2} /> {readingTime(entry.content)} min</span>
        </div>

        <h3 className="story__title">{entry.name}</h3>
        <p className="story__excerpt">{entry.summary}</p>

        <span className="story__more">
          Read story <ArrowRight size={16} strokeWidth={2} />
        </span>
      </div>
    </Link>
  );
};

export default StoryCard;
