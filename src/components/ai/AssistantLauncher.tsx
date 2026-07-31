import { Link } from 'react-router-dom';
import { ArrowRight, Compass, Leaf } from 'lucide-react';

const AssistantLauncher = () => (
  <div className="assistant-launcher" aria-label="Choose an AI assistant">
    <Link to="/ai/species" className="assistant-choice assistant-choice--species">
      <span className="assistant-choice__icon"><Leaf size={25} /></span>
      <span><strong>Species AI</strong><small>Discover wildlife, plants, habitats, and conservation.</small></span>
      <ArrowRight size={19} />
    </Link>
    <Link to="/ai/tour-guide" className="assistant-choice assistant-choice--tour">
      <span className="assistant-choice__icon"><Compass size={25} /></span>
      <span><strong>Kenya Tour Guide AI</strong><small>Plan trips, estimate budgets, discover destinations, and build itineraries.</small></span>
      <ArrowRight size={19} />
    </Link>
  </div>
);

export default AssistantLauncher;
