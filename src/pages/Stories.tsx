import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { allWildlife } from '../data';
import StoryCard from '../components/StoryCard';
import type { WildlifeEntry } from '../types/wildlife';

type CategoryFilter = 'all' | WildlifeEntry['category'];

const CHIPS: { value: CategoryFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'animal', label: 'Wildlife' },
  { value: 'plant', label: 'Flora' },
  { value: 'water', label: 'Waters' },
];

// Loose region → keyword map so the globe's region markers surface plausible
// stories from the small hand-curated dataset (no per-entry continent field).
const REGION_KEYWORDS: Record<string, string[]> = {
  Africa: ['africa', 'savanna', 'sahara', 'congo', 'nile', 'serengeti', 'sub-saharan'],
  Asia: ['asia', 'china', 'india', 'himalaya', 'bengal', 'siberia', 'mekong', 'bamboo'],
  Europe: ['europe', 'alpine', 'mediterranean', 'danube', 'nordic'],
  'North America': ['north america', 'america', 'rocky', 'amazon basin', 'canada', 'yellowstone', 'mississippi'],
  'South America': ['south america', 'amazon', 'andes', 'patagonia', 'brazil', 'rainforest'],
  Oceania: ['oceania', 'australia', 'pacific', 'reef', 'coral', 'zealand'],
};

const textOf = (e: WildlifeEntry): string => {
  const loc = e.category === 'water' ? e.region : e.category === 'animal' ? e.habitat : e.growthSeason;
  return `${e.name} ${loc} ${e.summary} ${e.content}`.toLowerCase();
};

const Stories = () => {
  const [params, setParams] = useSearchParams();
  const category = (params.get('category') as CategoryFilter) || 'all';
  const region = params.get('region') ?? '';

  const { featured, rest, regionMatched } = useMemo(() => {
    let list = allWildlife.filter(e => category === 'all' || e.category === category);

    let regionMatched = true;
    if (region) {
      const keywords = REGION_KEYWORDS[region] ?? [region.toLowerCase()];
      const matched = list.filter(e => keywords.some(k => textOf(e).includes(k)));
      // Small curated dataset — if a region has no clear match, don't strand the user.
      if (matched.length > 0) list = matched;
      else regionMatched = false;
    }

    const feat = list.find(e => e.isFeatured) ?? list[0];
    return { featured: feat, rest: list.filter(e => e !== feat), regionMatched };
  }, [category, region]);

  const setCategory = (value: CategoryFilter) => {
    const next = new URLSearchParams(params);
    if (value === 'all') next.delete('category');
    else next.set('category', value);
    setParams(next, { replace: true });
  };

  const clearRegion = () => {
    const next = new URLSearchParams(params);
    next.delete('region');
    setParams(next, { replace: true });
  };

  return (
    <section className="page-shell">
      <div className="container">
        <header className="stories__head">
          <p className="kicker">Stories</p>
          <h1 className="stories__title">Field notes from a living planet</h1>
          <p className="stories__lede measure">
            Every species is a story — of place, adaptation, and survival. Explore
            them the way an expedition journal would tell them.
          </p>

          <div className="stories__filters">
            {CHIPS.map(chip => (
              <button
                key={chip.value}
                type="button"
                className={`chip ${category === chip.value ? 'is-active' : ''}`}
                onClick={() => setCategory(chip.value)}
              >
                {chip.label}
              </button>
            ))}
            {region && (
              <button type="button" className="chip chip--region" onClick={clearRegion}>
                {regionMatched ? region : `${region} · showing all`} <X size={14} strokeWidth={2.5} />
              </button>
            )}
          </div>
        </header>

        {featured && (
          <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="stories__featured"
          >
            <StoryCard entry={featured} featured />
          </motion.div>
        )}

        <div className="stories__grid">
          <AnimatePresence mode="popLayout">
            {rest.map(entry => (
              <motion.div
                key={entry.id}
                layout
                initial={{ opacity: 0, y: 18, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                <StoryCard entry={entry} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export default Stories;
