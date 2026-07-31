import { ArrowLeft, ArrowUpRight, Check, CircleAlert, Clock3, MapPin, ShieldCheck } from 'lucide-react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { KENYA_TRAVEL_GUIDES } from '../data/kenyaTravelGuides';
import './TourismGuide.css';

const TourismGuide = () => {
  const { slug = '' } = useParams();
  const guide = KENYA_TRAVEL_GUIDES[slug];

  if (!guide) return <Navigate to="/tourism#essentials" replace />;

  return (
    <main className="kenya-guide">
      <header className="kenya-guide__hero">
        <div className="kenya-guide__hero-inner">
          <Link to="/tourism#essentials" className="kenya-guide__back">
            <ArrowLeft size={17} /> All Kenya essentials
          </Link>
          <div className="kenya-guide__hero-grid">
            <div>
              <p className="kenya-guide__eyebrow">{guide.eyebrow}</p>
              <h1>{guide.title}</h1>
              <p className="kenya-guide__summary">{guide.summary}</p>
            </div>
            <aside>
              <Clock3 size={20} />
              <span>Research reviewed</span>
              <strong>{guide.updated}</strong>
            </aside>
          </div>
        </div>
      </header>

      <div className="kenya-guide__layout">
        <article className="kenya-guide__content">
          <section className="kenya-guide__answer" aria-labelledby="quick-answer">
            <MapPin size={23} />
            <div>
              <p id="quick-answer">At a glance</p>
              <strong>{guide.quickAnswer}</strong>
            </div>
          </section>

          {guide.sections.map((section, index) => (
            <section className="kenya-guide__section" key={section.title}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <div>
                <h2>{section.title}</h2>
                {section.intro && <p>{section.intro}</p>}
                <ul>
                  {section.items.map((item) => <li key={item}><Check size={17} aria-hidden="true" /><span>{item}</span></li>)}
                </ul>
              </div>
            </section>
          ))}

          <section className="kenya-guide__sources">
            <p className="kenya-guide__eyebrow">Verify before you travel</p>
            <h2>Official and authoritative sources</h2>
            <p>Rules, advisories, timetables and health requirements can change. Use these links for the latest confirmation.</p>
            <div>
              {guide.sources.map((source) => (
                <a href={source.url} target="_blank" rel="noreferrer" key={source.url}>
                  <span><small>{source.organization}</small><strong>{source.label}</strong></span>
                  <ArrowUpRight size={18} />
                </a>
              ))}
            </div>
          </section>
        </article>

        <aside className="kenya-guide__rail">
          <section>
            <ShieldCheck size={24} />
            <h2>Travel checklist</h2>
            <ul>{guide.checklist.map((item) => <li key={item}><Check size={15} />{item}</li>)}</ul>
          </section>
          <section className="kenya-guide__notice">
            <CircleAlert size={20} />
            <div>
              <strong>Important</strong>
              <p>This is general travel information, not legal or medical advice. Confirm requirements for your nationality, health and exact route.</p>
            </div>
          </section>
          <Link to="/ai/tour-guide" className="kenya-guide__planner">Plan this with Kenya Tour Guide AI <ArrowUpRight size={18} /></Link>
        </aside>
      </div>
    </main>
  );
};

export default TourismGuide;
