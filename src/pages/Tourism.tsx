import { lazy, Suspense, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, CalendarDays, Check, ChevronRight, CloudSun, Compass,
  Hotel, Info, Map, MapPin, Plane, Search, ShieldCheck,
  Sparkles, Star, Sun, TentTree, Users, Utensils, WalletCards,
} from 'lucide-react';
import Reveal from '../components/Reveal';
import FavoriteButton from '../components/FavoriteButton';
import { destinationSlug } from '../data/destinationGuides';
import { tourismImageManifest } from '../data/tourismImages.generated';
import './Tourism.css';
import './TourismDirectory.css';

const KenyaTourMap = lazy(() => import('../components/tourism/KenyaTourMap'));

type Destination = {
  name: string; county: string; category: string; months: string;
  duration: string; budget: string; rating: string; note: string;
  image: string; travel: string; fee: string; lat: number; lng: number;
};

const IMAGES = {
  safari: tourismImageManifest['maasai-mara'].hero!,
  beach: tourismImageManifest['diani-beach'].hero!,
  kenya: tourismImageManifest['lamu-old-town'].hero!,
  mountain: tourismImageManifest['mount-kenya'].hero!,
  city: 'https://images.unsplash.com/photo-1741991110666-88115e724741?auto=format&fit=crop&w=1400&q=82',
  elephant: tourismImageManifest.amboseli.hero!,
};

const DESTINATIONS: Destination[] = [
  { name: 'Maasai Mara', county: 'Narok', category: 'Safari', months: 'Jul to Oct', duration: '3 to 5 days', budget: '$$$', rating: '4.9', image: IMAGES.safari, note: 'Big cat country, open savannah and the Great Migration.', travel: '5 hr 30 min by road', fee: 'From US$100', lat: -1.4934, lng: 35.1439 },
  { name: 'Diani Beach', county: 'Kwale', category: 'Beach', months: 'Jan to Mar', duration: '3 to 6 days', budget: '$$', rating: '4.8', image: IMAGES.beach, note: 'White sand, coral gardens and warm Indian Ocean mornings.', travel: '1 hr 15 min flight', fee: 'Public beach access', lat: -4.2793, lng: 39.5947 },
  { name: 'Amboseli', county: 'Kajiado', category: 'Safari', months: 'Jun to Oct', duration: '2 to 3 days', budget: '$$', rating: '4.8', image: IMAGES.elephant, note: 'Elephant herds beneath the vast silhouette of Kilimanjaro.', travel: '4 hr by road', fee: 'From US$90', lat: -2.6527, lng: 37.2606 },
  { name: 'Mount Kenya', county: 'Laikipia', category: 'Adventure', months: 'Jan to Feb', duration: '4 to 6 days', budget: '$$', rating: '4.7', image: IMAGES.mountain, note: 'Alpine lakes, high-altitude trails and dramatic equatorial peaks.', travel: '3 hr 30 min by road', fee: 'From US$52', lat: -0.1521, lng: 37.3084 },
  { name: 'Nairobi', county: 'Nairobi', category: 'City', months: 'Year-round', duration: '2 to 3 days', budget: '$$', rating: '4.6', image: IMAGES.city, note: 'Food, art, history and a national park at the edge of the city.', travel: 'You are here', fee: 'Varies by attraction', lat: -1.2864, lng: 36.8172 },
  { name: 'Lamu Old Town', county: 'Lamu', category: 'Culture', months: 'Nov to Mar', duration: '3 to 4 days', budget: '$$', rating: '4.7', image: IMAGES.kenya, note: 'Swahili heritage, dhow sunsets and car-free lanes by the sea.', travel: '1 hr 20 min flight', fee: 'Old Town is free', lat: -2.2717, lng: 40.9020 },
];

const SEASONS = [
  ['Jan â€“ Feb', 'Warm and clear', 'Excellent for beaches, hiking and wildlife around water sources.', '24â€“31Â°C'],
  ['Mar â€“ May', 'Green season', 'Long rains, fewer visitors, vivid landscapes and better-value stays.', '21â€“28Â°C'],
  ['Jun â€“ Oct', 'Classic safari', 'Dry days, migration season and the most reliable game viewing.', '18â€“27Â°C'],
  ['Nov â€“ Dec', 'Short rains', 'Fresh scenery, bird migration and pockets of shoulder-season value.', '22â€“29Â°C'],
];

