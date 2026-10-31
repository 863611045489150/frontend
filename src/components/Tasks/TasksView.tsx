import React, { useState } from 'react';
import {
  CheckSquare,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Circle,
  Calendar,
  Trash2,
  Edit2,
  X,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { Task, Project, TaskPriority, TaskStatus } from '../../types';
import { filterTasks, calculateTaskMetrics } from '../../utils/rules';

interface TasksViewProps {
  tasks: Task[];
  projects: Project[];
  onToggleTask: (taskId: string) => void;
  onAddTask: (task: Partial<Task>) => void;
  onDeleteTask: (taskId: string) => void;
  onUpdateTask: (task: Task) => void;
}

export const TasksView: React.FC<TasksViewProps> = ({
  tasks,
  projects,
  onToggleTask,
  onAddTask,
  onDeleteTask,
  onUpdateTask,
}) => {
  const [tab, setTab] = useState<'all' | 'today' | 'upcoming' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Form states for creating/editing
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formPriority, setFormPriority] = useState<TaskPriority>('medium');
  const [formProjectId, setFormProjectId] = useState('');
  const [formDueDate, setFormDueDate] = useState('');

  const filtered = filterTasks(tasks, tab, searchQuery, selectedProjectId || undefined);
  const metrics = calculateTaskMetrics(tasks);

  const openCreateModal = () => {
    setEditingTask(null);
    setFormTitle('');
    setFormDesc('');
    setFormPriority('medium');
    setFormProjectId(projects[0]?.id || '');
    setFormDueDate('2026-10-31');
    setIsModalOpen(true);
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setFormTitle(task.title);
    setFormDesc(task.description || '');
    setFormPriority(task.priority);
    setFormProjectId(task.projectId || '');
    setFormDueDate(task.dueDate ? task.dueDate.split('T')[0] : '');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    if (editingTask) {
      onUpdateTask({
        ...editingTask,
        title: formTitle.trim(),
        description: formDesc.trim() || undefined,
        priority: formPriority,
        projectId: formProjectId || undefined,
        dueDate: formDueDate ? `${formDueDate}T18:00:00` : undefined,
      });
    } else {
      onAddTask({
        title: formTitle.trim(),
        description: formDesc.trim() || undefined,
        status: 'pending',
        priority: formPriority,
        projectId: formProjectId || undefined,
        dueDate: formDueDate ? `${formDueDate}T18:00:00` : undefined,
      });
    }

    setIsModalOpen(false);
  };

  const getPriorityStyle = (priority: TaskPriority) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-500 font-medium';
      case 'high':
        return 'text-[var(--accent-ember)] font-medium';
      case 'medium':
        return 'text-yellow-500';
      case 'low':
      default:
        return 'text-[var(--text-tertiary)]';
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[var(--bg-main)] overflow-hidden">
      {/* Top Header */}
      <div className="h-14 px-6 border-b border-[var(--border-subtle)] flex items-center justify-between shrink-0 bg-[var(--bg-main)]">
        <div className="flex items-center gap-3">
          <CheckSquare className="w-4 h-4 text-[var(--accent-ember)]" />
          <h1 className="text-[15px] font-medium text-[var(--text-primary)]">Tasks</h1>
          <span className="text-[12px] font-mono text-[var(--text-tertiary)]">
            ({metrics.completed}/{metrics.total} complete • {metrics.percent}%)
          </span>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--accent-ember)] hover:bg-[var(--accent-ember-hover)] text-white text-[13px] font-medium transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Task</span>
        </button>
      </div>

      {/* Filter and Tab Bar */}
      <div className="p-4 sm:px-6 border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)] flex flex-wrap items-center justify-between gap-3">
        {/* Tabs */}
        <div className="flex items-center gap-1 bg-[var(--bg-main)] p-1 rounded-lg border border-[var(--border-subtle)]">
          {(['all', 'today', 'upcoming', 'completed'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-1 rounded text-[12px] font-medium capitalize transition-all ${
                tab === t
                  ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Search & Project Filter */}
        <div className="flex items-center gap-2 flex-1 max-w-md justify-end">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[var(--text-tertiary)]" />
            <input
              type="text"
              placeholder="Filter tasks..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-lg text-[12.5px] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent-ember)]"
            />
          </div>

          <select
            value={selectedProjectId}
            onChange={e => setSelectedProjectId(e.target.value)}
            className="px-2.5 py-1.5 bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-lg text-[12px] text-[var(--text-secondary)] focus:outline-none focus:border-[var(--accent-ember)]"
          >
            <option value="">All Projects</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Task List (Clean list-first design as specified) */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="max-w-4xl mx-auto space-y-2">
          {filtered.length === 0 ? (
            <div className="py-16 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-[var(--text-tertiary)] mx-auto opacity-50" />
              <div className="text-[14px] font-medium text-[var(--text-secondary)]">No tasks found</div>
              <p className="text-[12px] text-[var(--text-tertiary)]">
                {searchQuery ? 'Try clearing your search query' : 'All clear. Ready for your next thought.'}
              </p>
            </div>
          ) : (
            filtered.map(task => {
              const isCompleted = task.status === 'completed';
              const project = projects.find(p => p.id === task.projectId);

              return (
                <div
                  key={task.id}
                  className="group px-4 py-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:border-[var(--border-strong)] transition-all flex items-start sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                    <button
                      onClick={() => onToggleTask(task.id)}
                      className="mt-0.5 sm:mt-0 text-[var(--text-tertiary)] hover:text-[var(--accent-ember)] transition-colors shrink-0"
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Circle className="w-4 h-4" />
                      )}
                    </button>

                    <div className="min-w-0 flex-1 space-y-0.5">
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <span
                          className={`text-[13.5px] font-medium ${
                            isCompleted
                              ? 'line-through text-[var(--text-tertiary)]'
                              : 'text-[var(--text-primary)]'
                          }`}
                        >
                          {task.title}
                        </span>

                        {project && (
                          <span className="text-[11px] font-mono text-[var(--text-tertiary)] flex items-center gap-1">
                            <span
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ backgroundColor: project.color }}
                            />
                            {project.name}
                          </span>
                        )}
                      </div>

                      {task.description && (
                        <p className="text-[12px] text-[var(--text-secondary)] line-clamp-1">
                          {task.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Task Metadata & Actions */}
                  <div className="flex items-center gap-3 text-[12px] font-mono shrink-0">
                    <span className={`uppercase text-[11px] ${getPriorityStyle(task.priority)}`}>
                      {task.priority}
                    </span>

                    {task.dueDate && (
                      <span className="text-[11px] text-[var(--text-tertiary)] hidden sm:flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{task.dueDate.split('T')[0]}</span>
                      </span>
                    )}

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEditModal(task)}
                        className="p-1 rounded text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-main)]"
                        title="Edit task"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteTask(task.id)}
                        className="p-1 rounded text-[var(--text-tertiary)] hover:text-red-400 hover:bg-[var(--bg-main)]"
                        title="Delete task"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Create / Edit Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
              <h2 className="text-[15px] font-medium text-[var(--text-primary)]">
                {editingTask ? 'Edit Task' : 'New Workspace Task'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-[12px] font-mono uppercase text-[var(--text-tertiary)]">Title</label>
                <input
                  type="text"
                  required
                  placeholder="Task title..."
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-lg text-[13.5px] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-ember)]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[12px] font-mono uppercase text-[var(--text-tertiary)]">Description (optional)</label>
                <textarea
                  rows={2}
                  placeholder="Additional context or constraints..."
                  value={formDesc}
                  onChange={e => setFormDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-lg text-[13px] text-[var(--text-primary)] resize-none focus:outline-none focus:border-[var(--accent-ember)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[12px] font-mono uppercase text-[var(--text-tertiary)]">Priority</label>
                  <select
                    value={formPriority}
                    onChange={e => setFormPriority(e.target.value as TaskPriority)}
                    className="w-full px-3 py-2 bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-lg text-[13px] text-[var(--text-primary)] focus:outline-none"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[12px] font-mono uppercase text-[var(--text-tertiary)]">Project</label>
                  <select
                    value={formProjectId}
                    onChange={e => setFormProjectId(e.target.value)}
                    className="w-full px-3 py-2 bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-lg text-[13px] text-[var(--text-primary)] focus:outline-none"
                  >
                    <option value="">No Project</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[12px] font-mono uppercase text-[var(--text-tertiary)]">Due Date</label>
                <input
                  type="date"
                  value={formDueDate}
                  onChange={e => setFormDueDate(e.target.value)}
                  className="w-full px-3 py-2 bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-lg text-[13px] text-[var(--text-primary)] focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[var(--border-subtle)]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg text-[13px] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[var(--accent-ember)] hover:bg-[var(--accent-ember-hover)] text-white text-[13px] font-medium"
                >
                  {editingTask ? 'Save Changes' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
