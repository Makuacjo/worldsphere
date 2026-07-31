import { Check, Copy, RotateCcw, ThumbsDown, ThumbsUp } from 'lucide-react';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import type { ChatMessage as Message } from '../../services/assistantApi';

interface Props {
  message: Message;
  streaming?: boolean;
  onRetry?: () => void;
  onFeedback?: (rating: -1 | 1) => void;
}

const ChatMessage = ({ message, streaming, onRetry, onFeedback }: Props) => {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };
  return (
    <article className={`chat-message chat-message--${message.role}`}>
      <div className="chat-message__role">{message.role === 'user' ? 'You' : 'WorldSphere'}</div>
      <div className="chat-message__content"><ReactMarkdown>{message.content}</ReactMarkdown>{streaming && <span className="ai-caret" />}</div>
      {message.role === 'assistant' && !streaming && (
        <div className="chat-message__actions">
          <button onClick={copy} aria-label="Copy response">{copied ? <Check size={15} /> : <Copy size={15} />}</button>
          {onRetry && <button onClick={onRetry} aria-label="Retry response"><RotateCcw size={15} /></button>}
          {message.id && onFeedback && <><button onClick={() => onFeedback(1)} aria-label="Helpful response"><ThumbsUp size={15} /></button><button onClick={() => onFeedback(-1)} aria-label="Unhelpful response"><ThumbsDown size={15} /></button></>}
        </div>
      )}
    </article>
  );
};

export default ChatMessage;
