import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import { fetchTaxonImage, getTopCountries, STATUS_LABEL, type GbifCard as Card } from '../services/gbif';
import FavoriteButton from './FavoriteButton';

/** Species card for GBIF results — lazily fetches a representative image and
 *  its top occurrence countries once it scrolls near the viewport, so a grid
 *  isn't N image + facet calls up front.
 *
 *  The card navigates via a stretched <Link> overlay rather than wrapping its
 *  contents in an anchor, so the FavoriteButton is a sibling (not a button
 *  nested inside a link — invalid DOM and a broken tab order). */
const GbifSpeciesCard = ({ card }: { card: Card }) => {
  const ref = useRef<HTMLElement>(null);
  const [img, setImg] = useState<string | null>(card.image ?? null);
  const [tried, setTried] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [places, setPlaces] = useState<string[]>([]);
  const imgFetched = useRef(false);
  const placesFetched = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let dwell: ReturnType<typeof setTimeout> | undefined;

    const io = new IntersectionObserver(entries => {
      const visible = entries.some(e => e.isIntersecting);
      if (visible) {
        // Images preload eagerly (300px margin) — good perceived speed.
        if (!img && !imgFetched.current) {
          imgFetched.current = true;
          fetchTaxonImage(card.key).then(u => { if (u) setImg(u); }).finally(() => setTried(true));
        }
        // The country facet is a heavier call, so it waits for a short dwell:
        // cards flung past during fast scroll never fire it.
        if (!placesFetched.current && dwell === undefined) {
          dwell = setTimeout(() => {
            placesFetched.current = true;
            getTopCountries(card.key, 3).then(cs => setPlaces(cs.map(c => c.name))).catch(() => {});
          }, 350);
        }
      } else if (dwell !== undefined) {
        clearTimeout(dwell);
        dwell = undefined;
      }
    }, { rootMargin: '300px' });

    io.observe(el);
    return () => { io.disconnect(); if (dwell !== undefined) clearTimeout(dwell); };
  }, [card.key, img]);

  const statusLabel = card.status ? STATUS_LABEL[card.status] ?? card.status : undefined;

  return (
    <article ref={ref} className="gcard">
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
      </div>

      {statusLabel && (
        <span className={`gcard__status s-${card.status}`} title={`Conservation status: ${statusLabel}`}>
          {statusLabel}
        </span>
      )}

      <div className="gcard__body">
        <span className="gcard__kingdom">{card.kingdom}</span>
        <h3 className="gcard__name">{card.name}</h3>
        <p className="gcard__sci">{card.scientificName}</p>
        {places.length > 0 && (
          <p className="gcard__where"><MapPin size={13} strokeWidth={2} aria-hidden="true" /> {places.join(' · ')}</p>
        )}
      </div>

      <Link to={`/explore/${card.key}`} className="gcard__link" aria-label={card.name} />
      <FavoriteButton
        className="gcard__fav"
        fav={{ source: 'gbif', key: String(card.key), name: card.name, scientificName: card.scientificName, image: img }}
      />
    </article>
  );
};

export default GbifSpeciesCard;
