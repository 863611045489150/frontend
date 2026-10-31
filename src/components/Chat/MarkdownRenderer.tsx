import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { parseMarkdownBlocks, MarkdownBlock } from '../../utils/rules';
import { Citation } from '../../types';

interface MarkdownRendererProps {
  content: string;
  citations?: Citation[];
  onCitationClick?: (citation: Citation) => void;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  citations,
  onCitationClick,
}) => {
  const blocks = parseMarkdownBlocks(content);

  return (
    <div className="space-y-4 text-[14.5px] leading-relaxed text-[var(--text-primary)]">
      {blocks.map((block, idx) => (
        <RenderBlock
          key={idx}
          block={block}
          citations={citations}
          onCitationClick={onCitationClick}
        />
      ))}
    </div>
  );
};

const RenderBlock: React.FC<{
  block: MarkdownBlock;
  citations?: Citation[];
  onCitationClick?: (citation: Citation) => void;
}> = ({ block, citations, onCitationClick }) => {
  switch (block.type) {
    case 'heading': {
      const level = block.level || 1;
      if (level === 1) {
        return (
          <h1 className="text-xl font-semibold tracking-tight text-[var(--text-primary)] pt-3 pb-1 border-b border-[var(--border-subtle)]">
            {renderInline(block.content, citations, onCitationClick)}
          </h1>
        );
      }
      if (level === 2) {
        return (
          <h2 className="text-lg font-semibold tracking-tight text-[var(--text-primary)] pt-2 pb-0.5">
            {renderInline(block.content, citations, onCitationClick)}
          </h2>
        );
      }
      return (
        <h3 className="text-[15px] font-medium tracking-tight text-[var(--text-primary)] pt-1 text-[var(--accent-ember)]">
          {renderInline(block.content, citations, onCitationClick)}
        </h3>
      );
    }

    case 'code':
      return <CodeSnippet code={block.content} language={block.language || 'text'} />;

    case 'quote':
      return (
        <blockquote className="border-l-2 border-[var(--accent-ember)] pl-4 py-1.5 my-2 text-[var(--text-secondary)] italic text-[14px] bg-[var(--accent-ember-subtle)] rounded-r">
          {renderInline(block.content, citations, onCitationClick)}
        </blockquote>
      );

    case 'list':
      return (
        <ul className="list-disc pl-5 space-y-1.5 text-[var(--text-secondary)]">
          {block.items?.map((item, index) => (
            <li key={index} className="pl-1 marker:text-[var(--accent-ember)]">
              {renderInline(item, citations, onCitationClick)}
            </li>
          ))}
        </ul>
      );

    case 'paragraph':
    default:
      return (
        <p className="text-[var(--text-primary)] font-normal">
          {renderInline(block.content, citations, onCitationClick)}
        </p>
      );
  }
};

const CodeSnippet: React.FC<{ code: string; language: string }> = ({ code, language }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-3 rounded border border-[var(--border-subtle)] bg-[var(--code-bg)] overflow-hidden">
      <div className="flex items-center justify-between px-3.5 py-1.5 border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)] text-[12px] font-mono text-[var(--text-secondary)]">
        <span className="tracking-wide uppercase font-medium">{language}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-colors focus:outline-none"
          title="Copy snippet"
          aria-label="Copy code snippet"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-emerald-500">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <div className="p-4 overflow-x-auto">
        <pre className="font-mono text-[13px] leading-relaxed text-[var(--text-primary)]">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
};

function renderInline(
  text: string,
  citations?: Citation[],
  onCitationClick?: (citation: Citation) => void
): React.ReactNode {
  // Replace bold **text**, inline `code`, and [Ref: ...]
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let keyIndex = 0;

  while (remaining.length > 0) {
    // Check for inline code `...`
    const codeMatch = remaining.match(/^`([^`]+)`/);
    if (codeMatch) {
      parts.push(
        <code
          key={`code-${keyIndex++}`}
          className="px-1.5 py-0.5 rounded bg-[var(--code-bg)] border border-[var(--border-subtle)] text-[13px] font-mono text-[var(--accent-ember)]"
        >
          {codeMatch[1]}
        </code>
      );
      remaining = remaining.slice(codeMatch[0].length);
      continue;
    }

    // Check for bold **...**
    const boldMatch = remaining.match(/^\*\*([^*]+)\*\*/);
    if (boldMatch) {
      parts.push(
        <strong key={`bold-${keyIndex++}`} className="font-semibold text-[var(--text-primary)]">
          {boldMatch[1]}
        </strong>
      );
      remaining = remaining.slice(boldMatch[0].length);
      continue;
    }

    // Check for citations like [Ref: ...] or [Memory: ...]
    const citMatch = remaining.match(/^\[(Ref|Memory):\s*([^\]]+)\]/);
    if (citMatch) {
      const type = citMatch[1];
      const label = citMatch[2];
      const matchedCitation = citations?.find(c =>
        c.title.toLowerCase().includes(label.toLowerCase()) ||
        c.source.toLowerCase().includes(label.toLowerCase())
      );

      parts.push(
        <button
          key={`cit-${keyIndex++}`}
          onClick={() => matchedCitation && onCitationClick?.(matchedCitation)}
          className="inline-flex items-center gap-1 px-1.5 py-0.5 mx-1 text-[11px] font-mono rounded border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--accent-ember)] hover:border-[var(--accent-ember)] transition-colors align-baseline"
          title={matchedCitation ? `${matchedCitation.title}: ${matchedCitation.snippet}` : label}
        >
          <span className="opacity-70 text-[10px] uppercase font-bold">{type}:</span>
          <span>{label}</span>
        </button>
      );
      remaining = remaining.slice(citMatch[0].length);
      continue;
    }

    // Regular text up to next special symbol
    const nextSpecial = remaining.search(/[`*\[]/);
    if (nextSpecial === -1) {
      parts.push(remaining);
      break;
    } else if (nextSpecial === 0) {
      // Just emit the symbol if it didn't match regular syntax
      parts.push(remaining[0]);
      remaining = remaining.slice(1);
    } else {
      parts.push(remaining.slice(0, nextSpecial));
      remaining = remaining.slice(nextSpecial);
    }
  }

  return parts;
}
