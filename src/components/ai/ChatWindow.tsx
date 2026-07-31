import { useEffect, useRef } from 'react';
import { Compass, Leaf } from 'lucide-react';
import type { ChatMessage as Message } from '../../services/assistantApi';
import type { AssistantPresentation } from './config';
import ChatMessage from './ChatMessage';
import SuggestedPrompts from './SuggestedPrompts';
import TripPlanResult from './TripPlanResult';

interface Props {
  config: AssistantPresentation;
  messages: Message[];
  streaming: boolean;
  onPrompt: (prompt: string) => void;
  onRetry: () => void;
  onFeedback: (messageId: string, rating: -1 | 1) => void;
}

const ChatWindow = ({ config, messages, streaming, onPrompt, onRetry, onFeedback }: Props) => {
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const scroller = endRef.current?.closest<HTMLElement>('.assistant-scroll');
      if (!scroller) return;
      scroller.scrollTo({
        top: scroller.scrollHeight,
        behavior: streaming ? 'auto' : 'smooth',
      });
    });
    return () => { window.cancelAnimationFrame(frame); };
  }, [messages, streaming]);
  const Icon = config.type === 'SPECIES' ? Leaf : Compass;
  if (!messages.length) return (
    <div className="assistant-empty">
      <span style={{ color: config.accent }}><Icon size={34} /></span>
      <h1>{config.name}</h1><p>{config.welcomeMessage}</p>
      <SuggestedPrompts prompts={config.suggestedQuestions} onSelect={onPrompt} disabled={streaming} />
    </div>
  );
  return (
    <div className="chat-window" aria-live="polite">
      {messages.map((message, index) => {
        const content = <ChatMessage key={message.id || index} message={message} streaming={streaming && index === messages.length - 1 && message.role === 'assistant'} onRetry={message.role === 'assistant' && index === messages.length - 1 ? onRetry : undefined} onFeedback={message.id ? (rating) => onFeedback(message.id!, rating) : undefined} />;
        return config.type === 'TOUR_GUIDE' && message.role === 'assistant' ? <TripPlanResult key={message.id || index}>{content}</TripPlanResult> : content;
      })}
      <div ref={endRef} />
    </div>
  );
};

export default ChatWindow;
