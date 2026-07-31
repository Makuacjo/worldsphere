import { useEffect, useState, lazy, Suspense } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink, MapPin, Database } from 'lucide-react';
import {
  getSpecies, getDescription, getGallery, getOccurrenceCount, getTopCountries, getRange,
  gbifOrgUrl, STATUS_LABEL, GbifError, type GbifTaxon, type CountryStat, type RangeInfo,
} from '../services/gbif';
import FavoriteButton from '../components/FavoriteButton';

// Heavy (world topojson + d3-geo) â€” only pulled in when a species detail renders.
const ChoroplethMap = lazy(() => import('../components/ChoroplethMap'));

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
  const [countries, setCountries] = useState<CountryStat[]>([]);
  const [range, setRange] = useState<RangeInfo | null>(null);
  const [whereDone, setWhereDone] = useState(false); // both distribution calls settled
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    queueMicrotask(() => {
      if (alive) {
        setLoading(true);
        setError('');
      }
    });
    // Core detail first, then enrich (each best-effort).
    getSpecies(id)
      .then(t => { if (alive) setTaxon(t); })
      .catch(err => { if (alive) setError(err instanceof GbifError ? err.message : 'Could not load this species.'); })
      .finally(() => { if (alive) setLoading(false); });

    queueMicrotask(() => { if (alive) setWhereDone(false); });
    getGallery(id).then(g => alive && setGallery(g)).catch(() => {});
    getDescription(id).then(d => alive && setDesc(d)).catch(() => {});
    getOccurrenceCount(id).then(c => alive && setCount(c)).catch(() => {});

    // Both distribution sources must settle before we can say "no data".
    Promise.allSettled([
      getTopCountries(id, 250).then(c => alive && setCountries(c)),
      getRange(id).then(r => alive && setRange(r)),
    ]).finally(() => { if (alive) setWhereDone(true); });

    return () => { alive = false; };
  }, [id]);

  if (loading && !taxon) {
    return <section className="page-shell"><div className="container"><p className="empty-note">Loadingâ€¦</p></div></section>;
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

        {(range?.native.length || range?.introduced.length || countries.length > 0) ? (
          <div className="gbif-where">
            <h2 className="section-sub" style={{ marginTop: 'var(--space-lg)' }}>
              <MapPin size={18} strokeWidth={2} style={{ verticalAlign: '-3px' }} /> Where it's found
            </h2>

            {range && range.native.length > 0 && (
              <div className="gbif-range">
                <span className="gbif-range__label">Native range</span>
                <div className="gbif-taxa">
                  {range.native.map(r => <span key={r} className="chip chip--sm">{r}</span>)}
                </div>
              </div>
            )}

            {range && range.introduced.length > 0 && (
              <div className="gbif-range">
                <span className="gbif-range__label">Introduced</span>
                <div className="gbif-taxa">
                  {range.introduced.map(r => <span key={r} className="chip chip--sm chip--muted">{r}</span>)}
                </div>
              </div>
            )}

            {countries.length > 0 && (
              <div className="gbif-range">
                <span className="gbif-range__label">Occurrence map Â· {countries.length} countries</span>
                <Suspense fallback={<div className="choropleth choropleth--loading" aria-hidden="true" />}>
                  <ChoroplethMap data={countries} />
                </Suspense>
              </div>
            )}

            {countries.length > 0 && (
              <div className="gbif-range">
                <span className="gbif-range__label">Most records by country</span>
                <ul className="gbif-bars">
                  {countries.slice(0, 8).map(c => (
                    <li key={c.code} className="gbif-bar">
                      <span className="gbif-bar__name">{c.name}</span>
                      <span className="gbif-bar__track">
                        <span
                          className="gbif-bar__fill"
                          style={{ width: `${Math.max(4, (c.count / countries[0].count) * 100)}%` }}
                        />
                      </span>
                      <span className="gbif-bar__count">{c.count.toLocaleString()}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : whereDone ? (
          <div className="gbif-where">
            <h2 className="section-sub" style={{ marginTop: 'var(--space-lg)' }}>
              <MapPin size={18} strokeWidth={2} style={{ verticalAlign: '-3px' }} /> Where it's found
            </h2>
            <p className="empty-note" style={{ margin: 0 }}>Distribution data isn't available for this species yet.</p>
          </div>
        ) : null}

        {gallery.length > 1 && (
          <>
            <h2 className="section-sub" style={{ marginTop: 'var(--space-lg)' }}>From the field</h2>
            <div className="gbif-gallery">
              {gallery.slice(0, 8).map((src, i) => (
                <img key={src} src={src} alt={`${title} ${i + 1}`} loading="lazy" decoding="async" />
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
