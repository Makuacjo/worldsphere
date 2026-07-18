import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { Search, Loader2 } from 'lucide-react';
import GbifSpeciesCard from '../components/GbifCard';
import { searchSpecies, GbifError, type GbifCard, type KingdomKey } from '../services/gbif';

const SUGGESTIONS = ['Panthera', 'Elephant', 'Oak', 'Coral', 'Eagle', 'Frog', 'Shark', 'Orchid'];
const KINGDOMS: (KingdomKey | 'All')[] = ['All', 'Animals', 'Plants', 'Fungi'];
const PAGE = 18;

const GbifExplore = () => {
  const [query, setQuery] = useState('');
  const [submitted, setSubmitted] = useState('');
  const [kingdom, setKingdom] = useState<KingdomKey | 'All'>('All');
  const [cards, setCards] = useState<GbifCard[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const reqId = useRef(0);

  const run = useCallback(async (q: string, king: KingdomKey | 'All', off: number, append: boolean) => {
    const id = ++reqId.current;
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

  // Seed the page with a first result set.
  useEffect(() => {
    setSubmitted(SUGGESTIONS[0]);
    run(SUGGESTIONS[0], 'All', 0, false);
  }, [run]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    setSubmitted(q);
    run(q, kingdom, 0, false);
  };

  const pickSuggestion = (s: string) => {
    setQuery(s);
    setSubmitted(s);
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

          <div className="stories__filters" style={{ marginTop: '1rem' }}>
            {SUGGESTIONS.map(s => (
              <button key={s} type="button" className="chip chip--sm" onClick={() => pickSuggestion(s)}>{s}</button>
            ))}
          </div>
          <div className="stories__filters">
            {KINGDOMS.map(k => (
              <button
                key={k}
                type="button"
                className={`chip ${kingdom === k ? 'is-active' : ''}`}
                onClick={() => pickKingdom(k)}
              >
                {k}
              </button>
            ))}
          </div>
        </header>

        {error && <p className="empty-note">{error}</p>}

        {!error && (
          <>
            <p className="result-count">
              <strong>{total.toLocaleString()}</strong> species match “{submitted}”
            </p>
            <div className="gcard-grid">
              {cards.map(card => <GbifSpeciesCard key={card.key} card={card} />)}
            </div>

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
