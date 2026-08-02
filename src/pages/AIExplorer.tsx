import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import {
  Sparkles, ArrowRight, ShieldAlert, Leaf, Globe2, LineChart, Compass, FlaskConical, Loader2,
} from 'lucide-react';
import RiskPredictorPanel from '../components/RiskPredictorPanel';
import AssistantLauncher from '../components/ai/AssistantLauncher';
import '../components/ai/assistant.css';
import { askStream, AiError } from '../services/ai';

const SUGGESTED_QUESTIONS = [
  'Why are amphibians declining worldwide?',
  'What makes a keystone species?',
  'How does coral bleaching happen?',
  'Which animals are ecosystem engineers?',
];

type Topic =
  | { icon: typeof ShieldAlert; title: string; blurb: string; to: string }
  | { icon: typeof ShieldAlert; title: string; blurb: string; action: 'predictor' };

const TOPICS: Topic[] = [
  { icon: ShieldAlert, title: 'Predict conservation risk', blurb: 'Estimate a species’ IUCN risk category from its traits.', action: 'predictor' },
  { icon: Leaf, title: 'Find endangered species', blurb: 'Browse the wildlife most at risk across the catalog.', to: '/stories?category=animal' },
  { icon: Globe2, title: 'Explore a region', blurb: 'Spin the globe and surface life by continent.', to: '/maps' },
  { icon: LineChart, title: 'Population & climate trends', blurb: 'See what the conservation model has learned.', to: '/research' },
  { icon: Compass, title: 'Roam the atlas', blurb: 'Search hundreds of millions of real records.', to: '/explore' },
  { icon: FlaskConical, title: 'Research assistant', blurb: 'Dive into the data behind every prediction.', to: '/research' },
];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
};

const AIExplorer = () => {
  const [query, setQuery] = useState('');
  const [answer, setAnswer] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState('');
  const predictorRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<AbortController | null>(null);
  const inFlightRef = useRef(false);

  useEffect(() => () => requestRef.current?.abort(), []);

  const ask = async (q: string) => {
    const question = q.trim();
    if (!question || streaming || inFlightRef.current) return;
    inFlightRef.current = true;
    const controller = new AbortController();
    requestRef.current = controller;
    setQuery(question);
    setAnswer('');
    setError('');
    setStreaming(true);
    try {
      for await (const chunk of askStream(question, controller.signal)) {
        setAnswer(prev => prev + chunk);
      }
    } catch (err) {
      if (!(err instanceof DOMException && err.name === 'AbortError')) {
        setError(err instanceof AiError ? err.message : 'Something went wrong asking the AI.');
      }
    } finally {
      inFlightRef.current = false;
      requestRef.current = null;
      setStreaming(false);
    }
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    ask(query);
  };

  const scrollToPredictor = () =>
    predictorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const showPanel = streaming || answer || error;

  return (
    <section className="page-shell">
      <div className="container">
        <header className="ai-head">
          <p className="kicker">AI Explorer</p>
          <h1 className="ai-title">Ask the planet.</h1>
          <p className="ai-lede measure">
            A conversation with a field naturalist, powered through OpenRouter. Ask about
            any species, habitat, or conservation question — then dive into the
            model to predict a species' future.
          </p>

          <AssistantLauncher />

          <form className="ai-ask" onSubmit={onSubmit} role="search">
            <Sparkles size={20} strokeWidth={1.75} className="ai-ask__icon" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask the planet anything — “Why do sea otters matter?”"
              aria-label="Ask the AI naturalist"
            />
            <button type="submit" className="btn-solar ai-ask__btn" disabled={streaming}>
              {streaming ? <Loader2 size={16} className="spin" /> : <>Ask <ArrowRight size={16} strokeWidth={2} /></>}
            </button>
          </form>

          <div className="stories__filters" style={{ marginTop: '1rem' }}>
            {SUGGESTED_QUESTIONS.map(q => (
              <button key={q} type="button" className="chip chip--sm" onClick={() => ask(q)} disabled={streaming}>
                {q}
              </button>
            ))}
          </div>

          {showPanel && (
            <div className="ai-answer">
              {error ? (
                <p className="ai-answer__error">{error}</p>
              ) : (
                <div className="ai-answer__body markdown-content">
                  <ReactMarkdown>{answer}</ReactMarkdown>
                  {streaming && <span className="ai-caret" aria-hidden="true" />}
                </div>
              )}
            </div>
          )}
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
