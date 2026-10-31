import React, { useState, useEffect } from 'react';
import {
  Search,
  MessageSquare,
  CheckSquare,
  FolderKanban,
  BrainCircuit,
  Settings,
  Plus,
  Sun,
  Moon,
  ArrowRight,
} from 'lucide-react';
import { Conversation, Task, Project, MemoryItem, ActiveView } from '../../types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  conversations: Conversation[];
  tasks: Task[];
  projects: Project[];
  memories: MemoryItem[];
  theme: 'dark' | 'light';
  onSelectConversation: (id: string) => void;
  onSelectView: (view: ActiveView) => void;
  onNewConversation: () => void;
  onToggleTheme: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  conversations,
  tasks,
  projects,
  memories,
  theme,
  onSelectConversation,
  onSelectView,
  onNewConversation,
  onToggleTheme,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    setQuery('');
    setSelectedIndex(0);
  }, [isOpen]);

  if (!isOpen) return null;

  const q = query.trim().toLowerCase();

  // Build items list
  const items: Array<{
    id: string;
    type: 'action' | 'conversation' | 'task' | 'project' | 'memory';
    title: string;
    subtitle?: string;
    action: () => void;
  }> = [];

  // Default Quick Actions
  items.push({
    id: 'act-new',
    type: 'action',
    title: 'New Conversation',
    subtitle: 'Start a clean thought workspace',
    action: () => {
      onNewConversation();
      onClose();
    },
  });

  items.push({
    id: 'act-theme',
    type: 'action',
    title: `Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`,
    subtitle: 'Toggle color palette',
    action: () => {
      onToggleTheme();
      onClose();
    },
  });

  items.push({
    id: 'act-tasks',
    type: 'action',
    title: 'Open Tasks Workspace',
    subtitle: 'View and organize task board',
    action: () => {
      onSelectView('tasks');
      onClose();
    },
  });

  items.push({
    id: 'act-projects',
    type: 'action',
    title: 'Open Projects Workspace',
    subtitle: 'Manage active project contexts',
    action: () => {
      onSelectView('projects');
      onClose();
    },
  });

  items.push({
    id: 'act-memory',
    type: 'action',
    title: 'Open User Memory',
    subtitle: 'Inspect and edit remembered context',
    action: () => {
      onSelectView('memory');
      onClose();
    },
  });

  // Conversations
  conversations.forEach(c => {
    items.push({
      id: `conv-${c.id}`,
      type: 'conversation',
      title: c.title,
      subtitle: c.summary || 'Conversation',
      action: () => {
        onSelectConversation(c.id);
        onSelectView('chat');
        onClose();
      },
    });
  });

  // Projects
  projects.forEach(p => {
    items.push({
      id: `proj-${p.id}`,
      type: 'project',
      title: p.name,
      subtitle: p.description,
      action: () => {
        onSelectView('projects');
        onClose();
      },
    });
  });

  // Tasks
  tasks.forEach(t => {
    items.push({
      id: `task-${t.id}`,
      type: 'task',
      title: t.title,
      subtitle: `Task • Priority: ${t.priority.toUpperCase()}`,
      action: () => {
        onSelectView('tasks');
        onClose();
      },
    });
  });

  // Filter items
  const filtered = items.filter(item => {
    if (!q) return true;
    return item.title.toLowerCase().includes(q) || item.subtitle?.toLowerCase().includes(q);
  });

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % Math.max(1, filtered.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filtered.length) % Math.max(1, filtered.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        filtered[selectedIndex].action();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'conversation':
        return <MessageSquare className="w-4 h-4 text-[var(--accent-ember)]" />;
      case 'task':
        return <CheckSquare className="w-4 h-4 text-emerald-500" />;
      case 'project':
        return <FolderKanban className="w-4 h-4 text-blue-500" />;
      case 'memory':
        return <BrainCircuit className="w-4 h-4 text-purple-500" />;
      default:
        return <Plus className="w-4 h-4 text-[var(--text-tertiary)]" />;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/60 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-2xl overflow-hidden animate-fadeIn"
        onClick={e => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="p-3.5 border-b border-[var(--border-subtle)] flex items-center gap-3">
          <Search className="w-4 h-4 text-[var(--accent-ember)] shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Type a command or search thoughts, tasks, projects..."
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            className="w-full bg-transparent text-[14px] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none"
          />
          <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-[var(--border-subtle)] bg-[var(--bg-main)] text-[var(--text-tertiary)] shrink-0">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="p-6 text-center text-[13px] text-[var(--text-tertiary)]">
              No matching commands or workspace items found.
            </div>
          ) : (
            filtered.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={item.action}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`p-2.5 rounded-xl flex items-center justify-between cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-[var(--accent-ember-subtle)] border border-[var(--accent-ember)]/40 text-[var(--text-primary)]'
                      : 'hover:bg-[var(--bg-surface-hover)] text-[var(--text-secondary)]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="shrink-0">{getIcon(item.type)}</div>
                    <div className="min-w-0">
                      <div className="text-[13px] font-medium text-[var(--text-primary)] truncate">
                        {item.title}
                      </div>
                      {item.subtitle && (
                        <div className="text-[11px] text-[var(--text-secondary)] truncate">
                          {item.subtitle}
                        </div>
                      )}
                    </div>
                  </div>

                  <ArrowRight
                    className={`w-3.5 h-3.5 text-[var(--accent-ember)] shrink-0 transition-opacity ${
                      isSelected ? 'opacity-100' : 'opacity-0'
                    }`}
                  />
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-2.5 border-t border-[var(--border-subtle)] bg-[var(--bg-secondary)] flex items-center justify-between text-[11px] font-mono text-[var(--text-tertiary)]">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
          </div>
          <span>Hearth Workspace</span>
        </div>
      </div>
    </div>
  );
};
