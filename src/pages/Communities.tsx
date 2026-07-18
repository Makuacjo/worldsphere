import { PawPrint, Sprout, Droplets, MessageCircle, Users, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { animalData, plantData, waterData } from '../data';
import Reveal from '../components/Reveal';

// Circles derived from the real catalog categories; membership figures are
// illustrative placeholders for this design preview.
const CIRCLES = [
  { icon: PawPrint, name: 'Wildlife Guild', desc: 'Trackers and field biologists documenting animal life.', entries: animalData.length, members: '3.2k', to: '/stories?category=animal' },
  { icon: Sprout, name: 'Flora Circle', desc: 'Botanists and growers cataloguing the plant world.', entries: plantData.length, members: '1.8k', to: '/stories?category=plant' },
  { icon: Droplets, name: 'Waters Collective', desc: 'Divers and hydrologists exploring aquatic ecosystems.', entries: waterData.length, members: '2.4k', to: '/stories?category=water' },
];

const THREADS = [
  { title: 'Best time to observe migratory herds in the Serengeti?', circle: 'Wildlife Guild', replies: 24 },
  { title: 'Reviving ancient seed banks — field results', circle: 'Flora Circle', replies: 17 },
  { title: 'Coral bleaching recovery: what we saw this season', circle: 'Waters Collective', replies: 31 },
  { title: 'Camera-trap ethics in protected reserves', circle: 'Wildlife Guild', replies: 12 },
];

const Communities = () => (
  <section className="page-shell">
    <div className="container">
      <header className="page-head">
        <p className="kicker">Communities</p>
        <h1 className="page-head__title">Explore together</h1>
        <p className="page-head__lede">
          Circles of explorers, researchers, and conservationists gathered around
          the species and places they care about.
        </p>
        <span className="preview-note"><Users size={13} strokeWidth={2} /> Design preview · membership figures illustrative</span>
      </header>

      <div className="tile-grid mb-5">
        {CIRCLES.map((c, i) => {
          const Icon = c.icon;
          return (
            <Reveal key={c.name} delay={i * 0.07}>
              <Link to={c.to} className="tile">
                <span className="tile__icon"><Icon size={22} strokeWidth={1.75} /></span>
                <h3 className="tile__title">{c.name}</h3>
                <p className="tile__desc">{c.desc}</p>
                <div className="tile__stats">
                  <span>{c.members} explorers</span>
                  <span>{c.entries} entries</span>
                </div>
                <span className="tile__more">Join the circle <ArrowRight size={15} strokeWidth={2} /></span>
              </Link>
            </Reveal>
          );
        })}
      </div>

      <Reveal>
        <h2 className="section-sub">Active discussions</h2>
        <ul className="thread-list">
          {THREADS.map(t => (
            <li key={t.title} className="thread">
              <MessageCircle size={18} strokeWidth={1.75} className="thread__icon" />
              <div className="thread__body">
                <p className="thread__title">{t.title}</p>
                <p className="thread__meta">{t.circle} · {t.replies} replies</p>
              </div>
              <ArrowRight size={16} strokeWidth={2} className="thread__arrow" />
            </li>
          ))}
        </ul>
      </Reveal>
    </div>
  </section>
);

export default Communities;
