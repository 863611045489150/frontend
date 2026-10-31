import React, { useState } from 'react';
import { HelpCircle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { ClarificationData } from '../../types';

interface ClarificationPromptProps {
  clarification: ClarificationData;
  onSelectOption: (option: string) => void;
  onSubmitCustom: (custom: string) => void;
  disabled?: boolean;
}

export const ClarificationPrompt: React.FC<ClarificationPromptProps> = ({
  clarification,
  onSelectOption,
  onSubmitCustom,
  disabled = false,
}) => {
  const [selected, setSelected] = useState<string>(clarification.selectedOption || '');
  const [customText, setCustomText] = useState<string>(clarification.customInput || '');
  const [isTypingCustom, setIsTypingCustom] = useState<boolean>(false);

  const handleSubmit = () => {
    if (isTypingCustom && customText.trim()) {
      onSubmitCustom(customText.trim());
    } else if (selected) {
      onSelectOption(selected);
    }
  };

  if (clarification.isAnswered) {
    return (
      <div className="my-3 p-3.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[13px] flex items-start gap-3">
        <CheckCircle2 className="w-4 h-4 text-[var(--accent-ember)] mt-0.5 shrink-0" />
        <div className="space-y-1">
          <div className="text-[var(--text-secondary)] font-medium">
            Clarified Parameter: <span className="text-[var(--text-primary)] font-normal">{clarification.question}</span>
          </div>
          <div className="text-[var(--accent-ember)] font-medium text-[13.5px]">
            Selected: {clarification.selectedOption || clarification.customInput}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="my-4 rounded-xl border border-[var(--accent-ember)]/40 bg-[var(--bg-surface)] p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 rounded-full bg-[var(--accent-ember-subtle)] flex items-center justify-center text-[var(--accent-ember)]">
          <HelpCircle className="w-3.5 h-3.5" />
        </div>
        <span className="text-[11px] font-mono font-medium uppercase tracking-wider text-[var(--accent-ember)]">
          Hearth Clarification — Ask First, Answer Once
        </span>
      </div>

      <p className="text-[14.5px] font-medium text-[var(--text-primary)] mb-3">
        {clarification.question}
      </p>

      {/* Suggested Options */}
      <div className="space-y-2 mb-3">
        {clarification.options.map((option, idx) => {
          const isChosen = !isTypingCustom && selected === option;
          return (
            <button
              key={idx}
              type="button"
              disabled={disabled}
              onClick={() => {
                setSelected(option);
                setIsTypingCustom(false);
              }}
              className={`w-full text-left px-3.5 py-2.5 rounded-lg text-[13.5px] transition-all flex items-center justify-between border ${
                isChosen
                  ? 'border-[var(--accent-ember)] bg-[var(--accent-ember-subtle)] text-[var(--text-primary)] font-medium'
                  : 'border-[var(--border-subtle)] bg-[var(--bg-main)] text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]'
              }`}
            >
              <span>{option}</span>
              <div
                className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ml-3 ${
                  isChosen
                    ? 'border-[var(--accent-ember)] bg-[var(--accent-ember)]'
                    : 'border-[var(--border-strong)]'
                }`}
              >
                {isChosen && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
              </div>
            </button>
          );
        })}
      </div>

      {/* Custom Answer Input */}
      <div className="pt-1">
        <div className="flex gap-2">
          <input
            type="text"
            disabled={disabled}
            placeholder="Or specify custom constraint..."
            value={customText}
            onFocus={() => setIsTypingCustom(true)}
            onChange={e => {
              setCustomText(e.target.value);
              setIsTypingCustom(true);
            }}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSubmit();
              }
            }}
            className="flex-1 px-3 py-2 text-[13px] bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent-ember)]"
          />
          <button
            type="button"
            disabled={disabled || (!selected && !customText.trim())}
            onClick={handleSubmit}
            className="px-4 py-2 bg-[var(--accent-ember)] hover:bg-[var(--accent-ember-hover)] disabled:opacity-40 disabled:hover:bg-[var(--accent-ember)] text-white text-[13px] font-medium rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
          >
            <span>Proceed</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
