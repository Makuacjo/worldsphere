interface Props {
  prompts: string[];
  onSelect: (prompt: string) => void;
  disabled?: boolean;
}

const SuggestedPrompts = ({ prompts, onSelect, disabled }: Props) => (
  <div className="assistant-suggestions" aria-label="Suggested questions">
    {prompts.map((prompt) => <button key={prompt} onClick={() => onSelect(prompt)} disabled={disabled}>{prompt}</button>)}
  </div>
);

export default SuggestedPrompts;