const Tourism = () => {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [maxBudget, setMaxBudget] = useState(3);
  const [minRating, setMinRating] = useState(0);
  const [sort, setSort] = useState<'recommended' | 'rating' | 'name'>('recommended');
  const [people, setPeople] = useState(2);
  const [days, setDays] = useState(7);
  const [comfort, setComfort] = useState<'budget' | 'standard' | 'luxury'>('standard');
  const [selected, setSelected] = useState(DESTINATIONS[0]);

const filtered = useMemo(() => DESTINATIONS
    .filter((item) =>
      (category === 'All' || item.category === category) &&
      item.budget.length <= maxBudget &&
      Number(item.rating) >= minRating &&
      `${item.name} ${item.county} ${item.category}`.toLowerCase().includes(query.toLowerCase())
    )
    .sort((a, b) => sort === 'rating'
      ? Number(b.rating) - Number(a.rating)
      : sort === 'name' ? a.name.localeCompare(b.name) : 0
    ), [category, maxBudget, minRating, query, sort]);

  const daily = comfort === 'budget' ? 10500 : comfort === 'standard' ? 24500 : 62000;
  const stay = daily * days * people;
  const transport = Math.round((comfort === 'luxury' ? 21000 : 9000) * people + days * 1800);
  const activities = Math.round(days * people * (comfort === 'budget' ? 3000 : comfort === 'standard' ? 6500 : 13500));
  const total = stay + transport + activities;
  const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <main className="tourism">
      <section className="tourism-hero" aria-labelledby="tourism-title">
        <img className="tourism-hero__image" src={IMAGES.safari} alt="Safari landscape in Kenya at golden hour" />
        <div className="tourism-hero__wash" aria-hidden="true" />
        <div className="tourism-hero__content">
          <div className="tourism-hero__place"><MapPin size={16} /> Kenya, East Africa</div>
          <h1 id="tourism-title">Discover the magic of Kenya</h1>
          <p>Wildlife safaris, Indian Ocean shores, mountain trails and cities alive with culture. Plan it all with one informed guide.</p>
          <div className="tourism-hero__actions">
            <button className="tour-btn tour-btn--primary" onClick={() => go('destinations')}>Start exploring <ArrowRight size={18} /></button>
            <button className="tour-btn tour-btn--quiet" onClick={() => go('planner')}>Build my trip <Sparkles size={18} /></button>
          </div>
        </div>
        <form className="tour-search" onSubmit={(event) => { event.preventDefault(); go('destinations'); }}>
          <Search size={21} />
          <label htmlFor="tour-search" className="sr-only">Search Kenya tourism guides</label>
          <input id="tour-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search destinations, parks, beaches or experiences" />
          <button type="submit">Search</button>
        </form>
      </section>

      <nav className="tourism-jump" aria-label="Tourism page sections">
        {[['destinations', 'Places'], ['map-guide', 'Map guide'], ['budget', 'Budget'], ['seasons', 'Best time'], ['itineraries', 'Itineraries'], ['essentials', 'Essentials']].map(([id, label]) =>
          <button key={id} onClick={() => go(id)}>{label}</button>)}
      </nav>

      <section className="tourism-intro">
        <div><span>KE</span><p>One country. Countless journeys.</p></div>
        <dl>
          <div><dt>Ideal first trip</dt><dd>7â€“10 days</dd></div>
          <div><dt>Daily budget</dt><dd>From KSh 10,500</dd></div>
          <div><dt>Languages</dt><dd>Swahili, English</dd></div>
          <div><dt>Currency</dt><dd>Kenyan shilling</dd></div>
        </dl>
      </section>

      <section id="destinations" className="tour-section">
        <Reveal><header className="tour-section__head"><div><p className="tour-label">Choose your Kenya</p><h2>Find the journey that fits.</h2></div><p>Search destinations, narrow the experience and compare the practical details before opening the map.</p></header></Reveal>
        <div className="tour-directory">
          <aside className="tour-directory__filters" aria-label="Destination filters">
            <div className="tour-directory__filter-head"><div><span>Trip finder</span><h3>Explore Kenya</h3></div><Compass size={22} /></div>
            <form onSubmit={(event) => event.preventDefault()}>
              <label htmlFor="directory-search">Destination or county</label>
              <div className="tour-directory__search"><Search size={18} /><input id="directory-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Maasai Mara, Kwaleâ€¦" /></div>
              <label htmlFor="directory-category">Experience</label>
              <select id="directory-category" value={category} onChange={(event) => setCategory(event.target.value)}>
                {['All', 'Safari', 'Beach', 'Adventure', 'City', 'Culture'].map((item) => <option key={item} value={item}>{item === 'All' ? 'All experiences' : item}</option>)}
              </select>
              <label htmlFor="directory-budget">Maximum budget level <strong>{'$'.repeat(maxBudget)}</strong></label>
              <input id="directory-budget" type="range" min="1" max="3" value={maxBudget} onChange={(event) => setMaxBudget(Number(event.target.value))} />
              <fieldset>
                <legend>Minimum guest rating</legend>
                <div className="tour-directory__ratings">
                  {[0, 4.7, 4.8].map((rating) => <button type="button" key={rating} className={minRating === rating ? 'is-active' : ''} onClick={() => setMinRating(rating)}>{rating === 0 ? 'Any' : <><Star size={13} fill="currentColor" /> {rating}+</>}</button>)}
                </div>
              </fieldset>
              <button type="button" className="tour-directory__clear" onClick={() => { setQuery(''); setCategory('All'); setMaxBudget(3); setMinRating(0); setSort('recommended'); }}>Clear all filters</button>
            </form>
          </aside>

          <div className="tour-directory__results">
            <div className="tour-directory__toolbar">
              <p><strong>{filtered.length}</strong> destinations found</p>
              <label htmlFor="destination-sort">Sort by <select id="destination-sort" value={sort} onChange={(event) => setSort(event.target.value as typeof sort)}><option value="recommended">Recommended</option><option value="rating">Guest rating</option><option value="name">Name</option></select></label>
            </div>
            <div className="destination-grid">
              {filtered.map((item, index) => (
                <Reveal key={item.name} delay={(index % 2) * .05}>
                  <article className="destination-card">
                    <div className="destination-card__media">
                      <Link className="destination-card__image-link" to={`/destinations/${destinationSlug(item.name)}`} aria-label={`Open the ${item.name} travel guide`}><img src={item.image} alt={`${item.name}, Kenya`} loading="lazy" decoding="async" /></Link>
                      <FavoriteButton fav={{ source: 'destination', key: destinationSlug(item.name), name: item.name, image: item.image }} size={19} /><span>{item.category}</span>
                    </div>
                    <div className="destination-card__body">
                      <div className="destination-card__title"><div><p><MapPin size={13} /> {item.county} County</p><h3><Link to={`/destinations/${destinationSlug(item.name)}`}>{item.name}</Link></h3></div><span><Star size={14} fill="currentColor" /> {item.rating}</span></div>
                      <Link className="destination-card__safe-link" to={`/destinations/${destinationSlug(item.name)}`} aria-label={`Read the ${item.name} destination guide`}>

                        <p>{item.note}</p>

                        <dl><div><dt>Best time</dt><dd>{item.months}</dd></div><div><dt>Stay</dt><dd>{item.duration}</dd></div><div><dt>Budget</dt><dd>{item.budget}</dd></div></dl>

                      </Link>
                      <button className="destination-card__link" onClick={() => { setSelected(item); go('map-guide'); }}>Discover destination <ChevronRight size={17} /></button>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
            {!filtered.length && <div className="tour-empty"><Compass size={28} /><h3>No destinations match</h3><p>Broaden the budget, rating or experience filters to see more of Kenya.</p><button onClick={() => { setQuery(''); setCategory('All'); setMaxBudget(3); setMinRating(0); }}>Reset search</button></div>}
          </div>
        </div>
      </section>

      <section id="map-guide" className="tour-map">
        <div className="tour-map__visual">
          <Suspense fallback={<div className="kenya-map-loading">Loading the Kenya mapâ€¦</div>}>
            <KenyaTourMap destinations={DESTINATIONS} selected={selected} onSelect={(destination) => { const match = DESTINATIONS.find((item) => item.name === destination.name); if (match) setSelected(match); }} />
          </Suspense>
        </div>
        <div className="tour-map__guide">
          <p className="tour-label">Interactive route finder</p><h2>{selected.name}</h2><p>{selected.note}</p>
          <div className="tour-map__weather"><CloudSun size={27} /><span><strong>26Â°C</strong> Pleasant, light breeze</span></div>
          <dl><div><dt>From Nairobi</dt><dd>{selected.travel}</dd></div><div><dt>Entry guide</dt><dd>{selected.fee}</dd></div><div><dt>Best season</dt><dd>{selected.months}</dd></div><div><dt>Recommended stay</dt><dd>{selected.duration}</dd></div></dl>
          <div className="tour-map__nearby"><span><Hotel size={16} /> 18 stays</span><span><Utensils size={16} /> 12 restaurants</span><span><Compass size={16} /> 9 experiences</span></div>
          <p className="tour-note"><Info size={15} /> Fees are planning estimates. Confirm official rates before travel.</p>
        </div>
      </section>
      <section id="budget" className="tour-section">
        <header className="tour-section__head tour-section__head--stack"><p className="tour-label">Trip budget planner</p><h2>Know the shape of your trip before you book.</h2><p>Adjust your travel party, duration and comfort level for a practical Kenya estimate.</p></header>
        <div className="budget-layout">
          <div className="budget-controls">
            <label>Travelers <strong>{people}</strong><input type="range" min="1" max="10" value={people} onChange={(e) => setPeople(Number(e.target.value))} /></label>
            <label>Number of days <strong>{days}</strong><input type="range" min="3" max="21" value={days} onChange={(e) => setDays(Number(e.target.value))} /></label>
            <fieldset><legend>Travel style</legend><div className="comfort-switch">{(['budget', 'standard', 'luxury'] as const).map((item) => <button type="button" key={item} className={comfort === item ? 'is-active' : ''} onClick={() => setComfort(item)}>{item}</button>)}</div></fieldset>
            <div className="budget-includes">{['Accommodation and meals', 'Local transport allowance', 'Activities and park fees', '10% planning cushion'].map((item) => <span key={item}><Check size={15} /> {item}</span>)}</div>
          </div>
          <div className="budget-result" aria-live="polite"><span>Estimated trip total</span><strong>KSh {total.toLocaleString()}</strong><small>About KSh {Math.round(total / people / days).toLocaleString()} per person, per day</small>
            <dl><div><dt>Stay and food</dt><dd>KSh {stay.toLocaleString()}</dd></div><div><dt>Transport</dt><dd>KSh {transport.toLocaleString()}</dd></div><div><dt>Experiences</dt><dd>KSh {activities.toLocaleString()}</dd></div></dl>
            <button onClick={() => go('planner')}>Turn this into a trip <ArrowRight size={17} /></button>
          </div>
        </div>
      </section>

      <section id="seasons" className="tour-seasons">
        <div className="tour-seasons__copy"><Sun size={34} /><p className="tour-label">Best time to visit</p><h2>Kenya is always in season. The experience changes.</h2><p>Dry months bring classic game viewing. Green months bring dramatic skies, newborn wildlife and quieter lodges.</p></div>
        <div className="season-list">{SEASONS.map((season, i) => <article key={season[0]} className={i === 2 ? 'is-featured' : ''}><span>{season[0]}</span><strong>{season[1]}</strong><p>{season[2]}</p><small>{season[3]}</small></article>)}</div>
      </section>

      <section id="itineraries" className="tour-section">
        <header className="tour-section__head"><div><p className="tour-label">Ready-made routes</p><h2>Start with a journey that already works.</h2></div><p>Balanced pacing, realistic transfers and space for unplanned discoveries.</p></header>
        <div className="itinerary-list">
          {[['3 days', 'Nairobi in focus', 'Nairobi National Park â€¢ Karen â€¢ City culture', 'From KSh 48,000', IMAGES.city], ['5 days', 'The safari classic', 'Nairobi â€¢ Lake Naivasha â€¢ Maasai Mara', 'From KSh 128,000', IMAGES.safari], ['10 days', 'Bush to beach', 'Amboseli â€¢ Tsavo â€¢ Diani Beach', 'From KSh 265,000', IMAGES.beach]].map((trip) =>
            <article key={trip[1]}><img src={trip[4]} alt="" loading="lazy" decoding="async" /><div><span>{trip[0]}</span><h3>{trip[1]}</h3><p>{trip[2]}</p></div><div className="itinerary-list__price"><small>Estimate</small><strong>{trip[3]}</strong><button onClick={() => go('planner')}>Customize <ChevronRight size={17} /></button></div></article>)}
        </div>
      </section>

      <section className="tour-collections">
        <article><img src={IMAGES.elephant} alt="Elephants on a Kenyan safari" loading="lazy" decoding="async" /><div><TentTree size={25} /><h2>The safari field guide</h2><p>Big Five sightings, game-drive etiquette, migration timing, photography and conservation.</p><button onClick={() => { setCategory('Safari'); go('destinations'); }}>Explore safaris <ArrowRight size={17} /></button></div></article>
        <article><img src={IMAGES.beach} alt="Turquoise water at the Kenyan coast" loading="lazy" decoding="async" /><div><Sun size={25} /><h2>The coast, unhurried</h2><p>Diani, Watamu, Malindi, Tiwi and Lamu, with water sports, food and family guidance.</p><button onClick={() => { setCategory('Beach'); go('destinations'); }}>Explore the coast <ArrowRight size={17} /></button></div></article>
      </section>

      <section id="essentials" className="tour-section">
        <header className="tour-section__head tour-section__head--stack"><p className="tour-label">Before you go</p><h2>The practical guide you will actually use.</h2></header>
        <div className="essential-grid">
          {[
            [Plane, 'Entry and health', 'Check eTA eligibility, passport validity, travel insurance and current vaccination advice.', 'entry-and-health'],
            [ShieldCheck, 'Safety', 'Use trusted transport, follow park guidance and keep emergency contacts available offline.', 'safety'],
            [WalletCards, 'Money', 'Cards and mobile money are common in cities. Carry shillings for markets and rural stops.', 'money'],
            [Map, 'Getting around', 'Combine domestic flights, SGR rail, transfers and ride-hailing based on distance and comfort.', 'getting-around'],
            [CloudSun, 'What to pack', 'Light layers, sun protection, a reusable bottle, closed shoes and a warm layer for early drives.', 'what-to-pack'],
            [Users, 'Travel styles', 'Family, couple, solo, accessible, budget and luxury routes can all use the same guide.', 'travel-styles'],
          ].map(([Icon, title, text, slug]) => {
            const EssentialIcon = Icon as typeof Plane;
            return <article key={String(title)}><EssentialIcon size={24} /><h3>{String(title)}</h3><p>{String(text)}</p><Link to={`/tourism/guides/${slug}`}>Open guide <ChevronRight size={16} /></Link></article>;
          })}
        </div>
        <aside className="safety-strip"><ShieldCheck size={27} /><div><strong>Travel with current information</strong><p>Rules, fees, weather and advisories can change. WorldSphere marks estimates and points you to official confirmation.</p></div><span>Emergency: 999 / 112</span></aside>
      </section>

      <section id="planner" className="tour-planner">
        <div className="tour-planner__copy"><Sparkles size={32} /><h2>Your Kenya, shaped around you.</h2><p>Tell the WorldSphere AI your dates, budget, group and interests. It will turn this guide into a daily plan with realistic transfers and estimated costs.</p><div><span><CalendarDays size={16} /> Daily schedule</span><span><Hotel size={16} /> Stay suggestions</span><span><WalletCards size={16} /> Budget breakdown</span></div></div>
        <div className="tour-planner__form"><label htmlFor="trip-request">What should your Kenya trip feel like?</label><textarea id="trip-request" defaultValue={`Plan a ${days}-day ${comfort} Kenya trip for ${people} people. We love wildlife, local food and scenic places.`} /><Link to="/ai/tour-guide">Build with AI Explorer <Sparkles size={18} /></Link><small>AI suggestions are a starting point. Verify bookings, entry rules and advisories.</small></div>
      </section>
    </main>
  );
};

export default Tourism;