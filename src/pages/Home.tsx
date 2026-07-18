import { lazy, Suspense, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Users, Compass } from 'lucide-react';
import Hero from '../components/Hero';
import StoryCard from '../components/StoryCard';
import Reveal from '../components/Reveal';
import LazyInView from '../components/LazyInView';
import { useCountUp } from '../hooks/useCountUp';
import { allWildlife, animalData, plantData, waterData } from '../data';

const InteractiveGlobe = lazy(() => import('../components/InteractiveGlobe'));

const REGIONS = ['Africa', 'Asia', 'Europe', 'North America', 'South America', 'Oceania'];

const featured = allWildlife.filter(e => e.isFeatured).slice(0, 6);

const Stat = ({ value, label }: { value: number; label: string }) => {
  // Animate from 0 on mount.
  const [target, setTarget] = useState(0);
  useEffect(() => { setTarget(value); }, [value]);
  const shown = useCountUp(target);
  return (
    <div className="stat-strip__item">
      <span className="stat-strip__value">{shown}</span>
      <span className="stat-strip__label">{label}</span>
    </div>
  );
};

const Home = () => {
  return (
    <main>
      <Hero />

      {/* Featured Stories */}
      <section className="home-section">
        <div className="container">
          <Reveal>
            <div className="home-head">
              <div>
                <p className="kicker">Featured Stories</p>
                <h2 className="home-head__title">From the field journal</h2>
              </div>
              <Link to="/stories" className="home-head__link">All stories <ArrowRight size={16} strokeWidth={2} /></Link>
            </div>
          </Reveal>
          <div className="stories__grid">
            {featured.map((entry, i) => (
              <Reveal key={entry.id} delay={(i % 3) * 0.07}>
                <StoryCard entry={entry} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Globe */}
      <section className="home-globe">
        <LazyInView
          className="home-globe__stage"
          placeholder={<div className="globe__fallback" aria-hidden="true" />}
        >
          <Suspense fallback={<div className="globe__fallback" aria-hidden="true" />}>
            <InteractiveGlobe interactive={false} />
          </Suspense>
        </LazyInView>
        <div className="home-globe__copy">
          <Reveal>
            <p className="kicker">The living Earth</p>
            <h2 className="home-globe__title">Explore by region</h2>
            <p className="home-globe__lede">
              Spin the planet and follow life across continents. Every region tells
              a different story of adaptation and survival.
            </p>
            <Link to="/maps" data-cursor="compass" className="btn btn-solar"><Compass size={18} strokeWidth={2} /> Open the globe</Link>
          </Reveal>
        </div>
      </section>

      {/* Explore Continents */}
      <section className="home-section">
        <div className="container">
          <Reveal>
            <div className="home-head">
              <div>
                <p className="kicker">Explore</p>
                <h2 className="home-head__title">Six continents, one atlas</h2>
              </div>
            </div>
          </Reveal>
          <div className="region-grid">
            {REGIONS.map((region, i) => (
              <Reveal key={region} delay={(i % 3) * 0.06}>
                <Link to={`/stories?region=${encodeURIComponent(region)}`} className="region-card">
                  <span className="region-card__name">{region}</span>
                  <span className="region-card__go"><ArrowRight size={16} strokeWidth={2} /></span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* AI Explorer teaser */}
      <section className="home-section">
        <div className="container">
          <Reveal>
            <div className="cta-band">
              <div className="cta-band__glow" aria-hidden="true" />
              <div className="cta-band__body">
                <p className="kicker"><Sparkles size={14} strokeWidth={2} /> AI Explorer</p>
                <h2 className="cta-band__title">Ask the planet a question</h2>
                <p className="cta-band__lede">
                  Predict a species' conservation future, surface life by region, and
                  explore the data behind every answer.
                </p>
                <Link to="/ai" data-cursor="brain" className="btn btn-solar">Try AI Explorer <ArrowRight size={16} strokeWidth={2} /></Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Research snapshot */}
      <section className="home-section">
        <div className="container">
          <Reveal>
            <div className="home-head">
              <div>
                <p className="kicker">Research</p>
                <h2 className="home-head__title">By the numbers</h2>
              </div>
              <Link to="/research" className="home-head__link">Full research <ArrowRight size={16} strokeWidth={2} /></Link>
            </div>
            <div className="stat-strip">
              <Stat value={allWildlife.length} label="Catalogued species" />
              <Stat value={animalData.length} label="Animals" />
              <Stat value={plantData.length} label="Plants" />
              <Stat value={waterData.length} label="Waters" />
            </div>
          </Reveal>
        </div>
      </section>

      {/* Communities + Expeditions teasers */}
      <section className="home-section">
        <div className="container">
          <div className="teaser-grid">
            <Reveal>
              <Link to="/communities" className="teaser">
                <span className="teaser__icon"><Users size={22} strokeWidth={1.75} /></span>
                <h3 className="teaser__title">Communities</h3>
                <p className="teaser__desc">Join circles of explorers and researchers around the species you love.</p>
                <span className="teaser__more">Explore together <ArrowRight size={15} strokeWidth={2} /></span>
              </Link>
            </Reveal>
            <Reveal delay={0.08}>
              <Link to="/expeditions" className="teaser">
                <span className="teaser__icon"><Compass size={22} strokeWidth={1.75} /></span>
                <h3 className="teaser__title">Expeditions</h3>
                <p className="teaser__desc">Guided journeys through Earth's great ecosystems, built from the atlas.</p>
                <span className="teaser__more">Plan a journey <ArrowRight size={15} strokeWidth={2} /></span>
              </Link>
            </Reveal>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Home;
