import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatRelativeTime,
  filterTasks,
  generateSmartTitle,
  calculateTaskMetrics,
  parseMarkdownBlocks,
} from './rules';
import { Task } from '../types';

test('formatRelativeTime returns accurate human-friendly strings', () => {
  const referenceTime = new Date('2026-10-30T23:14:40-07:00');
  
  assert.equal(formatRelativeTime('2026-10-30T23:14:20-07:00', referenceTime), 'Just now');
  assert.equal(formatRelativeTime('2026-10-30T23:00:00-07:00', referenceTime), '14m ago');
  assert.equal(formatRelativeTime('2026-10-30T19:14:40-07:00', referenceTime), '4h ago');
  assert.equal(formatRelativeTime('2026-10-29T23:14:40-07:00', referenceTime), 'Yesterday');
  assert.equal(formatRelativeTime('2026-10-26T23:14:40-07:00', referenceTime), '4d ago');
});

test('generateSmartTitle cleans prefixes and limits length', () => {
  assert.equal(
    generateSmartTitle('Can you help me design a sliding window rate limiter?'),
    'Design a sliding window rate limiter'
  );
  assert.equal(
    generateSmartTitle('Please explain raft consensus protocol tradeoffs'),
    'Explain raft consensus protocol tradeoffs'
  );
  assert.equal(
    generateSmartTitle(''),
    'New Thought'
  );
});

test('calculateTaskMetrics correctly tallies counts and percentage', () => {
  const tasks: Task[] = [
    { id: '1', title: 'Task 1', status: 'completed', priority: 'high', createdAt: '' },
    { id: '2', title: 'Task 2', status: 'pending', priority: 'medium', createdAt: '' },
    { id: '3', title: 'Task 3', status: 'in_progress', priority: 'low', createdAt: '' },
    { id: '4', title: 'Task 4', status: 'completed', priority: 'urgent', createdAt: '' },
  ];
  const metrics = calculateTaskMetrics(tasks);
  assert.equal(metrics.total, 4);
  assert.equal(metrics.completed, 2);
  assert.equal(metrics.pending, 2);
  assert.equal(metrics.percent, 50);
});

test('filterTasks handles status and search query correctly', () => {
  const tasks: Task[] = [
    { id: '1', title: 'Optimize RocksDB flush', status: 'pending', priority: 'high', createdAt: '', dueDate: '2026-10-30T12:00:00' },
    { id: '2', title: 'Draft schema migration', status: 'completed', priority: 'medium', createdAt: '' },
    { id: '3', title: 'Security review', status: 'in_progress', priority: 'urgent', createdAt: '', projectId: 'proj-1' },
  ];

  const allActive = filterTasks(tasks, 'all');
  assert.equal(allActive.length, 2); // tasks 1 and 3

  const completed = filterTasks(tasks, 'completed');
  assert.equal(completed.length, 1);
  assert.equal(completed[0].id, '2');

  const searched = filterTasks(tasks, 'all', 'RocksDB');
  assert.equal(searched.length, 1);
  assert.equal(searched[0].id, '1');
});

test('parseMarkdownBlocks extracts code, headings and lists properly', () => {
  const raw = `# Architecture Overview
Here is a paragraph describing the design.

\`\`\`typescript
const worker = new Worker();
\`\`\`

* First item
* Second item
`;

  const blocks = parseMarkdownBlocks(raw);
  assert.equal(blocks.length, 4);
  assert.equal(blocks[0].type, 'heading');
  assert.equal(blocks[0].content, 'Architecture Overview');
  assert.equal(blocks[1].type, 'paragraph');
  assert.equal(blocks[2].type, 'code');
  assert.equal(blocks[2].language, 'typescript');
  assert.equal(blocks[3].type, 'list');
  assert.equal(blocks[3].items?.length, 2);
});
