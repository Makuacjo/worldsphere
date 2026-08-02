import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, Bot, CalendarDays, Check, ChevronLeft, ChevronRight,
  Clock3, Cloud, CloudRain, CloudSun, ExternalLink, MapPin, Plane, ShieldCheck, Sparkles, Star, Sun, Utensils,
  WalletCards, X,
} from 'lucide-react';
import { DESTINATION_GUIDES } from '../data/destinationGuides';
import type { DestinationGuide } from '../data/destinationGuides';
import { tourismImageManifest } from '../data/tourismImages.generated';
import { getNairobiAttractionImages, NAIROBI_ATTRACTIONS } from '../data/nairobiAttractions';
import FavoriteButton from '../components/FavoriteButton';
import { useAuth } from '../context/auth';
import { createTrip, recordActivity } from '../services/accountApi';
import { notify } from '../utils/notifications';
import './DestinationDetail.css';

const readableImageName = (path: string) => {
  const file = decodeURIComponent(path.split('/').pop() ?? 'destination view')
    .replace(/\.[^.]+$/, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\s*\(\d+\)$/, '');
  return /^(caption|image|photo\d*jpg|\w{1,2}|\d+)$/i.test(file) ? 'destination view' : file;
};

const findLocalImage = (images: readonly string[], label: string, index: number) => {
  const normalized = label.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  const terms = normalized.split(' ').filter((term) => term.length > 3 && !['kenya', 'centre', 'national'].includes(term));
  return images.find((path) => {
    const decoded = decodeURIComponent(path).toLowerCase().replace(/[^a-z0-9]+/g, ' ');
    return terms.some((term) => decoded.includes(term));
  }) ?? images[index % Math.max(images.length, 1)];
};

type WeatherCondition = DestinationGuide['seasons'][number]['condition'];

const WeatherIcon = ({ condition }: { condition: WeatherCondition }) => {
  const iconProps = { size: 22, strokeWidth: 1.8, 'aria-hidden': true as const };
  switch (condition) {
    case 'clear': return <Sun {...iconProps} />;
    case 'rain':
    case 'heavy-rain': return <CloudRain {...iconProps} />;
    case 'mixed': return <CloudSun {...iconProps} />;
    case 'cool':
    default: return <Cloud {...iconProps} />;
  }
};

const SeasonRating = ({ score }: { score: number }) => (
  <span className="destination-season-rating" aria-label={`${score} out of 5`}>
    {Array.from({ length: 5 }, (_, index) => (
      <Star key={index} size={14} fill={index < score ? 'currentColor' : 'none'} aria-hidden="true" />
    ))}
  </span>
);

