import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface Props {
  title: string;
  blurb: string;
  /** Which build phase delivers the real surface — shown as a small note. */
  note?: string;
}

/**
 * On-brand placeholder for IA surfaces that land in a later redesign phase.
 * Keeps the new navigation honest (no dead links / NotFound) while the real
 * pages are built out.
 */
const ComingSoon = ({ title, blurb, note }: Props) => (
  <section className="page-shell">
    <div className="container">
      <div className="coming">
        <p className="kicker">WORLDSPHERE</p>
        <h1 className="coming__title">{title}</h1>
        <p className="coming__blurb measure">{blurb}</p>
        {note && <p className="coming__note">{note}</p>}
        <Link to="/" className="btn btn-solar">
          <ArrowLeft size={16} strokeWidth={2} /> Back to the surface
        </Link>
      </div>
    </div>
  </section>
);

export default ComingSoon;
