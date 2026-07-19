import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink, MapPin, Database } from 'lucide-react';
import {
  getSpecies, getDescription, getGallery, getOccurrenceCount, getCountries,
  gbifOrgUrl, STATUS_LABEL, GbifError, type GbifTaxon,
} from '../services/gbif';
import FavoriteButton from '../components/FavoriteButton';

const STATUS_CODE: Record<string, string> = {
  LEAST_CONCERN: 'LC', NEAR_THREATENED: 'NT', VULNERABLE: 'VU',
  ENDANGERED: 'EN', CRITICALLY_ENDANGERED: 'CR', EXTINCT: 'EX',
  EXTINCT_IN_THE_WILD: 'EW', DATA_DEFICIENT: 'DD',
};

const GbifSpecies = () => {
  const { key } = useParams<{ key: string }>();
  const id = Number(key);

  const [taxon, setTaxon] = useState<GbifTaxon | null>(null);
  const [desc, setDesc] = useState<string | null>(null);
  const [gallery, setGallery] = useState<string[]>([]);
  const [count, setCount] = useState<number | null>(null);
  const [countries, setCountries] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError('');
    // Core detail first, then enrich (each best-effort).
    getSpecies(id)
      .then(t => { if (alive) setTaxon(t); })
      .catch(err => { if (alive) setError(err instanceof GbifError ? err.message : 'Could not load this species.'); })
      .finally(() => { if (alive) setLoading(false); });

    getGallery(id).then(g => alive && setGallery(g)).catch(() => {});
    getDescription(id).then(d => alive && setDesc(d)).catch(() => {});
    getOccurrenceCount(id).then(c => alive && setCount(c)).catch(() => {});
    getCountries(id).then(c => alive && setCountries(c)).catch(() => {});

    return () => { alive = false; };
  }, [id]);

  if (loading && !taxon) {
    return <section className="page-shell"><div className="container"><p className="empty-note">Loading…</p></div></section>;
  }
  if (error || !taxon) {
    return (
      <section className="page-shell">
        <div className="container">
          <h1 className="page-head__title">Species not found</h1>
          <p className="empty-note">{error || 'This GBIF record could not be loaded.'}</p>
          <Link to="/explore" className="btn btn-solar"><ArrowLeft size={16} strokeWidth={2} /> Back to Explore</Link>
        </div>
      </section>
    );
  }

  const common = taxon.vernacularNames?.find(v => v.language === 'eng')?.vernacularName
    ?? taxon.vernacularNames?.[0]?.vernacularName;
  const title = common ?? taxon.canonicalName ?? taxon.scientificName ?? 'Species';
  const statusRaw = (taxon.threatStatuses ?? [])[0];
  const status = statusRaw ? STATUS_CODE[statusRaw] : undefined;
  const hero = gallery[0];
  const taxonomy = [taxon.kingdom, taxon.phylum, taxon.class, taxon.order, taxon.family].filter(Boolean) as string[];

  return (
    <main style={{ background: 'var(--surface-color)', minHeight: '100vh' }}>
      <section
        className="species-hero"
        style={hero ? { backgroundImage: `url(${hero})` } : undefined}
      >
        <div className="container">
          {status && <span className="species-hero__badge">{STATUS_LABEL[status] ?? status}</span>}
          <h1 className="species-hero__title" style={{ textTransform: 'capitalize' }}>{title}</h1>
          <div className="d-flex align-items-center gap-3 flex-wrap">
            <p className="species-hero__sub mb-0">{taxon.scientificName ?? taxon.canonicalName}</p>
            <FavoriteButton
              size={20}
              fav={{ source: 'gbif', key: String(id), name: title, scientificName: taxon.scientificName ?? taxon.canonicalName ?? null, image: hero ?? null }}
            />
          </div>
        </div>
      </section>

      <div className="container" style={{ paddingBottom: 'var(--space-xl)', marginTop: 'var(--space-lg)' }}>
        <div className="gbif-meta">
          {count !== null && (
            <span className="gbif-meta__item"><Database size={15} strokeWidth={2} /> {count.toLocaleString()} records</span>
          )}
          {countries.length > 0 && (
            <span className="gbif-meta__item"><MapPin size={15} strokeWidth={2} /> {countries.join(', ')}</span>
          )}
          <a href={gbifOrgUrl(id)} target="_blank" rel="noreferrer" className="gbif-meta__link">
            View on GBIF <ExternalLink size={14} strokeWidth={2} />
          </a>
        </div>

        {taxonomy.length > 0 && (
          <div className="gbif-taxa">
            {taxonomy.map(t => <span key={t} className="chip chip--sm">{t}</span>)}
          </div>
        )}

        {desc && <p className="gbif-desc measure">{desc}</p>}

        {gallery.length > 1 && (
          <>
            <h2 className="section-sub" style={{ marginTop: 'var(--space-lg)' }}>From the field</h2>
            <div className="gbif-gallery">
              {gallery.slice(0, 8).map((src, i) => (
                <img key={src} src={src} alt={`${title} ${i + 1}`} loading="lazy" />
              ))}
            </div>
          </>
        )}

        <div style={{ marginTop: 'var(--space-lg)' }}>
          <Link to="/explore" className="btn btn-ghost"><ArrowLeft size={16} strokeWidth={2} /> Back to Explore</Link>
        </div>
      </div>
    </main>
  );
};

export default GbifSpecies;
