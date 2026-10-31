import React, { useState } from 'react';
import {
  FolderKanban,
  Plus,
  MessageSquare,
  CheckSquare,
  ArrowRight,
  X,
  FileText,
  Clock,
  Sparkles,
  CheckCircle2,
  Circle,
} from 'lucide-react';
import { Project, Conversation, Task } from '../../types';
import { formatRelativeTime } from '../../utils/rules';

interface ProjectsViewProps {
  projects: Project[];
  conversations: Conversation[];
  tasks: Task[];
  onSelectProjectConversation: (conversationId: string) => void;
  onNewProjectConversation: (projectId: string) => void;
  onCreateProject: (project: Partial<Project>) => void;
  onToggleTask: (taskId: string) => void;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({
  projects,
  conversations,
  tasks,
  onSelectProjectConversation,
  onNewProjectConversation,
  onCreateProject,
  onToggleTask,
}) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || '');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [color, setColor] = useState('#E05D26');
  const [contextSnippet, setContextSnippet] = useState('');

  const activeProject = projects.find(p => p.id === selectedProjectId) || projects[0];

  const projectConversations = conversations.filter(c => c.projectId === activeProject?.id);
  const projectTasks = tasks.filter(t => t.projectId === activeProject?.id);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onCreateProject({
      name: name.trim(),
      description: desc.trim(),
      color,
      contextSnippet: contextSnippet.trim() || undefined,
    });

    setName('');
    setDesc('');
    setContextSnippet('');
    setIsCreateModalOpen(false);
  };

  const projectColors = ['#E05D26', '#3B82F6', '#10B981', '#8B5CF6', '#EC4899', '#F59E0B'];

  return (
    <div className="flex-1 flex flex-col h-full bg-[var(--bg-main)] overflow-hidden">
      {/* Top Header */}
      <div className="h-14 px-6 border-b border-[var(--border-subtle)] flex items-center justify-between shrink-0 bg-[var(--bg-main)]">
        <div className="flex items-center gap-3">
          <FolderKanban className="w-4 h-4 text-[var(--accent-ember)]" />
          <h1 className="text-[15px] font-medium text-[var(--text-primary)]">Projects</h1>
          <span className="text-[12px] font-mono text-[var(--text-tertiary)]">
            ({projects.length} active workspaces)
          </span>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--accent-ember)] hover:bg-[var(--accent-ember-hover)] text-white text-[13px] font-medium transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Project</span>
        </button>
      </div>

      {/* Main Two-Column Project Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Column: Project Selector List */}
        <div className="w-72 border-r border-[var(--border-subtle)] bg-[var(--bg-secondary)] overflow-y-auto p-3 space-y-1.5 shrink-0 hidden md:block">
          <div className="px-2 py-1.5 text-[11px] font-mono uppercase tracking-wider text-[var(--text-tertiary)]">
            All Workspaces
          </div>

          {projects.map(proj => {
            const isSelected = proj.id === activeProject?.id;
            return (
              <div
                key={proj.id}
                onClick={() => setSelectedProjectId(proj.id)}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-[var(--bg-surface)] border-[var(--border-strong)] shadow-xs'
                    : 'bg-transparent border-transparent hover:bg-[var(--bg-surface-hover)] hover:border-[var(--border-subtle)]'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: proj.color }}
                  />
                  <div className="text-[13.5px] font-medium text-[var(--text-primary)] truncate">
                    {proj.name}
                  </div>
                </div>
                <p className="text-[12px] text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
                  {proj.description}
                </p>
                <div className="flex items-center gap-2 mt-2 text-[10.5px] font-mono text-[var(--text-tertiary)]">
                  <span>{formatRelativeTime(proj.updatedAt)}</span>
                  <span>•</span>
                  <span>{proj.taskCount} tasks</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Selected Project Detail Workspace */}
        {activeProject ? (
          <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-[var(--bg-main)]">
            <div className="max-w-4xl mx-auto space-y-8">
              {/* Project Header Banner */}
              <div className="space-y-3 pb-6 border-b border-[var(--border-subtle)]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-3.5 h-3.5 rounded-full"
                      style={{ backgroundColor: activeProject.color }}
                    />
                    <h2 className="text-2xl font-normal text-[var(--text-primary)]">
                      {activeProject.name}
                    </h2>
                  </div>

                  <button
                    onClick={() => onNewProjectConversation(activeProject.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border-subtle)] hover:border-[var(--accent-ember)] bg-[var(--bg-surface)] text-[12.5px] text-[var(--text-primary)] transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-[var(--accent-ember)]" />
                    <span>Think in Project</span>
                  </button>
                </div>

                <p className="text-[14.5px] text-[var(--text-secondary)] leading-relaxed">
                  {activeProject.description}
                </p>

                {activeProject.contextSnippet && (
                  <div className="p-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[12.5px] font-mono text-[var(--text-secondary)]">
                    <span className="text-[var(--accent-ember)] font-medium">Context Invariant: </span>
                    {activeProject.contextSnippet}
                  </div>
                )}
              </div>

              {/* Project Conversations */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[12px] font-mono uppercase tracking-wider text-[var(--text-tertiary)] flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-[var(--accent-ember)]" />
                    Project Conversations ({projectConversations.length})
                  </span>
                </div>

                {projectConversations.length === 0 ? (
                  <div className="p-4 rounded-xl border border-[var(--border-subtle)] text-[13px] text-[var(--text-tertiary)] text-center">
                    No active thoughts in this project yet. Start a new conversation above.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {projectConversations.map(conv => (
                      <div
                        key={conv.id}
                        onClick={() => onSelectProjectConversation(conv.id)}
                        className="p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:border-[var(--border-strong)] cursor-pointer transition-all flex flex-col justify-between group"
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <h3 className="text-[13.5px] font-medium text-[var(--text-primary)] group-hover:text-[var(--accent-ember)] transition-colors truncate">
                              {conv.title}
                            </h3>
                            <ArrowRight className="w-3.5 h-3.5 text-[var(--text-tertiary)] opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          {conv.summary && (
                            <p className="text-[12px] text-[var(--text-secondary)] line-clamp-2 mt-1">
                              {conv.summary}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-3 text-[11px] font-mono text-[var(--text-tertiary)]">
                          <span>{formatRelativeTime(conv.updatedAt)}</span>
                          <span>•</span>
                          <span>{conv.messageCount} messages</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Project Tasks */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[12px] font-mono uppercase tracking-wider text-[var(--text-tertiary)] flex items-center gap-1.5">
                    <CheckSquare className="w-3.5 h-3.5 text-[var(--accent-ember)]" />
                    Project Tasks ({projectTasks.filter(t => t.status !== 'completed').length} pending)
                  </span>
                </div>

                {projectTasks.length === 0 ? (
                  <div className="p-4 rounded-xl border border-[var(--border-subtle)] text-[13px] text-[var(--text-tertiary)] text-center">
                    No tasks assigned to this project.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {projectTasks.map(task => {
                      const isCompleted = task.status === 'completed';
                      return (
                        <div
                          key={task.id}
                          className="px-4 py-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:border-[var(--border-strong)] transition-all flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <button
                              onClick={() => onToggleTask(task.id)}
                              className="text-[var(--text-tertiary)] hover:text-[var(--accent-ember)] transition-colors shrink-0"
                            >
                              {isCompleted ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                              ) : (
                                <Circle className="w-4 h-4" />
                              )}
                            </button>
                            <span
                              className={`text-[13px] truncate ${
                                isCompleted
                                  ? 'line-through text-[var(--text-tertiary)]'
                                  : 'text-[var(--text-primary)]'
                              }`}
                            >
                              {task.title}
                            </span>
                          </div>

                          <span className="text-[11px] font-mono uppercase text-[var(--accent-ember)] shrink-0 ml-2">
                            {task.priority}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* New Project Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
              <h2 className="text-[15px] font-medium text-[var(--text-primary)]">New Project Workspace</h2>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-[12px] font-mono uppercase text-[var(--text-tertiary)]">Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Distributed Consensus Engine"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-lg text-[13.5px] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-ember)]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[12px] font-mono uppercase text-[var(--text-tertiary)]">Description</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Core objectives and scope..."
                  value={desc}
                  onChange={e => setDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-lg text-[13px] text-[var(--text-primary)] resize-none focus:outline-none focus:border-[var(--accent-ember)]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[12px] font-mono uppercase text-[var(--text-tertiary)]">
                  Context Snippet / Invariants
                </label>
                <input
                  type="text"
                  placeholder="Key technical constraints..."
                  value={contextSnippet}
                  onChange={e => setContextSnippet(e.target.value)}
                  className="w-full px-3 py-2 bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-lg text-[13px] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-ember)]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[12px] font-mono uppercase text-[var(--text-tertiary)]">Color Accent</label>
                <div className="flex gap-2 pt-1">
                  {projectColors.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-6 h-6 rounded-full transition-transform ${
                        color === c ? 'scale-125 ring-2 ring-white/60' : 'opacity-80'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[var(--border-subtle)]">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg text-[13px] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[var(--accent-ember)] hover:bg-[var(--accent-ember-hover)] text-white text-[13px] font-medium"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
