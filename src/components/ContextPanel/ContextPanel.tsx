import React, { useState } from 'react';
import {
  X,
  FileText,
  CheckCircle2,
  Circle,
  Plus,
  BrainCircuit,
  Sliders,
  Layers,
  Info,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { Conversation, Task, MemoryItem, Project } from '../../types';

interface ContextPanelProps {
  isOpen: boolean;
  onClose: () => void;
  activeConversation?: Conversation;
  projects: Project[];
  tasks: Task[];
  memories: MemoryItem[];
  onToggleTask: (taskId: string) => void;
  onAddTask: (task: Partial<Task>) => void;
  onAddMemory: (memory: Partial<MemoryItem>) => void;
  onOpenTasksView: () => void;
  onOpenMemoryView: () => void;
}

export const ContextPanel: React.FC<ContextPanelProps> = ({
  isOpen,
  onClose,
  activeConversation,
  projects,
  tasks,
  memories,
  onToggleTask,
  onAddTask,
  onAddMemory,
  onOpenTasksView,
  onOpenMemoryView,
}) => {
  const [activeTab, setActiveTab] = useState<'context' | 'tasks' | 'memory'>('context');
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  if (!isOpen) return null;

  const project = projects.find(p => p.id === activeConversation?.projectId);

  // Relevant tasks for the current conversation or project
  const relevantTasks = tasks.filter(t => {
    if (activeConversation) {
      if (t.conversationId === activeConversation.id) return true;
      if (activeConversation.projectId && t.projectId === activeConversation.projectId) return true;
    }
    return false;
  });

  const displayTasks = relevantTasks.length > 0 ? relevantTasks : tasks.slice(0, 5);

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    onAddTask({
      title: newTaskTitle.trim(),
      status: 'pending',
      priority: 'medium',
      conversationId: activeConversation?.id,
      projectId: activeConversation?.projectId,
    });
    setNewTaskTitle('');
    setIsAddingTask(false);
  };

  return (
    <>
      {/* Mobile/Tablet Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-30 lg:hidden backdrop-blur-xs"
        onClick={onClose}
      />
      <aside className="fixed inset-y-0 right-0 lg:static z-40 w-80 max-w-[85vw] border-l border-[var(--border-subtle)] bg-[var(--bg-secondary)] flex flex-col h-full shrink-0 select-none shadow-2xl lg:shadow-none animate-fadeIn">
      {/* Panel Top Header */}
      <div className="h-14 px-4 border-b border-[var(--border-subtle)] flex items-center justify-between">
        {/* Tabs */}
        <div className="flex items-center gap-1 bg-[var(--bg-main)] p-1 rounded-lg border border-[var(--border-subtle)]">
          <button
            onClick={() => setActiveTab('context')}
            className={`px-2.5 py-1 text-[12px] font-medium rounded-md transition-all ${
              activeTab === 'context'
                ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-xs'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Context
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            className={`px-2.5 py-1 text-[12px] font-medium rounded-md transition-all ${
              activeTab === 'tasks'
                ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-xs'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Tasks ({displayTasks.filter(t => t.status !== 'completed').length})
          </button>
          <button
            onClick={() => setActiveTab('memory')}
            className={`px-2.5 py-1 text-[12px] font-medium rounded-md transition-all ${
              activeTab === 'memory'
                ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-xs'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Memory
          </button>
        </div>

        <button
          onClick={onClose}
          className="p-1 rounded text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-colors"
          title="Close panel"
          aria-label="Close panel"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {activeTab === 'context' && (
          <div className="space-y-4">
            {/* Conversation Summary */}
            <div className="p-3.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] space-y-2">
              <div className="text-[11px] font-mono uppercase tracking-wider text-[var(--text-tertiary)] flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-[var(--accent-ember)]" />
                <span>Active Conversation</span>
              </div>
              <div className="text-[13px] font-medium text-[var(--text-primary)]">
                {activeConversation ? activeConversation.title : 'Workspace Overview'}
              </div>
              <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
                {activeConversation?.summary ||
                  'Engaged in quiet computing session. Context is isolated and securely held in memory.'}
              </p>

              {activeConversation?.tags && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {activeConversation.tags.map(tag => (
                    <span
                      key={tag}
                      className="text-[10.5px] font-mono text-[var(--text-secondary)] px-1.5 py-0.5 rounded border border-[var(--border-subtle)] bg-[var(--bg-secondary)]"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Linked Project Context */}
            {project && (
              <div className="p-3.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] space-y-2">
                <div className="text-[11px] font-mono uppercase tracking-wider text-[var(--text-tertiary)] flex items-center justify-between">
                  <span>Linked Project</span>
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: project.color }}
                  />
                </div>
                <div className="text-[13px] font-medium text-[var(--text-primary)]">
                  {project.name}
                </div>
                {project.contextSnippet && (
                  <p className="text-[12px] text-[var(--text-secondary)] font-mono leading-relaxed bg-[var(--bg-secondary)] p-2 rounded border border-[var(--border-subtle)]">
                    {project.contextSnippet}
                  </p>
                )}
              </div>
            )}

            {/* Quiet Workspace Specs */}
            <div className="p-3.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] space-y-2.5">
              <div className="text-[11px] font-mono uppercase tracking-wider text-[var(--text-tertiary)] flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Runtime Environment</span>
              </div>
              <div className="space-y-1.5 text-[12px] font-mono text-[var(--text-secondary)]">
                <div className="flex justify-between">
                  <span>Model:</span>
                  <span className="text-[var(--text-primary)]">Hearth Reasoning Alpha</span>
                </div>
                <div className="flex justify-between">
                  <span>Clarification:</span>
                  <span className="text-[var(--accent-ember)] font-medium">Ask First (Active)</span>
                </div>
                <div className="flex justify-between">
                  <span>Context window:</span>
                  <span className="text-[var(--text-primary)]">1,420 / 128,000 tokens</span>
                </div>
                <div className="flex justify-between">
                  <span>Privacy mode:</span>
                  <span className="text-emerald-500">Zero telemetry</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--text-tertiary)]">
                Workspace Tasks
              </span>
              <button
                onClick={() => setIsAddingTask(true)}
                className="p-1 rounded text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-colors"
                title="Add task"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quick Add Form */}
            {isAddingTask && (
              <form onSubmit={handleCreateTask} className="space-y-2 p-2.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
                <input
                  type="text"
                  autoFocus
                  placeholder="Task title..."
                  value={newTaskTitle}
                  onChange={e => setNewTaskTitle(e.target.value)}
                  className="w-full text-[12.5px] bg-transparent border-b border-[var(--border-subtle)] pb-1 text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent-ember)]"
                />
                <div className="flex justify-end gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsAddingTask(false)}
                    className="px-2 py-1 text-[11px] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-2.5 py-1 text-[11px] font-medium bg-[var(--accent-ember)] text-white rounded"
                  >
                    Add
                  </button>
                </div>
              </form>
            )}

            {/* Tasks List */}
            <div className="space-y-2">
              {displayTasks.map(task => {
                const isCompleted = task.status === 'completed';
                return (
                  <div
                    key={task.id}
                    className="p-2.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:border-[var(--border-strong)] transition-all flex items-start gap-2.5"
                  >
                    <button
                      onClick={() => onToggleTask(task.id)}
                      className="mt-0.5 text-[var(--text-tertiary)] hover:text-[var(--accent-ember)] transition-colors shrink-0"
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Circle className="w-4 h-4" />
                      )}
                    </button>
                    <div className="min-w-0 flex-1">
                      <div
                        className={`text-[12.5px] font-medium leading-snug ${
                          isCompleted
                            ? 'line-through text-[var(--text-tertiary)]'
                            : 'text-[var(--text-primary)]'
                        }`}
                      >
                        {task.title}
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-[10.5px] font-mono text-[var(--text-tertiary)]">
                        <span className="uppercase text-[var(--accent-ember)]">{task.priority}</span>
                        {task.dueDate && <span>Due {task.dueDate.split('T')[0]}</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={onOpenTasksView}
              className="w-full mt-2 py-2 text-center text-[12px] text-[var(--text-secondary)] hover:text-[var(--accent-ember)] border border-dashed border-[var(--border-subtle)] rounded-lg transition-colors flex items-center justify-center gap-1.5"
            >
              <span>View full task board</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {activeTab === 'memory' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--text-tertiary)]">
                Active Memory
              </span>
              <button
                onClick={onOpenMemoryView}
                className="text-[11px] text-[var(--accent-ember)] hover:underline"
              >
                Manage
              </button>
            </div>

            <div className="space-y-2.5">
              {memories.map(mem => (
                <div
                  key={mem.id}
                  className="p-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] font-medium text-[var(--text-primary)]">
                      {mem.title}
                    </span>
                    <span className="text-[10px] font-mono uppercase text-[var(--text-tertiary)] px-1 py-0.5 rounded bg-[var(--bg-secondary)]">
                      {mem.category}
                    </span>
                  </div>
                  <p className="text-[11.5px] text-[var(--text-secondary)] leading-relaxed">
                    {mem.content}
                  </p>
                </div>
              ))}
            </div>

            <div className="p-3 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[11.5px] text-[var(--text-secondary)]">
              <span className="text-[var(--accent-ember)] font-medium">User Controlled:</span> Memory is never harvested automatically. You can edit or purge items at any time.
            </div>
          </div>
        )}
      </div>
    </aside>
  </>
);
};
