import { CalendarDays, Gauge, MapPin, Compass } from 'lucide-react';
import { animalData, plantData, waterData } from '../data';
import { getOptimizedImage } from '../utils/cloudinary';
import Reveal from '../components/Reveal';

// Curated expeditions built from real catalog entries; dates and difficulty are
// illustrative for this design preview.
const EXPEDITIONS = [
  {
    title: 'The Great Savanna',
    region: 'Sub-Saharan Africa',
    days: 7,
    level: 'Moderate',
    img: animalData[0].image,
    blurb: 'Track the continent’s keystone mammals across grassland and acacia woodland, from waterholes at dawn to the herds at dusk.',
    highlights: animalData.slice(0, 3).map(a => a.name),
  },
  {
    title: 'Ancient Canopies',
    region: 'Tropical Rainforest',
    days: 5,
    level: 'Easy',
    img: plantData[0].image,
    blurb: 'Walk beneath giants — from buttressed hardwoods to rare understorey ferns — with the botanists who study them.',
    highlights: plantData.slice(0, 3).map(p => p.name),
  },
  {
    title: 'Blue Veins',
    region: 'Oceans & Rivers',
    days: 6,
    level: 'Challenging',
    img: waterData[0].image,
    blurb: 'Follow water from mountain source to open sea, diving the ecosystems that carry life across the planet.',
    highlights: waterData.slice(0, 3).map(w => w.name),
  },
];

const Expeditions = () => (
  <section className="page-shell">
    <div className="container">
      <header className="page-head">
        <p className="kicker">Expeditions</p>
        <h1 className="page-head__title">Journeys into the wild</h1>
        <p className="page-head__lede">
          Guided routes through Earth's great ecosystems, built around the species
          in the WorldSphere atlas.
        </p>
        <span className="preview-note"><Compass size={13} strokeWidth={2} /> Design preview · dates &amp; availability illustrative</span>
      </header>

      <div className="exped-list">
        {EXPEDITIONS.map((ex, i) => (
          <Reveal key={ex.title} delay={i * 0.08}>
            <article className="exped">
              <div className="exped__media" style={{ backgroundImage: `url(${getOptimizedImage(ex.img, 'card')})` }}>
                <span className="exped__region"><MapPin size={13} strokeWidth={2} /> {ex.region}</span>
              </div>
              <div className="exped__body">
                <h3 className="exped__title">{ex.title}</h3>
                <p className="exped__blurb">{ex.blurb}</p>
                <div className="exped__meta">
                  <span><CalendarDays size={15} strokeWidth={2} /> {ex.days} days</span>
                  <span><Gauge size={15} strokeWidth={2} /> {ex.level}</span>
                </div>
                <div className="exped__highlights">
                  {ex.highlights.map(h => <span key={h} className="chip chip--sm">{h}</span>)}
                </div>
                <button type="button" className="btn btn-ghost exped__cta" disabled>
                  Reserve a place · soon
                </button>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
);

export default Expeditions;
