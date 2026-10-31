import React, { useState } from 'react';
import {
  Send,
  Paperclip,
  Mic,
  ArrowUpRight,
  CheckCircle2,
  Circle,
  Clock,
  Sparkles,
  Layers,
  FolderGit2,
  FileText,
  X,
} from 'lucide-react';
import { Conversation, Task, Project } from '../../types';
import { promptSuggestions } from '../../data/mockData';
import { formatRelativeTime } from '../../utils/rules';

interface HomeDashboardProps {
  userName: string;
  conversations: Conversation[];
  tasks: Task[];
  projects: Project[];
  onStartConversation: (prompt: string, attachment?: string) => void;
  onOpenConversation: (id: string) => void;
  onToggleTask: (taskId: string) => void;
  onNavigateToView: (view: 'tasks' | 'projects' | 'memory') => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  userName,
  conversations,
  tasks,
  projects,
  onStartConversation,
  onOpenConversation,
  onToggleTask,
  onNavigateToView,
}) => {
  const [inputText, setInputText] = useState('');
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [attachedFile, setAttachedFile] = useState<string | null>(null);

  // Time-of-day greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim() && !attachedFile) return;
    onStartConversation(inputText.trim(), attachedFile || undefined);
    setInputText('');
    setAttachedFile(null);
  };

  const handleSuggestionClick = (prompt: string) => {
    onStartConversation(prompt);
  };

  const recentConversations = conversations.slice(0, 3);
  const pendingTasks = tasks.filter(t => t.status !== 'completed').slice(0, 3);

  return (
    <div className="flex-1 overflow-y-auto bg-[var(--bg-main)] px-6 py-10 lg:py-14">
      <div className="max-w-3xl mx-auto space-y-12">
        {/* Header Greeting */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[var(--accent-ember)]" />
            <span className="text-[12px] font-mono uppercase tracking-widest text-[var(--accent-ember)]">
              Quiet Workspace
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-normal tracking-tight text-[var(--text-primary)]">
            {getGreeting()}, {userName.split(' ')[0]}.
          </h1>
          <p className="text-[16px] text-[var(--text-secondary)] font-normal">
            What would you like to work through today?
          </p>
        </div>

        {/* Large Beautiful AI Input Composer */}
        <div className="relative rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-3 sm:p-4 shadow-sm hover:border-[var(--border-strong)] focus-within:border-[var(--accent-ember)] transition-all">
          {attachedFile && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 mb-2 rounded bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[12px] text-[var(--text-secondary)] font-mono">
              <FileText className="w-3.5 h-3.5 text-[var(--accent-ember)]" />
              <span>{attachedFile}</span>
              <button onClick={() => setAttachedFile(null)} className="hover:text-[var(--text-primary)] ml-1">
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          <textarea
            rows={3}
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            placeholder="Think out loud. I'll help you figure it out."
            className="w-full bg-transparent px-2 py-1 text-[16px] leading-relaxed text-[var(--text-primary)] placeholder-[var(--text-tertiary)] resize-none focus:outline-none"
          />

          <div className="flex items-center justify-between pt-2 px-1 border-t border-[var(--border-subtle)] text-[var(--text-secondary)]">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setAttachedFile(attachedFile ? null : 'system-architecture.md')}
                className="p-2 rounded-lg hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] transition-colors"
                title="Attach context file"
                aria-label="Attach context file"
              >
                <Paperclip className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setIsVoiceActive(!isVoiceActive)}
                className={`p-2 rounded-lg transition-colors ${
                  isVoiceActive
                    ? 'text-[var(--accent-ember)] bg-[var(--accent-ember-subtle)]'
                    : 'hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]'
                }`}
                title="Voice input"
                aria-label="Voice input"
              >
                <Mic className="w-4 h-4" />
              </button>

              {isVoiceActive && (
                <span className="flex items-center gap-1 text-[11px] font-mono text-[var(--accent-ember)] ml-1">
                  <span className="w-1 h-3 bg-[var(--accent-ember)] animate-pulse" />
                  <span className="w-1 h-4 bg-[var(--accent-ember)] animate-pulse delay-75" />
                  <span className="w-1 h-2 bg-[var(--accent-ember)] animate-pulse delay-150" />
                  <span>Ready</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <span className="hidden sm:inline text-[11px] font-mono text-[var(--text-tertiary)]">
                Return to send • Shift+Return for newline
              </span>
              <button
                type="button"
                onClick={() => handleSubmit()}
                disabled={!inputText.trim() && !attachedFile}
                className="flex items-center justify-center w-9 h-9 rounded-xl bg-[var(--accent-ember)] hover:bg-[var(--accent-ember-hover)] disabled:opacity-30 disabled:hover:bg-[var(--accent-ember)] text-white transition-all cursor-pointer shadow-sm"
                aria-label="Send initial prompt"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Useful Action Suggestions */}
        <div className="space-y-3">
          <div className="text-[12px] font-mono uppercase tracking-wider text-[var(--text-tertiary)] px-1">
            Suggested Actions
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {promptSuggestions.map((item, idx) => (
              <button
                key={idx}
                onClick={() => handleSuggestionClick(item.prompt)}
                className="text-left p-3.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:border-[var(--border-strong)] hover:bg-[var(--bg-surface-hover)] transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[13.5px] font-medium text-[var(--text-primary)] group-hover:text-[var(--accent-ember)] transition-colors">
                      {item.title}
                    </span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-[var(--text-tertiary)] group-hover:text-[var(--accent-ember)] transition-colors opacity-0 group-hover:opacity-100" />
                  </div>
                  <p className="text-[12px] text-[var(--text-secondary)] mt-1 line-clamp-2">
                    {item.desc}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Compact Recent Activity Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Recent Conversations */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-[12px] font-mono uppercase tracking-wider text-[var(--text-tertiary)] flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                Recent Conversations
              </span>
            </div>

            <div className="space-y-2">
              {recentConversations.map(conv => (
                <div
                  key={conv.id}
                  onClick={() => onOpenConversation(conv.id)}
                  className="p-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:border-[var(--border-strong)] cursor-pointer transition-all"
                >
                  <div className="text-[13.5px] font-medium text-[var(--text-primary)] truncate">
                    {conv.title}
                  </div>
                  <div className="flex items-center gap-2 mt-1.5 text-[11px] font-mono text-[var(--text-tertiary)]">
                    <span>{formatRelativeTime(conv.updatedAt)}</span>
                    <span>•</span>
                    <span>{conv.messageCount} messages</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Tasks Snippet */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-[12px] font-mono uppercase tracking-wider text-[var(--text-tertiary)] flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[var(--accent-ember)]" />
                Active Tasks
              </span>
              <button
                onClick={() => onNavigateToView('tasks')}
                className="text-[12px] text-[var(--accent-ember)] hover:underline"
              >
                View all
              </button>
            </div>

            <div className="space-y-2">
              {pendingTasks.map(task => (
                <div
                  key={task.id}
                  className="p-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:border-[var(--border-strong)] transition-all flex items-start gap-2.5"
                >
                  <button
                    onClick={() => onToggleTask(task.id)}
                    className="mt-0.5 text-[var(--text-tertiary)] hover:text-[var(--accent-ember)] transition-colors shrink-0"
                    aria-label={`Mark ${task.title} complete`}
                  >
                    <Circle className="w-4 h-4" />
                  </button>
                  <div className="min-w-0 flex-1">
                    <div className="text-[13px] font-medium text-[var(--text-primary)] line-clamp-1">
                      {task.title}
                    </div>
                    {task.description && (
                      <p className="text-[11.5px] text-[var(--text-secondary)] line-clamp-1 mt-0.5">
                        {task.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
