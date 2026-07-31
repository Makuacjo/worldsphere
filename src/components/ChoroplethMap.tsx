import { useEffect, useMemo, useState } from 'react';
import { geoNaturalEarth1, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';
import countries from 'i18n-iso-countries';
import type { CountryStat } from '../services/gbif';

/**
 * Occurrence choropleth for a species. Shades each country by how many GBIF
 * records fall in it — a log ramp of the brand accent's opacity, so it reads
 * in both themes. This is *sampling density*, not verified range (well-surveyed
 * countries look darker); the honest caveat ships in the legend.
 *
 * The world topology (~750 KB) is served as a static asset and fetched once,
 * not bundled into JS — so it's cached as data and never re-parsed as a script.
 * The projection + per-country path strings are computed once per load and
 * memoised across every species detail view.
 */

const W = 800;
const H = 412;
const TOPO_URL = `${import.meta.env.BASE_URL}geo/countries-50m.json`;

interface Geo { id: string; name: string; d: string }

// Shared across all mounts: one fetch, one projection build, reused thereafter.
let geoPromise: Promise<Geo[]> | null = null;

const loadGeos = (): Promise<Geo[]> => {
  if (geoPromise) return geoPromise;
  geoPromise = fetch(TOPO_URL)
    .then(r => {
      if (!r.ok) throw new Error(`topology ${r.status}`);
      return r.json();
    })
    .then((topo: unknown) => {
      const fc = feature(topo as never, (topo as { objects: { countries: unknown } }).objects.countries as never) as unknown as {
        features: { id?: string | number; properties?: { name?: string } }[];
      };
      const feats = fc.features.filter(f => String(f.id) !== '010'); // drop Antarctica
      const projection = geoNaturalEarth1().fitExtent([[6, 6], [W - 6, H - 6]], {
        type: 'FeatureCollection',
        features: feats,
      } as never);
      const path = geoPath(projection);
      return feats
        .map(f => ({ id: String(f.id), name: f.properties?.name ?? '', d: path(f as never) ?? '' }))
        .filter(g => g.d);
    })
    .catch(err => { geoPromise = null; throw err; }); // let a later mount retry
  return geoPromise;
};

interface Hover { name: string; count: number; x: number; y: number }

const ChoroplethMap = ({ data }: { data: CountryStat[] }) => {
  const [geos, setGeos] = useState<Geo[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [hover, setHover] = useState<Hover | null>(null);

  useEffect(() => {
    let alive = true;
    loadGeos().then(g => { if (alive) setGeos(g); }).catch(() => { if (alive) setFailed(true); });
    return () => { alive = false; };
  }, []);

  // numeric ISO id -> record count for this species.
  const { counts, max } = useMemo(() => {
    const counts = new Map<string, number>();
    for (const c of data) {
      const num = countries.alpha2ToNumeric(c.code);
      if (num) counts.set(num, c.count);
    }
    const max = data.length ? Math.max(...data.map(d => d.count)) : 0;
    return { counts, max };
  }, [data]);

  const opacityFor = (count: number) => {
    if (max <= 0) return 0;
    const t = Math.log1p(count) / Math.log1p(max);
    return 0.22 + 0.78 * t; // never fully washed out — the lowest bucket still reads
  };

  if (failed) return null; // bars below still carry the data
  if (!geos) return <div className="choropleth choropleth--loading" aria-hidden="true" />;

  const summary = data.slice(0, 5).map(d => `${d.name} (${d.count.toLocaleString()})`).join(', ');

  return (
    <figure className="choropleth" onMouseLeave={() => setHover(null)}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="choropleth__svg"
        role="img"
        aria-label={summary ? `Occurrence map. Most records: ${summary}.` : 'Occurrence map'}
        onMouseMove={e => {
          if (!hover) return;
          const r = e.currentTarget.getBoundingClientRect();
          setHover(h => (h ? { ...h, x: ((e.clientX - r.left) / r.width) * W, y: ((e.clientY - r.top) / r.height) * H } : h));
        }}
      >
        {geos.map(g => {
          const count = counts.get(g.id);
          const active = count !== undefined;
          return (
            <path
              key={g.id}
              d={g.d}
              className={`choropleth__geo${active ? ' is-active' : ''}`}
              fill={active ? 'var(--map-accent)' : 'var(--map-land)'}
              fillOpacity={active ? opacityFor(count) : 1}
              onMouseEnter={e => {
                const r = e.currentTarget.ownerSVGElement!.getBoundingClientRect();
                setHover({
                  name: g.name,
                  count: count ?? 0,
                  x: ((e.clientX - r.left) / r.width) * W,
                  y: ((e.clientY - r.top) / r.height) * H,
                });
              }}
            />
          );
        })}

        {hover && (
          <g className="choropleth__tip" transform={`translate(${hover.x}, ${hover.y})`} pointerEvents="none">
            <foreignObject x={12} y={-14} width={220} height={44}>
              <div className="choropleth__tipcard">
                <strong>{hover.name}</strong>
                <span>{hover.count > 0 ? `${hover.count.toLocaleString()} records` : 'No records'}</span>
              </div>
            </foreignObject>
          </g>
        )}
      </svg>

      <figcaption className="choropleth__legend">
        <span className="choropleth__legend-label">Fewer records</span>
        <span className="choropleth__ramp" aria-hidden="true" />
        <span className="choropleth__legend-label">More</span>
        <span className="choropleth__note">Shading reflects recorded occurrences (survey density), not verified range.</span>
      </figcaption>
    </figure>
  );
};

export default ChoroplethMap;