const DestinationDetail = () => {
  const { slug = '' } = useParams();
  const { isAuthenticated, queueTripAfterAuth } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const destination = DESTINATION_GUIDES[slug];
  const [style, setStyle] = useState<'budget' | 'standard' | 'luxury'>('standard');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const imageSet = tourismImageManifest[slug as keyof typeof tourismImageManifest];
  const localImages = useMemo(() => imageSet ? [...imageSet.images] : [], [imageSet]);
  const gallery = useMemo(
    () => localImages.filter((image) => image !== imageSet?.hero),
    [imageSet?.hero, localImages],
  );

  const daily = useMemo(() => destination?.budget[style] ?? 0, [destination, style]);
  const saveDestinationTrip = async () => {
    if (!destination) return;
    const payload = { title: `${destination.name} trip`, resourceType: 'destination', resourceId: destination.slug, destination: destination.name, travelers: 1, notes: '', itinerary: {} };
    if (!isAuthenticated) {
      const returnTo = `${location.pathname}${location.search}`;
      queueTripAfterAuth(payload, returnTo);
      navigate('/login', { state: { from: returnTo } });
      return;
    }
    try { await createTrip(payload); notify('Destination saved as a trip.'); }
    catch (error) { notify(error instanceof Error ? error.message : 'Could not save trip.', 'error'); }
  };
  useEffect(() => {
    if (destination) recordActivity({ eventType: 'destination_viewed', resourceType: 'destination', resourceId: destination.slug, label: destination.name }).catch(() => undefined);
  }, [destination]);
  useEffect(() => {
    if (!destination) return;
    const previousTitle = document.title;
    document.title = `${destination.name} Travel Guide | WorldSphere`;
    const socialImages = document.querySelectorAll<HTMLMetaElement>('meta[property="og:image"], meta[name="twitter:image"]');
    const previousImages = [...socialImages].map((meta) => meta.content);
    socialImages.forEach((meta) => { meta.content = '/WorldSphere-Logo-Package/WorldSphere-Logo.png'; });
    return () => {
      document.title = previousTitle;
      socialImages.forEach((meta, index) => { meta.content = previousImages[index] ?? '/WorldSphere-Logo-Package/WorldSphere-Logo.png'; });
    };
  }, [destination]);

  useEffect(() => {
    if (lightboxIndex === null) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setLightboxIndex(null);
      if (event.key === 'ArrowRight') setLightboxIndex((current) => current === null ? null : (current + 1) % gallery.length);
      if (event.key === 'ArrowLeft') setLightboxIndex((current) => current === null ? null : (current - 1 + gallery.length) % gallery.length);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [gallery.length, lightboxIndex]);

  if (!destination) return <Navigate to="/tourism#destinations" replace />;

  const [lat, lng] = destination.coordinates;
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - .08}%2C${lat - .06}%2C${lng + .08}%2C${lat + .06}&layer=mapnik&marker=${lat}%2C${lng}`;
  const aiContext = encodeURIComponent(`Plan a ${destination.facts[1]?.value ?? '3-day'} trip to ${destination.name}.`);

  return (
    <main className="destination-detail">
      <header className="destination-hero">
        <img src={destination.hero} alt={`${destination.name} landscape`} />
        <div className="destination-hero__shade" />
        <div className="destination-hero__content">
          <Link to="/tourism#destinations"><ArrowLeft size={17} /> Kenya destinations</Link>
          <div className="destination-hero__copy">
            <p><MapPin size={16} /> {destination.county} County, Kenya</p>
            <h1>{destination.name}</h1>
            <div className="destination-hero__rating"><Star size={17} fill="currentColor" /> {destination.rating}</div>
            <h2>{destination.tagline}</h2>
            <ul>{destination.categories.map((category) => <li key={category}>{category}</li>)}</ul>
            <div className="destination-hero__actions">
              <Link to={`/ai/tour-guide?prompt=${aiContext}`} className="is-primary"><Sparkles size={18} /> Plan my trip</Link>
              <button type="button" onClick={saveDestinationTrip}><CalendarDays size={18} /> Save trip</button>
              <FavoriteButton fav={{ source: 'destination', key: destination.slug, name: destination.name, image: destination.hero }} />
              <a href="#destination-map"><MapPin size={18} /> View map</a>
            </div>
          </div>
        </div>
      </header>

      <nav className="destination-subnav" aria-label={`${destination.name} guide sections`}>
        {['Overview', 'Attractions', 'Budget', 'Itinerary', 'Map', 'Safety'].map((label) =>
          <a key={label} href={`#${label.toLowerCase() === 'map' ? 'destination-map' : label.toLowerCase()}`}>{label}</a>)}
      </nav>

      <section className="destination-facts" aria-label="Quick information">
        {destination.facts.map((fact) => <div key={fact.label}><span>{fact.label}</span><strong>{fact.value}</strong></div>)}
      </section>

      <section id="overview" className="destination-section destination-overview">
        <div>
          <p className="destination-kicker">Know the place</p>
          <h2>About {destination.name}</h2>
        </div>
        <div>{destination.overview.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
      </section>

      <section id="attractions" className="destination-section">
        <header className="destination-section__head"><div><h2>Top attractions</h2><p>Start here, then leave room for recommendations from local guides.</p></div></header>
        <div className="attraction-grid">
          {destination.slug === 'nairobi' ? NAIROBI_ATTRACTIONS.map((attraction) => {
            const attractionImages = getNairobiAttractionImages(attraction.slug);
            return <Link className="attraction-grid__link" to={`/destinations/nairobi/attractions/${attraction.slug}`} key={attraction.slug} aria-label={`View ${attraction.name} attraction guide`}>
              <div className="attraction-grid__image"><img src={attractionImages?.hero ?? destination.hero} alt={`${attraction.name} in Nairobi`} loading="lazy" decoding="async" onError={(event) => { event.currentTarget.src = destination.hero; }} /></div>
              <div>
                <div className="attraction-grid__heading"><h3>{attraction.name}</h3><ArrowRight size={18} /></div><p>{attraction.shortDescription}</p>
                <dl><div><dt>Visit time</dt><dd>{attraction.visitDuration}</dd></div><div><dt>Hours</dt><dd>{attraction.openingHours}</dd></div><div><dt>Fee</dt><dd>{attraction.entryFee}</dd></div></dl>
                <span className="attraction-grid__view">View attraction <ArrowRight size={15} /></span>
              </div>
            </Link>;
          }) : destination.attractions.map((attraction) => (
            <article key={attraction.name}>
              <img src={findLocalImage(localImages, attraction.name, destination.attractions.indexOf(attraction)) ?? attraction.image} alt={`${attraction.name} in ${destination.name}`} loading="lazy" decoding="async" onError={(event) => { event.currentTarget.src = attraction.image; }} />
              <div>
                <h3>{attraction.name}</h3><p>{attraction.description}</p>
                <dl><div><dt>Visit time</dt><dd>{attraction.time}</dd></div><div><dt>Hours</dt><dd>{attraction.hours}</dd></div><div><dt>Fee</dt><dd>{attraction.fee}</dd></div></dl>
                <a href={`https://www.openstreetmap.org/search?query=${encodeURIComponent(attraction.mapQuery)}`} target="_blank" rel="noreferrer">Open map <ExternalLink size={15} /></a>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="destination-do">
        <div><h2>Things to do</h2><p>Build days around experiences, not a race between landmarks.</p></div>
        <div className="destination-activity-grid">
          {destination.things.map((thing, index) => {
            const image = findLocalImage(localImages, thing, index);
            return <article key={thing}>
              {image && <img src={image} alt={`${thing} in ${destination.name}`} loading="lazy" decoding="async" onError={(event) => { event.currentTarget.src = destination.hero; }} />}
              <div><span>{String(index + 1).padStart(2, '0')}</span><h3>{thing}</h3><p>{index % 3 === 0 ? '2–4 hours' : index % 3 === 1 ? 'Half day' : 'Flexible'} · {index % 2 === 0 ? 'Couples, solo and families' : 'Active and curious travellers'}</p></div>
            </article>;
          })}
        </div>
      </section>

      <section className="destination-section destination-food">
        <div><Utensils size={28} /><h2>What to eat</h2><p>Ask what is seasonal, locally prepared and loved by the people who live here.</p></div>
        <ul>{destination.foods.map((food) => <li key={food}>{food}</li>)}</ul>
      </section>

      <section className="destination-section destination-stays">
        <header className="destination-section__head"><div><h2>Where to stay</h2><p>Choose location and transfer convenience before room category. Availability and rates must be confirmed with the property.</p></div></header>
        <div>
          {['Value base', 'Comfort stay', 'Lodge or resort'].map((type, index) => {
            const stayImages = localImages.filter((image) => /resort|lodge|hotel|beach/i.test(decodeURIComponent(image)));
            const image = stayImages[index % Math.max(stayImages.length, 1)] ?? localImages[index % Math.max(localImages.length, 1)];
            return <article key={type}>
              {image && <img src={image} alt={`${type} inspiration in ${destination.name}`} loading="lazy" decoding="async" onError={(event) => { event.currentTarget.src = destination.hero; }} />}
              <div><h3>{type}</h3><p>{index === 0 ? 'Prioritise transport access and verified recent reviews.' : index === 1 ? 'Balance location, comfort and included transfers.' : 'Confirm meals, activity access and all transfer charges.'}</p><span>Check current availability</span></div>
            </article>;
          })}
        </div>
      </section>

      <section id="budget" className="destination-budget">
        <div><WalletCards size={28} /><h2>Daily budget planner</h2><p>Planning estimate per person in USD. Accommodation, transport and activities vary sharply by dates and operator.</p></div>
        <div>
          <div className="destination-budget__switch">
            {(['budget', 'standard', 'luxury'] as const).map((option) =>
              <button key={option} className={style === option ? 'is-active' : ''} onClick={() => setStyle(option)}>{option}</button>)}
          </div>
          <strong>${daily}<small>/day</small></strong>
          <dl>
            <div><dt>Accommodation</dt><dd>${Math.round(daily * .45)}</dd></div>
            <div><dt>Food</dt><dd>${Math.round(daily * .18)}</dd></div>
            <div><dt>Transport</dt><dd>${Math.round(daily * .15)}</dd></div>
            <div><dt>Activities & buffer</dt><dd>${daily - Math.round(daily * .45) - Math.round(daily * .18) - Math.round(daily * .15)}</dd></div>
          </dl>
        </div>
      </section>

      <section id="itinerary" className="destination-section">
        <header className="destination-section__head"><div><h2>Suggested itinerary</h2><p>A sensible starting point, designed to be adjusted around opening times and transfer conditions.</p></div></header>
        <div className="destination-itinerary">
          {destination.itinerary.map((day) => <article key={day.day}><span>{day.day}</span><h3>{day.title}</h3><ol>{day.stops.map((stop) => <li key={stop}>{stop}</li>)}</ol></article>)}
        </div>
      </section>

      <section className="destination-section destination-seasons">
        <div><CalendarDays size={28} /><h2>Best time to visit</h2><p>Season patterns are a guide. Check Kenya Meteorological Department forecasts close to travel.</p></div>
        <div>{destination.seasons.map((season) => <article key={season.months}>
          <strong>{season.months}</strong>
          <span className="destination-season-weather" aria-label={`${season.condition.replace('-', ' ')} weather`}><WeatherIcon condition={season.condition} /></span>
          <SeasonRating score={season.score} />
          <p>{season.note}</p>
        </article>)}</div>
      </section>

      <section className="destination-section destination-transport">
        <div><Plane size={28} /><h2>Getting around</h2></div>
        <ul>{destination.transport.map((item) => <li key={item}><Check size={17} />{item}</li>)}</ul>
      </section>

      <section id="destination-map" className="destination-map">
        <iframe title={`OpenStreetMap showing ${destination.name}`} src={mapUrl} loading="lazy" />
        <div><MapPin size={27} /><h2>Explore the area</h2><p>This free OpenStreetMap view gives you geographic context. Confirm gates, roads and exact pickup points with your accommodation or operator.</p><a href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=11/${lat}/${lng}`} target="_blank" rel="noreferrer">Open full map <ExternalLink size={16} /></a></div>
      </section>

      <section id="safety" className="destination-safety">
        <div><ShieldCheck size={30} /><h2>Travel with awareness</h2></div>
        <ul>{destination.safety.map((tip) => <li key={tip}><Check size={17} />{tip}</li>)}</ul>
      </section>

      <section className="destination-gallery">
        <header><h2>A feel for {destination.name}</h2><p>{gallery.length} local images from the destination collection. Select any image to open the full gallery.</p></header>
        <div>{gallery.map((image, index) => <button type="button" key={`${image}-${index}`} onClick={() => setLightboxIndex(index)} aria-label={`Open ${readableImageName(image)} image ${index + 1} of ${gallery.length}`}><img src={image} alt={`${readableImageName(image)} in ${destination.name}`} loading="lazy" decoding="async" onError={(event) => { event.currentTarget.src = destination.hero; }} /></button>)}</div>
      </section>

      {lightboxIndex !== null && gallery[lightboxIndex] && <div className="destination-lightbox" role="dialog" aria-modal="true" aria-label={`${destination.name} image gallery`}>
        <button className="destination-lightbox__close" onClick={() => setLightboxIndex(null)} aria-label="Close gallery"><X size={24} /></button>
        <button className="destination-lightbox__previous" onClick={() => setLightboxIndex((lightboxIndex - 1 + gallery.length) % gallery.length)} aria-label="Previous image"><ChevronLeft size={28} /></button>
        <figure><img src={gallery[lightboxIndex]} alt={`${readableImageName(gallery[lightboxIndex])} in ${destination.name}`} /><figcaption>{readableImageName(gallery[lightboxIndex])} · {lightboxIndex + 1} of {gallery.length}</figcaption></figure>
        <button className="destination-lightbox__next" onClick={() => setLightboxIndex((lightboxIndex + 1) % gallery.length)} aria-label="Next image"><ChevronRight size={28} /></button>
      </div>}

      <section className="destination-ai">
        <Bot size={34} />
        <div><h2>Your {destination.name} guide, inside WorldSphere</h2><p>Turn these ideas into a schedule around your group, dates, budget and interests.</p></div>
        <Link to={`/ai/tour-guide?prompt=${aiContext}`}>Ask Tour Guide AI <ArrowRight size={17} /></Link>
      </section>

      <section className="destination-section destination-related">
        <header className="destination-section__head"><div><h2>Continue through Kenya</h2><p>Choose the next place without losing the shape of your trip.</p></div></header>
        <div>{destination.nearby.map((place) => <Link to={`/destinations/${place.slug}`} key={place.slug}><span>{place.time}</span><strong>{place.name}</strong><ArrowRight size={18} /></Link>)}</div>
      </section>

      <footer className="destination-sources">
        <Clock3 size={20} />
        <div><strong>Plan with current information</strong><p>Fees, hours, weather and advisories change. Verify details using the official sources below.</p>
          <ul>{destination.sources.map((source) => <li key={source.url}><a href={source.url} target="_blank" rel="noreferrer">{source.label} <ExternalLink size={13} /></a></li>)}</ul>
        </div>
      </footer>
    </main>
  );
};

export default DestinationDetail;
