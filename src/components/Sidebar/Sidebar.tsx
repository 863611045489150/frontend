import React, { useState } from 'react';
import {
  Compass,
  MessageSquare,
  CheckSquare,
  FolderKanban,
  BrainCircuit,
  Settings as SettingsIcon,
  Plus,
  Search,
  MoreVertical,
  Trash2,
  Edit2,
  Pin,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { Conversation, ActiveView, Task, Project } from '../../types';
import { formatRelativeTime } from '../../utils/rules';

interface SidebarProps {
  currentView: ActiveView;
  activeConversationId: string | null;
  conversations: Conversation[];
  tasks: Task[];
  projects: Project[];
  theme: 'dark' | 'light';
  userName: string;
  isCollapsed: boolean;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  onToggleCollapse: () => void;
  onSelectView: (view: ActiveView) => void;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onOpenSearch: () => void;
  onToggleTheme: () => void;
  onDeleteConversation: (id: string) => void;
  onRenameConversation: (id: string, newTitle: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  activeConversationId,
  conversations,
  tasks,
  projects,
  theme,
  userName,
  isCollapsed,
  isMobileOpen = false,
  onCloseMobile,
  onToggleCollapse,
  onSelectView,
  onSelectConversation,
  onNewConversation,
  onOpenSearch,
  onToggleTheme,
  onDeleteConversation,
  onRenameConversation,
}) => {
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  const pendingTaskCount = tasks.filter(t => t.status !== 'completed').length;

  const handleAction = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
    setMenuOpenId(null);
  };

  const navItems = [
    { id: 'home' as ActiveView, label: 'Home', icon: Compass },
    { id: 'chat' as ActiveView, label: 'Chat', icon: MessageSquare },
    { id: 'tasks' as ActiveView, label: 'Tasks', icon: CheckSquare, badge: pendingTaskCount },
    { id: 'projects' as ActiveView, label: 'Projects', icon: FolderKanban, badge: projects.length },
    { id: 'memory' as ActiveView, label: 'Memory', icon: BrainCircuit },
    { id: 'settings' as ActiveView, label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <aside
      className={`h-full border-r border-[var(--border-subtle)] bg-[var(--bg-secondary)] flex flex-col transition-all duration-200 select-none z-30 shrink-0 ${
        isMobileOpen
          ? 'fixed inset-y-0 left-0 w-72 shadow-2xl flex'
          : 'hidden sm:flex ' + (isCollapsed ? 'w-16' : 'w-64 sm:w-68')
      }`}
    >
      {/* Top Header: Logo & Wordmark */}
      <div className="h-14 px-4 flex items-center justify-between border-b border-[var(--border-subtle)]">
        {!isCollapsed ? (
          <div className="flex items-center gap-2.5 overflow-hidden">
            {/* Hearth Ember Flame Glyph */}
            <div className="w-6 h-6 rounded-md bg-[var(--accent-ember)] flex items-center justify-center text-white shrink-0 shadow-sm">
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M12 2C9.5 7.5 5 9.5 5 14a7 7 0 0 0 14 0c0-4.5-4.5-6.5-7-12zm0 17a5 5 0 0 1-5-5c0-2.8 2.6-4.2 4.2-7.5 1.5 2.5 3.8 4.2 3.8 6.5 0 3.3-2 6-3 6z" />
              </svg>
            </div>
            <div className="flex items-baseline gap-1.5 min-w-0">
              <span className="font-semibold tracking-tight text-[15px] text-[var(--text-primary)]">
                HEARTH
              </span>
              <span className="text-[10px] font-mono text-[var(--text-tertiary)] uppercase tracking-wider">
                v1.4
              </span>
            </div>
          </div>
        ) : (
          <div className="mx-auto">
            <div className="w-7 h-7 rounded-md bg-[var(--accent-ember)] flex items-center justify-center text-white shadow-sm">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 2C9.5 7.5 5 9.5 5 14a7 7 0 0 0 14 0c0-4.5-4.5-6.5-7-12zm0 17a5 5 0 0 1-5-5c0-2.8 2.6-4.2 4.2-7.5 1.5 2.5 3.8 4.2 3.8 6.5 0 3.3-2 6-3 6z" />
              </svg>
            </div>
          </div>
        )}

        <button
          onClick={onToggleCollapse}
          className="p-1 rounded text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-colors hidden sm:flex items-center justify-center"
          title={isCollapsed ? 'Expand sidebar (Cmd+\\)' : 'Collapse sidebar (Cmd+\\)'}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Primary Action Buttons */}
      <div className="p-2 space-y-1">
        {/* New Conversation Button */}
        <button
          onClick={onNewConversation}
          className={`w-full flex items-center justify-center gap-2 rounded-lg text-[13px] font-medium transition-all ${
            isCollapsed
              ? 'p-2 text-[var(--accent-ember)] hover:bg-[var(--bg-surface)]'
              : 'px-3 py-2 bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-subtle)] hover:border-[var(--border-strong)] text-[var(--text-primary)] shadow-sm'
          }`}
          title="New Conversation"
          aria-label="New Conversation"
        >
          <Plus className="w-4 h-4 text-[var(--accent-ember)] shrink-0" />
          {!isCollapsed && <span className="flex-1 text-left">New Conversation</span>}
        </button>

        {/* Quick Search */}
        <button
          onClick={onOpenSearch}
          className={`w-full flex items-center gap-2 rounded-lg text-[13px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-all ${
            isCollapsed ? 'p-2 justify-center' : 'px-3 py-1.5'
          }`}
          title="Search (Cmd+K)"
          aria-label="Search conversations and tasks"
        >
          <Search className="w-4 h-4 shrink-0 text-[var(--text-tertiary)]" />
          {!isCollapsed && (
            <div className="flex-1 flex items-center justify-between text-[12.5px]">
              <span>Search...</span>
              <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-[var(--border-subtle)] bg-[var(--bg-main)] text-[var(--text-tertiary)]">
                ⌘K
              </kbd>
            </div>
          )}
        </button>
      </div>

      {/* Main Navigation Items */}
      <div className="px-2 py-1 space-y-0.5">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectView(item.id)}
              className={`w-full flex items-center gap-2.5 rounded-lg text-[13px] font-medium transition-all ${
                isCollapsed ? 'p-2 justify-center' : 'px-3 py-1.5'
              } ${
                isActive
                  ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-subtle)] shadow-xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)]'
              }`}
              title={item.label}
              aria-label={item.label}
            >
              <Icon
                className={`w-4 h-4 shrink-0 ${isActive ? 'text-[var(--accent-ember)]' : 'text-[var(--text-tertiary)]'}`}
              />
              {!isCollapsed && (
                <div className="flex-1 flex items-center justify-between">
                  <span>{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="text-[10.5px] font-mono text-[var(--text-tertiary)] px-1">
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Divider */}
      <div className="my-2 border-t border-[var(--border-subtle)] mx-3" />

      {/* Recent Conversations List */}
      <div className="flex-1 overflow-y-auto px-2 space-y-1">
        {!isCollapsed && (
          <div className="px-2 py-1 text-[11px] font-mono uppercase tracking-wider text-[var(--text-tertiary)]">
            Recent Thoughts
          </div>
        )}

        {conversations.map(conv => {
          const isActive = currentView === 'chat' && activeConversationId === conv.id;
          const isMenuOpen = menuOpenId === conv.id;

          if (isCollapsed) {
            return (
              <button
                key={conv.id}
                onClick={() => {
                  onSelectConversation(conv.id);
                  onSelectView('chat');
                }}
                className={`w-full p-2 flex justify-center rounded-lg transition-all ${
                  isActive
                    ? 'bg-[var(--accent-ember-subtle)] text-[var(--accent-ember)]'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface)]'
                }`}
                title={conv.title}
              >
                <div className="w-2 h-2 rounded-full bg-[var(--text-tertiary)]" />
              </button>
            );
          }

          return (
            <div
              key={conv.id}
              onClick={() => {
                onSelectConversation(conv.id);
                onSelectView('chat');
              }}
              className={`group relative flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[12.5px] cursor-pointer transition-all ${
                isActive
                  ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-subtle)] font-medium shadow-xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)]'
              }`}
            >
              <div className="min-w-0 flex-1 pr-2">
                <div className="truncate">{conv.title}</div>
                <div className="text-[10.5px] font-mono text-[var(--text-tertiary)] mt-0.5">
                  {formatRelativeTime(conv.updatedAt)}
                </div>
              </div>

              {/* Context Menu Button */}
              <button
                onClick={e => handleAction(e, () => setMenuOpenId(isMenuOpen ? null : conv.id))}
                className="opacity-0 group-hover:opacity-100 p-1 rounded text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-main)] transition-opacity shrink-0"
                aria-label={`Actions for ${conv.title}`}
              >
                <MoreVertical className="w-3.5 h-3.5" />
              </button>

              {/* Context Dropdown Menu */}
              {isMenuOpen && (
                <div
                  onClick={e => e.stopPropagation()}
                  className="absolute right-2 top-8 z-50 w-36 py-1 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-lg text-[12px]"
                >
                  <button
                    onClick={e =>
                      handleAction(e, () => {
                        const newName = prompt('Rename thought:', conv.title);
                        if (newName && newName.trim()) {
                          onRenameConversation(conv.id, newName.trim());
                        }
                      })
                    }
                    className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-[var(--bg-surface-hover)] text-[var(--text-primary)] text-left"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
                    <span>Rename</span>
                  </button>
                  <button
                    onClick={e =>
                      handleAction(e, () => {
                        if (confirm('Delete this conversation?')) {
                          onDeleteConversation(conv.id);
                        }
                      })
                    }
                    className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-[var(--bg-surface-hover)] text-red-400 text-left"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom Profile & Theme Toggle */}
      <div className="p-3 border-t border-[var(--border-subtle)] space-y-2">
        <div className="flex items-center justify-between">
          {!isCollapsed ? (
            <div
              onClick={() => onSelectView('settings')}
              className="flex items-center gap-2.5 min-w-0 cursor-pointer p-1 rounded hover:bg-[var(--bg-surface)] transition-colors flex-1"
            >
              <div className="w-7 h-7 rounded-full bg-[var(--border-subtle)] text-[12px] font-medium flex items-center justify-center text-[var(--text-primary)] shrink-0">
                {userName.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[12.5px] font-medium text-[var(--text-primary)] truncate">
                  {userName}
                </div>
                <div className="text-[10px] font-mono text-[var(--text-tertiary)] truncate">
                  alex@hearth.local
                </div>
              </div>
            </div>
          ) : (
            <div
              onClick={() => onSelectView('settings')}
              className="w-7 h-7 mx-auto rounded-full bg-[var(--border-subtle)] text-[12px] font-medium flex items-center justify-center text-[var(--text-primary)] cursor-pointer"
              title="Settings"
            >
              {userName.charAt(0)}
            </div>
          )}

          {!isCollapsed && (
            <button
              onClick={onToggleTheme}
              className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-colors"
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
              aria-label="Toggle color theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
