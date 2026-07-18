import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sparkles, ArrowRight, ShieldAlert, Leaf, Globe2, LineChart, Compass, FlaskConical,
} from 'lucide-react';
import RiskPredictorPanel from '../components/RiskPredictorPanel';

const PLACEHOLDERS = [
  'Search the atlas — “bengal tiger”, “coral reef”, “ancient trees”…',
  'Find a species by name, habitat, or region…',
  'Try “elephant”, “freshwater”, or “endangered”…',
];

type Topic =
  | { icon: typeof ShieldAlert; title: string; blurb: string; to: string }
  | { icon: typeof ShieldAlert; title: string; blurb: string; action: 'predictor' };

const TOPICS: Topic[] = [
  { icon: ShieldAlert, title: 'Predict conservation risk', blurb: 'Estimate a species’ IUCN risk category from its traits.', action: 'predictor' },
  { icon: Leaf, title: 'Find endangered species', blurb: 'Browse the wildlife most at risk across the catalog.', to: '/stories?category=animal' },
  { icon: Globe2, title: 'Explore a region', blurb: 'Spin the globe and surface life by continent.', to: '/maps' },
  { icon: LineChart, title: 'Population & climate trends', blurb: 'See what the conservation model has learned.', to: '/research' },
  { icon: Compass, title: 'Roam the atlas', blurb: 'Start an open-ended expedition through Earth.', to: '/explore' },
  { icon: FlaskConical, title: 'Research assistant', blurb: 'Dive into the data behind every prediction.', to: '/research' },
];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
};

const AIExplorer = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [ph, setPh] = useState(0);
  const predictorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = setInterval(() => setPh(p => (p + 1) % PLACEHOLDERS.length), 3600);
    return () => clearInterval(id);
  }, []);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (q) navigate(`/search?q=${encodeURIComponent(q)}`);
  };

  const scrollToPredictor = () =>
    predictorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  return (
    <section className="page-shell">
      <div className="container">
        <header className="ai-head">
          <p className="kicker">AI Explorer</p>
          <h1 className="ai-title">Ask the planet</h1>
          <p className="ai-lede measure">
            Explore Earth through a conversational lens — search the living atlas,
            then dive into the conservation model to predict a species' future.
          </p>

          <form className="ai-ask" onSubmit={onSubmit} role="search">
            <Sparkles size={20} strokeWidth={1.75} className="ai-ask__icon" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={PLACEHOLDERS[ph]}
              aria-label="Ask or search the atlas"
            />
            <button type="submit" className="btn-solar ai-ask__btn">
              Explore <ArrowRight size={16} strokeWidth={2} />
            </button>
          </form>
          <p className="ai-note">
            Atlas search is live. Region, risk, and research flows connect to the
            conservation ml-service.
          </p>
        </header>

        <motion.div
          className="ai-topics"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-10% 0px' }}
        >
          {TOPICS.map((topic) => {
            const Icon = topic.icon;
            const inner = (
              <>
                <span className="topic__icon"><Icon size={22} strokeWidth={1.75} /></span>
                <span className="topic__title">{topic.title}</span>
                <span className="topic__blurb">{topic.blurb}</span>
                <span className="topic__more"><ArrowRight size={16} strokeWidth={2} /></span>
              </>
            );
            return 'action' in topic ? (
              <motion.button key={topic.title} variants={item} className="topic" onClick={scrollToPredictor} type="button">
                {inner}
              </motion.button>
            ) : (
              <motion.div key={topic.title} variants={item}>
                <Link to={topic.to} className="topic">{inner}</Link>
              </motion.div>
            );
          })}
        </motion.div>

        <div className="ai-predictor" ref={predictorRef}>
          <div className="ai-predictor__head">
            <div>
              <p className="kicker">Live · ml-service model</p>
              <h2 className="ai-predictor__title">Conservation Risk Explorer</h2>
            </div>
          </div>
          <RiskPredictorPanel />
        </div>
      </div>
    </section>
  );
};

export default AIExplorer;
