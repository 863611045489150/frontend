import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Square,
  Paperclip,
  Mic,
  Copy,
  RotateCcw,
  Check,
  Edit2,
  Trash2,
  Share2,
  Sparkles,
  Info,
  X,
  FileText,
} from 'lucide-react';
import { Conversation, Message, Citation, Project, Task } from '../../types';
import { MarkdownRenderer } from './MarkdownRenderer';
import { ClarificationPrompt } from './ClarificationPrompt';
import { formatRelativeTime } from '../../utils/rules';

interface ChatWorkspaceProps {
  conversation: Conversation;
  messages: Message[];
  projects: Project[];
  onSendMessage: (content: string, attachments?: string[]) => void;
  onAnswerClarification: (messageId: string, answer: string) => void;
  onUpdateTitle: (title: string) => void;
  onDeleteConversation: () => void;
  onRegenerateLast?: () => void;
  isStreaming?: boolean;
  onStopStreaming?: () => void;
}

export const ChatWorkspace: React.FC<ChatWorkspaceProps> = ({
  conversation,
  messages,
  projects,
  onSendMessage,
  onAnswerClarification,
  onUpdateTitle,
  onDeleteConversation,
  onRegenerateLast,
  isStreaming = false,
  onStopStreaming,
}) => {
  const [inputText, setInputText] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(conversation.title);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<string[]>([]);
  const [activeCitation, setActiveCitation] = useState<Citation | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const project = projects.find(p => p.id === conversation.projectId);

  useEffect(() => {
    setEditedTitle(conversation.title);
  }, [conversation.title]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [inputText]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if ((!inputText.trim() && attachedFiles.length === 0) || isStreaming) return;
    onSendMessage(inputText.trim(), attachedFiles.length > 0 ? attachedFiles : undefined);
    setInputText('');
    setAttachedFiles([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAddMockAttachment = () => {
    const mockFiles = ['architecture-v2-spec.md', 'crdt-benchmarks.json', 'tokens-schema.sql'];
    const nextFile = mockFiles[attachedFiles.length % mockFiles.length];
    if (!attachedFiles.includes(nextFile)) {
      setAttachedFiles([...attachedFiles, nextFile]);
    }
  };

  const removeAttachment = (file: string) => {
    setAttachedFiles(attachedFiles.filter(f => f !== file));
  };

  return (
    <div className="flex flex-col h-full bg-[var(--bg-main)] overflow-hidden">
      {/* Conversation Top Header */}
      <div className="h-14 px-6 border-b border-[var(--border-subtle)] flex items-center justify-between shrink-0 bg-[var(--bg-main)]">
        <div className="flex items-center gap-3 min-w-0 flex-1 mr-4">
          {isEditingTitle ? (
            <input
              type="text"
              value={editedTitle}
              autoFocus
              onChange={e => setEditedTitle(e.target.value)}
              onBlur={() => {
                setIsEditingTitle(false);
                if (editedTitle.trim()) onUpdateTitle(editedTitle.trim());
              }}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  setIsEditingTitle(false);
                  if (editedTitle.trim()) onUpdateTitle(editedTitle.trim());
                } else if (e.key === 'Escape') {
                  setEditedTitle(conversation.title);
                  setIsEditingTitle(false);
                }
              }}
              className="text-[14px] font-medium bg-[var(--bg-surface)] px-2 py-1 rounded border border-[var(--accent-ember)] text-[var(--text-primary)] w-full max-w-md focus:outline-none"
            />
          ) : (
            <div className="flex items-center gap-2 group cursor-pointer min-w-0" onClick={() => setIsEditingTitle(true)}>
              <h1 className="text-[14.5px] font-medium text-[var(--text-primary)] truncate" title={conversation.title}>
                {conversation.title}
              </h1>
              <Edit2 className="w-3.5 h-3.5 text-[var(--text-tertiary)] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
            </div>
          )}

          {project && (
            <span
              className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono shrink-0"
              style={{
                backgroundColor: `${project.color}15`,
                color: project.color,
                border: `1px solid ${project.color}30`,
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: project.color }} />
              {project.name}
            </span>
          )}
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-1 text-[var(--text-secondary)]">
          <button
            onClick={() => {
              const textToExport = messages.map(m => `### ${m.role.toUpperCase()} (${m.timestamp})\n\n${m.content}\n`).join('\n---\n\n');
              navigator.clipboard.writeText(textToExport);
              alert('Conversation exported to clipboard as Markdown');
            }}
            className="p-1.5 rounded hover:bg-[var(--bg-surface)] hover:text-[var(--text-primary)] transition-colors"
            title="Export conversation"
            aria-label="Export conversation"
          >
            <Share2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              if (confirm('Delete this conversation from Hearth?')) {
                onDeleteConversation();
              }
            }}
            className="p-1.5 rounded hover:bg-[var(--bg-surface)] hover:text-red-400 transition-colors"
            title="Delete conversation"
            aria-label="Delete conversation"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Message Feed */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 space-y-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.map((msg, index) => {
            const isUser = msg.role === 'user';

            return (
              <div
                key={msg.id}
                className={`group flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
              >
                {/* Role & Timestamp metadata (zero-pill discipline: unboxed clean text) */}
                <div className="flex items-center gap-2 mb-1.5 px-1 text-[11px] font-mono text-[var(--text-tertiary)]">
                  <span className={isUser ? 'text-[var(--text-secondary)] font-medium' : 'text-[var(--accent-ember)] font-medium'}>
                    {isUser ? 'You' : 'Hearth'}
                  </span>
                  <span>•</span>
                  <span>{formatRelativeTime(msg.timestamp)}</span>
                </div>

                {/* Bubble Container */}
                <div
                  className={`relative rounded-xl transition-all ${
                    isUser
                      ? 'bg-[var(--bg-surface)] border border-[var(--border-subtle)] px-4 py-3 text-[14.5px] max-w-[85%] text-[var(--text-primary)]'
                      : 'w-full rounded-none bg-transparent pt-1 pb-3 text-[var(--text-primary)]'
                  }`}
                >
                  {/* Thinking state indicator */}
                  {msg.status === 'thinking' && (
                    <div className="flex items-center gap-2.5 py-3 text-[13px] text-[var(--accent-ember)] font-mono">
                      <div className="w-2 h-2 rounded-full bg-[var(--accent-ember)] animate-ping" />
                      <span>Thinking through causal tradeoffs...</span>
                    </div>
                  )}

                  {/* Clarification UI if present */}
                  {msg.clarification && (
                    <ClarificationPrompt
                      clarification={msg.clarification}
                      onSelectOption={opt => onAnswerClarification(msg.id, opt)}
                      onSubmitCustom={custom => onAnswerClarification(msg.id, custom)}
                      disabled={isStreaming}
                    />
                  )}

                  {/* Render content */}
                  {msg.content && (
                    <MarkdownRenderer
                      content={msg.content}
                      citations={msg.citations}
                      onCitationClick={cit => setActiveCitation(cit)}
                    />
                  )}

                  {/* Streaming cursor */}
                  {msg.status === 'streaming' && (
                    <span className="inline-block w-1.5 h-4 ml-1 bg-[var(--accent-ember)] animate-pulse align-middle" />
                  )}

                  {/* Inline Citations Drawer if active on message */}
                  {msg.citations && msg.citations.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] space-y-1.5">
                      <div className="text-[11px] font-mono uppercase tracking-wider text-[var(--text-tertiary)] flex items-center gap-1.5">
                        <Info className="w-3 h-3 text-[var(--accent-ember)]" />
                        <span>Referenced Context & Memory:</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                        {msg.citations.map(cit => (
                          <div
                            key={cit.id}
                            onClick={() => setActiveCitation(cit)}
                            className="p-2.5 rounded border border-[var(--border-subtle)] bg-[var(--bg-secondary)] hover:border-[var(--accent-ember)] cursor-pointer transition-colors"
                          >
                            <div className="text-[12px] font-medium text-[var(--text-primary)] truncate">
                              {cit.title}
                            </div>
                            <div className="text-[11px] text-[var(--text-secondary)] line-clamp-1 mt-0.5">
                              {cit.snippet}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Message Action Bar (Copy / Regenerate) */}
                  <div className="flex items-center gap-2 mt-2 pt-1 opacity-0 group-hover:opacity-100 transition-opacity text-[var(--text-tertiary)] text-[12px]">
                    <button
                      onClick={() => handleCopyMessage(msg.id, msg.content)}
                      className="p-1 rounded hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] transition-colors flex items-center gap-1"
                      title="Copy text"
                      aria-label="Copy message text"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="text-[11px] text-emerald-500">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span className="text-[11px]">Copy</span>
                        </>
                      )}
                    </button>
                    {!isUser && index === messages.length - 1 && onRegenerateLast && !isStreaming && (
                      <button
                        onClick={onRegenerateLast}
                        className="p-1 rounded hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] transition-colors flex items-center gap-1"
                        title="Regenerate"
                        aria-label="Regenerate response"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span className="text-[11px]">Regenerate</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Selected Citation Inspection Modal/Toast */}
      {activeCitation && (
        <div className="border-t border-[var(--border-subtle)] bg-[var(--bg-surface)] px-6 py-3 flex items-start justify-between gap-4 text-[13px] animate-fadeIn">
          <div>
            <div className="font-medium text-[var(--text-primary)] flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-ember)]" />
              <span>{activeCitation.title}</span>
              <span className="text-[11px] text-[var(--text-secondary)] font-mono">({activeCitation.source})</span>
            </div>
            <p className="text-[var(--text-secondary)] mt-1">{activeCitation.snippet}</p>
          </div>
          <button
            onClick={() => setActiveCitation(null)}
            className="p-1 rounded text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
            aria-label="Close citation details"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Bottom Message Composer */}
      <div className="p-4 sm:p-6 border-t border-[var(--border-subtle)] bg-[var(--bg-main)]">
        <div className="max-w-3xl mx-auto">
          {/* Active Attached Files */}
          {attachedFiles.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {attachedFiles.map(file => (
                <div
                  key={file}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[12px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-secondary)]"
                >
                  <FileText className="w-3.5 h-3.5 text-[var(--accent-ember)]" />
                  <span className="font-mono">{file}</span>
                  <button
                    onClick={() => removeAttachment(file)}
                    className="hover:text-[var(--text-primary)] ml-1"
                    aria-label={`Remove ${file}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Input Box */}
          <div className="relative rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] focus-within:border-[var(--accent-ember)] transition-all shadow-sm">
            <textarea
              ref={textareaRef}
              rows={2}
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask or propose a thought. Shift + Enter for new line..."
              className="w-full bg-transparent px-4 py-3 text-[14.5px] leading-relaxed text-[var(--text-primary)] placeholder-[var(--text-tertiary)] resize-none focus:outline-none"
            />

            {/* Composer Toolbar */}
            <div className="flex items-center justify-between px-3 py-2 border-t border-[var(--border-subtle)] text-[var(--text-secondary)]">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleAddMockAttachment}
                  className="p-1.5 rounded hover:bg-[var(--bg-main)] hover:text-[var(--text-primary)] transition-colors"
                  title="Attach file or context"
                  aria-label="Attach file"
                >
                  <Paperclip className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsVoiceActive(!isVoiceActive)}
                  className={`p-1.5 rounded transition-colors ${
                    isVoiceActive
                      ? 'text-[var(--accent-ember)] bg-[var(--accent-ember-subtle)]'
                      : 'hover:bg-[var(--bg-main)] hover:text-[var(--text-primary)]'
                  }`}
                  title={isVoiceActive ? 'Voice active (visual demo)' : 'Voice input'}
                  aria-label="Voice input"
                >
                  <Mic className="w-4 h-4" />
                </button>
                {isVoiceActive && (
                  <span className="flex items-center gap-1 text-[11px] font-mono text-[var(--accent-ember)] ml-1">
                    <span className="w-1 h-3 bg-[var(--accent-ember)] animate-pulse" />
                    <span className="w-1 h-4 bg-[var(--accent-ember)] animate-pulse delay-75" />
                    <span className="w-1 h-2 bg-[var(--accent-ember)] animate-pulse delay-150" />
                    <span className="text-[10px]">Listening</span>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <span className="hidden sm:inline text-[11px] font-mono text-[var(--text-tertiary)]">
                  Ask first • Answer once
                </span>

                {isStreaming ? (
                  <button
                    type="button"
                    onClick={onStopStreaming}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--bg-secondary)] hover:bg-[var(--bg-main)] text-[13px] text-[var(--text-primary)] font-medium border border-[var(--border-subtle)] transition-colors cursor-pointer"
                  >
                    <Square className="w-3.5 h-3.5 fill-current" />
                    <span>Stop</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSend}
                    disabled={!inputText.trim() && attachedFiles.length === 0}
                    className="flex items-center justify-center w-8 h-8 rounded-lg bg-[var(--accent-ember)] hover:bg-[var(--accent-ember-hover)] disabled:opacity-30 disabled:hover:bg-[var(--accent-ember)] text-white transition-colors cursor-pointer"
                    aria-label="Send message"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
