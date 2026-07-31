import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { Search, Loader2 } from 'lucide-react';
import GbifSpeciesCard from '../components/GbifCard';
import { searchSpecies, GbifError, type GbifCard, type KingdomKey } from '../services/gbif';
import { recordSearch } from '../services/accountApi';

const SUGGESTIONS = ['Panthera', 'Elephant', 'Oak', 'Coral', 'Eagle', 'Frog'];
const KINGDOMS: (KingdomKey | 'All')[] = ['All', 'Animals', 'Plants', 'Fungi'];
const PAGE = 18;

type RunArgs = [string, KingdomKey | 'All', number, boolean];

const GbifExplore = () => {
  const [query, setQuery] = useState('');
  const [submitted, setSubmitted] = useState(SUGGESTIONS[0]);
  const [kingdom, setKingdom] = useState<KingdomKey | 'All'>('All');
  const [cards, setCards] = useState<GbifCard[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const reqId = useRef(0);
  const lastArgs = useRef<RunArgs | null>(null);

  const run = useCallback(async (q: string, king: KingdomKey | 'All', off: number, append: boolean) => {
    const id = ++reqId.current;
    lastArgs.current = [q, king, off, append];
    setLoading(true);
    setError('');
    try {
      const { total, cards } = await searchSpecies(q, {
        kingdom: king === 'All' ? undefined : (king as KingdomKey),
        limit: PAGE,
        offset: off,
      });
      if (id !== reqId.current) return; // a newer search superseded this one
      setTotal(total);
      setOffset(off);
      setCards(prev => (append ? [...prev, ...cards] : cards));
    } catch (err) {
      if (id !== reqId.current) return;
      setError(err instanceof GbifError ? err.message : 'Something went wrong searching GBIF.');
    } finally {
      if (id === reqId.current) setLoading(false);
    }
  }, []);

  // Replay the last attempted request (ref read in a handler, never in render).
  const retry = () => { if (lastArgs.current) run(...lastArgs.current); };

  // Seed the page with a first result set.
  useEffect(() => {
    queueMicrotask(() => run(SUGGESTIONS[0], 'All', 0, false));
  }, [run]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    setSubmitted(q);
    recordSearch(q, 'gbif').catch(() => undefined);
    run(q, kingdom, 0, false);
  };

  const pickSuggestion = (s: string) => {
    setQuery(s);
    setSubmitted(s);
    recordSearch(s, 'gbif').catch(() => undefined);
    run(s, kingdom, 0, false);
  };

  const pickKingdom = (k: KingdomKey | 'All') => {
    setKingdom(k);
    if (submitted) run(submitted, k, 0, false);
  };

  return (
    <section className="page-shell">
      <div className="container">
        <header className="ai-head">
          <p className="kicker">Explore · powered by GBIF</p>
          <h1 className="ai-title">The living atlas, for real</h1>
          <p className="ai-lede measure">
            Search hundreds of millions of real biodiversity records — every
            species with photos, taxonomy, and conservation status from the
            Global Biodiversity Information Facility.
          </p>

          <form className="ai-ask" onSubmit={submit} role="search">
            <Search size={20} strokeWidth={1.75} className="ai-ask__icon" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search any species — “Panthera tigris”, “oak”, “coral”…"
              aria-label="Search GBIF species"
            />
            <button type="submit" className="btn-solar ai-ask__btn" disabled={loading}>
              {loading ? <Loader2 size={16} className="spin" /> : 'Search'}
            </button>
          </form>

          <div className="stories__filters chip-row" style={{ marginTop: '1rem' }} role="group" aria-label="Search suggestions">
            <span className="chip-row__label">Try</span>
            {SUGGESTIONS.map(s => (
              <button key={s} type="button" className="chip chip--sm" onClick={() => pickSuggestion(s)}>{s}</button>
            ))}
          </div>
          <div className="stories__filters chip-row" role="group" aria-label="Filter by kingdom">
            <span className="chip-row__label">Kingdom</span>
            {KINGDOMS.map(k => (
              <button
                key={k}
                type="button"
                className={`chip ${kingdom === k ? 'is-active' : ''}`}
                aria-pressed={kingdom === k}
                onClick={() => pickKingdom(k)}
              >
                {k}
              </button>
            ))}
          </div>
        </header>

        {/* A failed request never wipes results the user is already reading:
            the full-bleed error only shows when there's nothing on screen. */}
        {error && cards.length === 0 ? (
          <div className="empty-note" role="alert">
            <p>{error}</p>
            <button type="button" className="btn btn-solar" onClick={retry}>Try again</button>
          </div>
        ) : (
          <>
            <p className="result-count" aria-live="polite">
              <strong>{total.toLocaleString()}</strong> species match “<em>{submitted}</em>”
            </p>
            <div className="gcard-grid">
              {cards.map(card => <GbifSpeciesCard key={card.key} card={card} />)}
            </div>

            {error && (
              <div className="inline-error" role="alert">
                <span>{error}</span>
                <button type="button" className="btn btn-ghost btn-sm" onClick={retry}>Retry</button>
              </div>
            )}

            {cards.length > 0 && cards.length < total && (
              <div className="text-center" style={{ marginTop: 'var(--space-lg)' }}>
                <button
                  type="button"
                  className="btn btn-ghost"
                  disabled={loading}
                  onClick={() => run(submitted, kingdom, offset + PAGE, true)}
                >
                  {loading ? 'Loading…' : 'Load more'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default GbifExplore;
