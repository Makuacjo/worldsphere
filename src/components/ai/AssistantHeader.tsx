import { Compass, Leaf, Menu, Plus } from 'lucide-react';
import type { AssistantPresentation } from './config';

interface Props {
  config: AssistantPresentation;
  onNewChat: () => void;
  onToggleSidebar: () => void;
}

const AssistantHeader = ({ config, onNewChat, onToggleSidebar }: Props) => {
  const Icon = config.type === 'SPECIES' ? Leaf : Compass;
  return (
    <header className="assistant-header">
      <button className="assistant-icon-button assistant-sidebar-toggle" onClick={onToggleSidebar} aria-label="Open conversation history"><Menu size={19} /></button>
      <span className="assistant-header__mark" style={{ color: config.accent }}><Icon size={22} /></span>
      <div><strong>{config.shortName}</strong><small>Powered by WorldSphere AI</small></div>
      <button className="assistant-new" onClick={onNewChat}><Plus size={17} /> New chat</button>
    </header>
  );
};

export default AssistantHeader;
