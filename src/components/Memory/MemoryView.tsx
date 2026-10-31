import React, { useState } from 'react';
import {
  BrainCircuit,
  Plus,
  Search,
  Shield,
  Edit2,
  Trash2,
  X,
  Sparkles,
  Info,
  Clock,
} from 'lucide-react';
import { MemoryItem } from '../../types';
import { formatRelativeTime } from '../../utils/rules';

interface MemoryViewProps {
  memories: MemoryItem[];
  onAddMemory: (memory: Partial<MemoryItem>) => void;
  onUpdateMemory: (memory: MemoryItem) => void;
  onDeleteMemory: (id: string) => void;
  onClearAll: () => void;
}

export const MemoryView: React.FC<MemoryViewProps> = ({
  memories,
  onAddMemory,
  onUpdateMemory,
  onDeleteMemory,
  onClearAll,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMemory, setEditingMemory] = useState<MemoryItem | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<'preference' | 'context' | 'fact' | 'project'>('preference');

  const filtered = memories.filter(m => {
    if (activeCategory !== 'all' && m.category !== activeCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return m.title.toLowerCase().includes(q) || m.content.toLowerCase().includes(q);
    }
    return true;
  });

  const openCreateModal = () => {
    setEditingMemory(null);
    setTitle('');
    setContent('');
    setCategory('preference');
    setIsModalOpen(true);
  };

  const openEditModal = (mem: MemoryItem) => {
    setEditingMemory(mem);
    setTitle(mem.title);
    setContent(mem.content);
    setCategory(mem.category);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    if (editingMemory) {
      onUpdateMemory({
        ...editingMemory,
        title: title.trim(),
        content: content.trim(),
        category,
      });
    } else {
      onAddMemory({
        title: title.trim(),
        content: content.trim(),
        category,
      });
    }
    setIsModalOpen(false);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[var(--bg-main)] overflow-hidden">
      {/* Header */}
      <div className="h-14 px-6 border-b border-[var(--border-subtle)] flex items-center justify-between shrink-0 bg-[var(--bg-main)]">
        <div className="flex items-center gap-3">
          <BrainCircuit className="w-4 h-4 text-[var(--accent-ember)]" />
          <h1 className="text-[15px] font-medium text-[var(--text-primary)]">User-Controlled Memory</h1>
          <span className="text-[12px] font-mono text-[var(--text-tertiary)]">
            ({memories.length} entries)
          </span>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--accent-ember)] hover:bg-[var(--accent-ember-hover)] text-white text-[13px] font-medium transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Memory</span>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* User-Controlled Principle Banner */}
          <div className="p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] space-y-2">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-[var(--accent-ember)]" />
              <span className="text-[13px] font-medium text-[var(--text-primary)]">
                You own what Hearth knows.
              </span>
            </div>
            <p className="text-[12.5px] text-[var(--text-secondary)] leading-relaxed">
              Unlike black-box chat platforms that covertly profile user sessions, Hearth only remembers items that you explicitly verify or save. Memory entries are local, inspectable, fully editable, and immediately purgable.
            </p>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1 bg-[var(--bg-surface)] p-1 rounded-lg border border-[var(--border-subtle)]">
              {(['all', 'preference', 'context', 'fact', 'project'] as const).map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1 rounded text-[12px] font-medium capitalize transition-all ${
                    activeCategory === cat
                      ? 'bg-[var(--bg-secondary)] text-[var(--text-primary)] shadow-xs'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[var(--text-tertiary)]" />
              <input
                type="text"
                placeholder="Search memories..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-[12.5px] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent-ember)]"
              />
            </div>
          </div>

          {/* Memory Entries Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map(mem => (
              <div
                key={mem.id}
                className="group p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:border-[var(--border-strong)] transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-[13.5px] font-medium text-[var(--text-primary)]">
                      {mem.title}
                    </h3>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--accent-ember)] shrink-0">
                      {mem.category}
                    </span>
                  </div>
                  <p className="text-[12.5px] text-[var(--text-secondary)] leading-relaxed">
                    {mem.content}
                  </p>
                </div>

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-[var(--border-subtle)] text-[11px] font-mono text-[var(--text-tertiary)]">
                  <span>
                    {mem.lastUsed ? `Used ${formatRelativeTime(mem.lastUsed)}` : `Added ${formatRelativeTime(mem.createdAt)}`}
                  </span>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEditModal(mem)}
                      className="p-1 rounded hover:text-[var(--text-primary)]"
                      title="Edit memory"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteMemory(mem.id)}
                      className="p-1 rounded hover:text-red-400"
                      title="Delete memory"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="py-16 text-center text-[var(--text-tertiary)] text-[13px]">
              No memories match your query.
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Memory Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
              <h2 className="text-[15px] font-medium text-[var(--text-primary)]">
                {editingMemory ? 'Edit Memory Entry' : 'New Memory Entry'}
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
                  placeholder="e.g. Preferred Coding Style"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-lg text-[13.5px] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-ember)]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[12px] font-mono uppercase text-[var(--text-tertiary)]">Content</label>
                <textarea
                  rows={3}
                  required
                  placeholder="The exact fact, constraint, or preference Hearth must retain..."
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  className="w-full px-3 py-2 bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-lg text-[13px] text-[var(--text-primary)] resize-none focus:outline-none focus:border-[var(--accent-ember)]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[12px] font-mono uppercase text-[var(--text-tertiary)]">Category</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as any)}
                  className="w-full px-3 py-2 bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-lg text-[13px] text-[var(--text-primary)] focus:outline-none"
                >
                  <option value="preference">User Preference</option>
                  <option value="context">Important Context</option>
                  <option value="fact">Technical Fact</option>
                  <option value="project">Project Invariant</option>
                </select>
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
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
