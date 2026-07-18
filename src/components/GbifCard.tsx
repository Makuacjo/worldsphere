import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchTaxonImage, type GbifCard as Card } from '../services/gbif';

/** Species card for GBIF results — lazily fetches a representative image
 *  once it scrolls near the viewport, so a grid isn't N image calls up front. */
const GbifSpeciesCard = ({ card }: { card: Card }) => {
  const ref = useRef<HTMLAnchorElement>(null);
  const [img, setImg] = useState<string | null>(card.image ?? null);
  const [tried, setTried] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (img) return;
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(entries => {
      if (entries.some(e => e.isIntersecting)) {
        io.disconnect();
        fetchTaxonImage(card.key).then(u => { if (u) setImg(u); }).finally(() => setTried(true));
      }
    }, { rootMargin: '300px' });
    io.observe(el);
    return () => io.disconnect();
  }, [card.key, img]);

  return (
    <Link ref={ref} to={`/explore/${card.key}`} className="gcard">
      <div className="gcard__media">
        {img ? (
          <img
            src={img}
            alt={card.name}
            loading="lazy"
            className={loaded ? 'is-loaded' : ''}
            onLoad={() => setLoaded(true)}
          />
        ) : (
          <div className={`gcard__ph ${tried ? 'is-static' : ''}`} aria-hidden="true" />
        )}
        <div className="gcard__scrim" />
        {card.status && <span className={`gcard__status s-${card.status}`}>{card.status}</span>}
      </div>
      <div className="gcard__body">
        <span className="gcard__kingdom">{card.kingdom}</span>
        <h3 className="gcard__name">{card.name}</h3>
        <p className="gcard__sci">{card.scientificName}</p>
      </div>
    </Link>
  );
};

export default GbifSpeciesCard;
