import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, Camera, Check, ChevronLeft, ChevronRight, Clock3,
  ExternalLink, MapPin, Share2, Star, Users, X,
} from 'lucide-react';
import {
  getNairobiAttractionImages,
  NAIROBI_ATTRACTIONS_BY_SLUG,
} from '../data/nairobiAttractions';
import FavoriteButton from '../components/FavoriteButton';
import { recordActivity } from '../services/accountApi';
import './NairobiAttractionDetail.css';

const imageCaption = (path: string) => {
  const filename = decodeURIComponent(path.split('/').pop() ?? 'Attraction view')
    .replace(/\.[^.]+$/, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\s*\(\d+\)$/, '');
  return /^(caption|image|photo\d*jpg|\w{1,2}|\d+)$/i.test(filename) ? 'Visitor view' : filename;
};

const NairobiAttractionDetail = () => {
  const { destinationSlug, attractionSlug = '' } = useParams();
  const attraction = NAIROBI_ATTRACTIONS_BY_SLUG[attractionSlug];
  const imageSet = getNairobiAttractionImages(attractionSlug);
  const gallery = useMemo(() => imageSet ? imageSet.images.filter((image) => image !== imageSet.hero) : [], [imageSet]);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [shared, setShared] = useState(false);

  useEffect(() => {
    if (!attraction) return;
    const oldTitle = document.title;
    document.title = `${attraction.name} | Nairobi Attractions | WorldSphere`;
    const socialImages = document.querySelectorAll<HTMLMetaElement>('meta[property="og:image"], meta[name="twitter:image"]');
    const previous = [...socialImages].map((meta) => meta.content);
    socialImages.forEach((meta) => { meta.content = '/WorldSphere-Logo-Package/WorldSphere-Logo.png'; });
    return () => {
      document.title = oldTitle;
      socialImages.forEach((meta, index) => { meta.content = previous[index] ?? '/WorldSphere-Logo-Package/WorldSphere-Logo.png'; });
    };
  }, [attraction]);

  useEffect(() => {
    if (attraction) recordActivity({ eventType: 'attraction_viewed', resourceType: 'attraction', resourceId: attraction.slug, label: attraction.name }).catch(() => undefined);
  }, [attraction]);
  useEffect(() => {
    if (lightboxIndex === null) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setLightboxIndex(null);
      if (event.key === 'ArrowRight') setLightboxIndex((current) => current === null ? null : (current + 1) % gallery.length);
      if (event.key === 'ArrowLeft') setLightboxIndex((current) => current === null ? null : (current - 1 + gallery.length) % gallery.length);
    };
    window.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKey);
    };
  }, [gallery.length, lightboxIndex]);

  if (destinationSlug !== 'nairobi' || !attraction || !imageSet?.hero) {
    return <Navigate to="/destinations/nairobi#attractions" replace />;
  }

  const shareAttraction = async () => {
    const shareData = { title: attraction.name, text: attraction.shortDescription, url: window.location.href };
    if (navigator.share) await navigator.share(shareData);
    else await navigator.clipboard.writeText(window.location.href);
    setShared(true);
    window.setTimeout(() => setShared(false), 1800);
  };

  const [lat, lng] = attraction.coordinates;
  const mapEmbed = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - .015}%2C${lat - .012}%2C${lng + .015}%2C${lat + .012}&layer=mapnik&marker=${lat}%2C${lng}`;
  const related = attraction.nearby.map((slug) => NAIROBI_ATTRACTIONS_BY_SLUG[slug]).filter(Boolean);

  return (
    <main className="attraction-page">
      <nav className="attraction-breadcrumbs" aria-label="Breadcrumb">
        <Link to="/">Home</Link><span>/</span>
        <Link to="/tourism#destinations">Destinations</Link><span>/</span>
        <Link to="/destinations/nairobi">Nairobi</Link><span>/</span>
        <span aria-current="page">{attraction.name}</span>
      </nav>

      <header className="attraction-hero">
        <img src={imageSet.hero} alt={`${attraction.name} in Nairobi`} onError={(event) => { event.currentTarget.src = imageSet.images[0]; }} />
        <div className="attraction-hero__overlay" />
        <div className="attraction-hero__content">
          <Link to="/destinations/nairobi#attractions"><ArrowLeft size={17} /> Back to Nairobi</Link>
          <div>
            <p><MapPin size={16} /> Nairobi, Kenya Ã‚Â· {attraction.category}</p>
            <h1>{attraction.name}</h1>
            <span className="attraction-hero__rating"><Star size={16} fill="currentColor" /> {attraction.rating}</span>
            <p className="attraction-hero__intro">{attraction.shortDescription}</p>
            <div className="attraction-hero__actions">
              <FavoriteButton fav={{ source: 'attraction', key: attraction.slug, name: attraction.name, image: imageSet.hero }} className="attraction-favorite" />
              <button onClick={shareAttraction}><Share2 size={18} /> {shared ? 'Link copied' : 'Share'}</button>
              <a href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=16/${lat}/${lng}`} target="_blank" rel="noreferrer"><MapPin size={18} /> Open in map</a>
            </div>
          </div>
        </div>
      </header>

      <section className="attraction-quick" aria-label="Quick visitor information">
        {[
          ['Opening hours', attraction.openingHours],
          ['Entry fee', attraction.entryFee],
          ['Visit duration', attraction.visitDuration],
          ['Best time', attraction.bestTime],
          ['Accessibility', attraction.accessibility],
          ['For families', attraction.familySuitable],
          ['Photography', attraction.photography],
          ['Transport', attraction.transport],
        ].map(([label, value]) => <article key={label}><span>{label}</span><strong>{value}</strong></article>)}
      </section>

      <section className="attraction-about attraction-section">
        <div><p>Why visit</p><h2>About {attraction.name}</h2></div>
        <div>{attraction.about.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
      </section>

      <section className="attraction-experiences">
        <header><h2>Things to see and do</h2><p>Use these as a guide; on-site programmes and conditions can change.</p></header>
        <div>
          {attraction.activities.map((activity, index) => {
            const image = imageSet.images[(index + 1) % imageSet.images.length];
            return <article key={activity}>
              <img src={image} alt={`${activity} at ${attraction.name}`} loading="lazy" decoding="async" onError={(event) => { event.currentTarget.src = imageSet.hero; }} />
              <div><span>{String(index + 1).padStart(2, '0')}</span><h3>{activity}</h3><p>{index % 2 ? 'Suitable for curious and active travellers' : 'Suitable for families, couples and solo travellers'}</p></div>
            </article>;
          })}
        </div>
      </section>

      <section className="attraction-section attraction-gallery">
        <header><h2>Attraction gallery</h2><p>{gallery.length} images, all sourced only from the {imageSet.folder} folder.</p></header>
        <div>
          {gallery.map((image, index) => <button type="button" key={image} onClick={() => setLightboxIndex(index)} aria-label={`Open ${imageCaption(image)} image ${index + 1} of ${gallery.length}`}>
            <img src={image} alt={`${imageCaption(image)} at ${attraction.name}`} loading="lazy" decoding="async" onError={(event) => { event.currentTarget.src = imageSet.hero; }} />
            <span>{imageCaption(image)}</span>
          </button>)}
        </div>
      </section>

      {lightboxIndex !== null && gallery[lightboxIndex] && <div className="attraction-lightbox" role="dialog" aria-modal="true" aria-label={`${attraction.name} gallery`}>
        <button className="attraction-lightbox__close" onClick={() => setLightboxIndex(null)} aria-label="Close gallery"><X size={24} /></button>
        <button className="attraction-lightbox__previous" onClick={() => setLightboxIndex((lightboxIndex - 1 + gallery.length) % gallery.length)} aria-label="Previous image"><ChevronLeft size={30} /></button>
        <figure><img src={gallery[lightboxIndex]} alt={`${imageCaption(gallery[lightboxIndex])} at ${attraction.name}`} /><figcaption>{imageCaption(gallery[lightboxIndex])} Ã‚Â· {lightboxIndex + 1} of {gallery.length}</figcaption></figure>
        <button className="attraction-lightbox__next" onClick={() => setLightboxIndex((lightboxIndex + 1) % gallery.length)} aria-label="Next image"><ChevronRight size={30} /></button>
      </div>}

      <section className="attraction-visitor attraction-section">
        <div><Users size={28} /><h2>Visitor information</h2></div>
        <ul>{attraction.visitorInfo.map((item) => <li key={item}><Check size={17} />{item}</li>)}</ul>
      </section>

      <section className="attraction-tips">
        <div><Camera size={29} /><h2>Travel tips</h2></div>
        <ul>{attraction.tips.map((tip) => <li key={tip}>{tip}</li>)}</ul>
      </section>

      <section className="attraction-map">
        <iframe src={mapEmbed} title={`Map showing ${attraction.name}`} loading="lazy" />
        <div><MapPin size={27} /><h2>Find {attraction.name}</h2><p>{attraction.transport}</p><a href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=16/${lat}/${lng}`} target="_blank" rel="noreferrer">Open full map <ExternalLink size={16} /></a></div>
      </section>

      <section className="attraction-related attraction-section">
        <header><h2>Nearby Nairobi attractions</h2><p>Continue planning without returning to the directory.</p></header>
        <div>{related.map((item) => {
          const images = getNairobiAttractionImages(item.slug);
          return <Link to={`/destinations/nairobi/attractions/${item.slug}`} key={item.slug}>
            {images?.hero && <img src={images.hero} alt="" loading="lazy" decoding="async" />}
            <span>{item.category}</span><strong>{item.name}</strong><ArrowRight size={18} />
          </Link>;
        })}</div>
      </section>

      <footer className="attraction-source">
        <Clock3 size={19} /><div><strong>Verify before visiting</strong><p>Schedules, fees, access and programmes can change.</p>{attraction.officialSource && <a href={attraction.officialSource} target="_blank" rel="noreferrer">Official visitor source <ExternalLink size={14} /></a>}</div>
      </footer>
    </main>
  );
};

export default NairobiAttractionDetail;
