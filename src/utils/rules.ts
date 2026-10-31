import { Task, TaskStatus } from '../types';

export function formatRelativeTime(dateStr: string, now: Date = new Date('2026-10-30T23:14:40-07:00')): string {
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay === 1) return 'Yesterday';
  if (diffDay < 7) return `${diffDay}d ago`;
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function filterTasks(
  tasks: Task[],
  tab: 'all' | 'today' | 'upcoming' | 'completed',
  searchQuery: string = '',
  projectId?: string
): Task[] {
  const query = searchQuery.trim().toLowerCase();

  return tasks.filter(task => {
    // Project filter
    if (projectId && task.projectId !== projectId) {
      return false;
    }

    // Tab filter
    if (tab === 'completed' && task.status !== 'completed') {
      return false;
    }
    if (tab !== 'completed' && task.status === 'completed') {
      return false;
    }

    if (tab === 'today') {
      if (!task.dueDate) return false;
      const due = task.dueDate.split('T')[0];
      const today = '2026-10-30';
      if (due !== today) return false;
    }

    if (tab === 'upcoming') {
      if (!task.dueDate) return true; // untimed tasks can be upcoming
      const due = task.dueDate.split('T')[0];
      const today = '2026-10-30';
      if (due < today) return false;
    }

    // Search query filter
    if (query) {
      const matchTitle = task.title.toLowerCase().includes(query);
      const matchDesc = task.description?.toLowerCase().includes(query) ?? false;
      if (!matchTitle && !matchDesc) return false;
    }

    return true;
  });
}

export function generateSmartTitle(prompt: string): string {
  if (!prompt || !prompt.trim()) return 'New Thought';
  let clean = prompt.trim();
  const prefixRegex = /^(can you\s+|could you\s+|please\s+|help me\s+|i want to\s+|how to\s+|let's\s+)/i;
  while (prefixRegex.test(clean)) {
    clean = clean.replace(prefixRegex, '').trim();
  }
  const firstSentence = clean.split(/[.?!:\n]/)[0].trim();
  if (firstSentence.length <= 45) {
    return firstSentence.charAt(0).toUpperCase() + firstSentence.slice(1);
  }
  const words = firstSentence.split(/\s+/).slice(0, 6).join(' ');
  return words.charAt(0).toUpperCase() + words.slice(1) + '...';
}

export function calculateTaskMetrics(tasks: Task[]): {
  total: number;
  completed: number;
  pending: number;
  percent: number;
} {
  const total = tasks.length;
  if (total === 0) return { total: 0, completed: 0, pending: 0, percent: 0 };
  const completed = tasks.filter(t => t.status === 'completed').length;
  const pending = total - completed;
  const percent = Math.round((completed / total) * 100);
  return { total, completed, pending, percent };
}

export interface MarkdownBlock {
  type: 'paragraph' | 'heading' | 'code' | 'list' | 'quote' | 'table';
  content: string;
  level?: number;
  language?: string;
  items?: string[];
  headers?: string[];
  rows?: string[][];
}

export function parseMarkdownBlocks(text: string): MarkdownBlock[] {
  const blocks: MarkdownBlock[] = [];
  const lines = text.split('\n');
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Code blocks
    if (line.startsWith('```')) {
      const language = line.slice(3).trim() || 'text';
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      blocks.push({
        type: 'code',
        language,
        content: codeLines.join('\n'),
      });
      i++;
      continue;
    }

    // Headings
    if (line.startsWith('#')) {
      const match = line.match(/^(#{1,6})\s+(.*)$/);
      if (match) {
        blocks.push({
          type: 'heading',
          level: match[1].length,
          content: match[2],
        });
        i++;
        continue;
      }
    }

    // Blockquote
    if (line.startsWith('>')) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].startsWith('>')) {
        quoteLines.push(lines[i].replace(/^>\s?/, ''));
        i++;
      }
      blocks.push({
        type: 'quote',
        content: quoteLines.join(' '),
      });
      continue;
    }

    // Unordered or ordered list
    if (line.match(/^(\*|-|\d+\.)\s+/)) {
      const items: string[] = [];
      while (i < lines.length && lines[i].match(/^(\*|-|\d+\.)\s+/)) {
        items.push(lines[i].replace(/^(\*|-|\d+\.)\s+/, ''));
        i++;
      }
      blocks.push({
        type: 'list',
        content: '',
        items,
      });
      continue;
    }

    // Empty lines
    if (!line.trim()) {
      i++;
      continue;
    }

    // Paragraph
    const paraLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !lines[i].startsWith('#') &&
      !lines[i].startsWith('```') &&
      !lines[i].startsWith('>') &&
      !lines[i].match(/^(\*|-|\d+\.)\s+/)
    ) {
      paraLines.push(lines[i]);
      i++;
    }
    if (paraLines.length > 0) {
      blocks.push({
        type: 'paragraph',
        content: paraLines.join('\n'),
      });
    }
  }

  return blocks;
}
