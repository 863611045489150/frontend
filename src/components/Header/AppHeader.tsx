import React from 'react';
import {
  Menu,
  PanelRight,
  Search,
  Compass,
  MessageSquare,
  CheckSquare,
  FolderKanban,
  BrainCircuit,
  Settings,
} from 'lucide-react';
import { ActiveView } from '../../types';

interface AppHeaderProps {
  currentView: ActiveView;
  activeConversationTitle?: string;
  isRightPanelOpen: boolean;
  onToggleRightPanel: () => void;
  onToggleMobileSidebar: () => void;
  onOpenSearch: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  currentView,
  activeConversationTitle,
  isRightPanelOpen,
  onToggleRightPanel,
  onToggleMobileSidebar,
  onOpenSearch,
}) => {
  const getViewTitle = () => {
    switch (currentView) {
      case 'home':
        return 'Home';
      case 'chat':
        return activeConversationTitle || 'Conversation';
      case 'tasks':
        return 'Tasks';
      case 'projects':
        return 'Projects';
      case 'memory':
        return 'Memory';
      case 'settings':
        return 'Settings';
      default:
        return 'Workspace';
    }
  };

  return (
    <header className="h-14 px-4 sm:px-6 border-b border-[var(--border-subtle)] bg-[var(--bg-main)] flex items-center justify-between shrink-0 select-none">
      {/* Left: Mobile hamburger & breadcrumbs */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onToggleMobileSidebar}
          className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] sm:hidden"
          title="Open menu"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 min-w-0 text-[13px]">
          <span className="text-[var(--text-tertiary)] font-mono text-[12px] hidden sm:inline">Hearth</span>
          <span className="text-[var(--text-tertiary)] hidden sm:inline">/</span>
          <span className="font-medium text-[var(--text-primary)] truncate max-w-xs sm:max-w-md">
            {getViewTitle()}
          </span>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[12px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-colors"
          title="Search (Cmd+K)"
          aria-label="Open search dialog"
        >
          <Search className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
          <span className="hidden sm:inline">Search</span>
          <kbd className="hidden sm:inline text-[10px] font-mono px-1.5 py-0.5 rounded border border-[var(--border-subtle)] bg-[var(--bg-secondary)] text-[var(--text-tertiary)]">
            ⌘K
          </kbd>
        </button>

        {/* Toggle Right Contextual Panel */}
        <button
          onClick={onToggleRightPanel}
          className={`p-2 rounded-lg transition-colors ${
            isRightPanelOpen
              ? 'text-[var(--accent-ember)] bg-[var(--accent-ember-subtle)]'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]'
          }`}
          title={isRightPanelOpen ? 'Collapse context panel' : 'Open context panel'}
          aria-label="Toggle context panel"
        >
          <PanelRight className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
