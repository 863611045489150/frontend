import { Conversation, Message, Task, Project, MemoryItem, AppSettings } from '../types';

export const initialProjects: Project[] = [
  {
    id: 'proj-engine',
    name: 'Local Intelligence Engine',
    description: 'On-device embeddings, vector indexing, and local LLM execution pipeline.',
    color: '#E05D26',
    taskCount: 4,
    conversationCount: 3,
    updatedAt: '2026-10-30T21:40:00-07:00',
    contextSnippet: 'Local RocksDB persistent store with SIMD-accelerated cosine similarity search.',
  },
  {
    id: 'proj-desktop',
    name: 'Hearth Desktop v2',
    description: 'Next-generation quiet desktop shell with multi-pane workspace and low-latency rendering.',
    color: '#3B82F6',
    taskCount: 3,
    conversationCount: 4,
    updatedAt: '2026-10-30T19:15:00-07:00',
    contextSnippet: 'Geist typography, 60fps compositor, 0-pill metadata discipline.',
  },
  {
    id: 'proj-brand',
    name: 'Brand Identity & Spec',
    description: 'The philosophy of quiet computing: design tokens, editorial voice, and anti-noise manifesto.',
    color: '#10B981',
    taskCount: 2,
    conversationCount: 2,
    updatedAt: '2026-10-29T16:00:00-07:00',
    contextSnippet: 'Warm ember accent #E05D26, restrained contrast, zero neon gradients.',
  },
  {
    id: 'proj-privacy',
    name: 'Data Privacy Hardening',
    description: 'Zero-telemetry architecture, local-only encrypted memory storage, and audit logs.',
    color: '#8B5CF6',
    taskCount: 2,
    conversationCount: 1,
    updatedAt: '2026-10-28T14:20:00-07:00',
    contextSnippet: 'Client-side AES-GCM-256 for persistent workspace state.',
  },
];

export const initialConversations: Conversation[] = [
  {
    id: 'conv-sync',
    title: 'Distributed State Synchronization Architecture',
    createdAt: '2026-10-30T22:30:00-07:00',
    updatedAt: '2026-10-30T22:55:00-07:00',
    projectId: 'proj-engine',
    summary: 'Evaluating conflict-free replicated data types vs server-authoritative vector clocks for offline-first synchronization.',
    tags: ['Architecture', 'Distributed Systems', 'CRDT'],
    messageCount: 4,
    pinned: true,
  },
  {
    id: 'conv-rate-limit',
    title: 'Sliding Window Token Bucket Rate Limiter',
    createdAt: '2026-10-30T18:10:00-07:00',
    updatedAt: '2026-10-30T18:45:00-07:00',
    projectId: 'proj-engine',
    summary: 'Memory-bounded token bucket with microsecond precision and atomic compare-and-swap.',
    tags: ['Algorithms', 'Concurrency'],
    messageCount: 3,
  },
  {
    id: 'conv-brand',
    title: 'Brand Philosophy: Quiet Computing Manifesto',
    createdAt: '2026-10-29T14:15:00-07:00',
    updatedAt: '2026-10-29T15:20:00-07:00',
    projectId: 'proj-brand',
    summary: 'Establishing the core principle: Ask first. Answer once. Zero conversational filler.',
    tags: ['Design', 'Philosophy'],
    messageCount: 2,
  },
  {
    id: 'conv-perf',
    title: 'Zero-Allocation Virtualized List Profiling',
    createdAt: '2026-10-27T10:00:00-07:00',
    updatedAt: '2026-10-27T11:40:00-07:00',
    projectId: 'proj-desktop',
    summary: 'Benchmarking 50,000 workspace items with sub-millisecond scrolling latency.',
    tags: ['Performance', 'Frontend'],
    messageCount: 2,
  },
];

export const initialMessages: Record<string, Message[]> = {
  'conv-sync': [
    {
      id: 'msg-sync-1',
      conversationId: 'conv-sync',
      role: 'user',
      content: 'I want to design the local-first state synchronization engine for Hearth. We need offline editing with eventual consistency across desktop instances without locking.',
      timestamp: '2026-10-30T22:30:15-07:00',
    },
    {
      id: 'msg-sync-2',
      conversationId: 'conv-sync',
      role: 'assistant',
      content: 'To give you the most precise architecture without making unfounded assumptions, I need to clarify your network topology and conflict resolution priority.',
      timestamp: '2026-10-30T22:30:22-07:00',
      clarification: {
        id: 'clarif-sync-1',
        question: 'Which conflict resolution model best matches your multi-device consistency target?',
        options: [
          'State-based CRDT (Pn-Counter & LWW-Element-Set) for zero-coordination merges',
          'Operation-based replication with centralized ordering server',
          'Append-only log with deterministic branch rebasing',
        ],
        selectedOption: 'State-based CRDT (Pn-Counter & LWW-Element-Set) for zero-coordination merges',
        isAnswered: true,
      },
      status: 'complete',
    },
    {
      id: 'msg-sync-3',
      conversationId: 'conv-sync',
      role: 'user',
      content: 'State-based CRDTs with LWW-Element-Set for document attributes, and causal trees for text blocks.',
      timestamp: '2026-10-30T22:32:00-07:00',
    },
    {
      id: 'msg-sync-4',
      conversationId: 'conv-sync',
      role: 'assistant',
      content: `Here is the architectural specification for Hearth's offline-first CRDT synchronization engine.

### Core Invariants

1. **Monotonic Convergence**: Every peer replica converges to identical state upon exchanging delta payloads, regardless of delivery order.
2. **Causal Ordering**: Vector clocks accompany every mutation to preserve causal relationships between concurrent workspace operations.
3. **Bounded Delta Garbage Collection**: Tombstones are retained only until the global watermark vector clock advances past their generation timestamp.

### Delta Merging Implementation

\`\`\`typescript
export interface VectorClock {
  readonly [peerId: string]: number;
}

export interface CRDTEntry<T> {
  readonly id: string;
  readonly value: T;
  readonly clock: VectorClock;
  readonly timestamp: number;
  readonly deleted: boolean;
}

export class LWWElementSet<T> {
  private readonly entries = new Map<string, CRDTEntry<T>>();

  constructor(private readonly peerId: string) {}

  public set(id: string, value: T, clock: VectorClock): void {
    const existing = this.entries.get(id);
    const now = Date.now();
    if (!existing || now > existing.timestamp) {
      this.entries.set(id, {
        id,
        value,
        clock,
        timestamp: now,
        deleted: false,
      });
    }
  }

  public merge(remote: CRDTEntry<T>[]): void {
    for (const entry of remote) {
      const local = this.entries.get(entry.id);
      if (!local || entry.timestamp > local.timestamp) {
        this.entries.set(entry.id, entry);
      }
    }
  }

  public snapshot(): T[] {
    return Array.from(this.entries.values())
      .filter(e => !e.deleted)
      .map(e => e.value);
  }
}
\`\`\`

### Structural Tradeoffs

* **Bandwidth footprint**: State-based sync sends entire sets unless compacted into delta states. Use delta-mutators for production payloads.
* **Tombstone accumulation**: Maintain a compaction epoch every 24 hours when all registered peer nodes acknowledge the watermark.

> "A quiet system handles synchronization deterministically in the background, without modal alerts or lockouts."`,
      timestamp: '2026-10-30T22:33:10-07:00',
      status: 'complete',
      citations: [
        {
          id: 'cit-1',
          title: 'Conflict-Free Replicated Data Types (Shapiro et al.)',
          source: 'INRIA Research Report RR-7687',
          snippet: 'Comprehensive analysis of delta-based state CRDTs and commutative operations.',
        },
        {
          id: 'cit-2',
          title: 'Memory Preference #4',
          source: 'User Memory: Preferred Stack',
          snippet: 'Enforce strict immutable types and zero unnecessary runtime dependencies.',
        },
      ],
    },
  ],
  'conv-rate-limit': [
    {
      id: 'msg-rl-1',
      conversationId: 'conv-rate-limit',
      role: 'user',
      content: 'Can you sketch a high-performance token bucket rate limiter in TypeScript for our local RPC daemon?',
      timestamp: '2026-10-30T18:10:00-07:00',
    },
    {
      id: 'msg-rl-2',
      conversationId: 'conv-rate-limit',
      role: 'assistant',
      content: `Here is a zero-dependency token bucket rate limiter using lazy token replenishment:

\`\`\`typescript
export class TokenBucket {
  private tokens: number;
  private lastRefill: number;

  constructor(
    private readonly capacity: number,
    private readonly refillRatePerSecond: number
  ) {
    this.tokens = capacity;
    this.lastRefill = performance.now();
  }

  public consume(tokensNeeded: number = 1): boolean {
    this.refill();
    if (this.tokens >= tokensNeeded) {
      this.tokens -= tokensNeeded;
      return true;
    }
    return false;
  }

  private refill(): void {
    const now = performance.now();
    const elapsedSeconds = (now - this.lastRefill) / 1000;
    this.tokens = Math.min(this.capacity, this.tokens + elapsedSeconds * this.refillRatePerSecond);
    this.lastRefill = now;
  }
}
\`\`\`

This avoids background intervals and consumes negligible CPU while idling.`,
      timestamp: '2026-10-30T18:11:05-07:00',
      status: 'complete',
    },
  ],
  'conv-brand': [
    {
      id: 'msg-brand-1',
      conversationId: 'conv-brand',
      role: 'user',
      content: 'Summarize the core philosophical difference between Hearth and typical conversational AI apps.',
      timestamp: '2026-10-29T14:15:00-07:00',
    },
    {
      id: 'msg-brand-2',
      conversationId: 'conv-brand',
      role: 'assistant',
      content: `### The Hearth Stance

| Traditional Conversational AI | Hearth Quiet Workspace |
| :--- | :--- |
| Guess immediately with generic answers | Ask first. Answer once. |
| Chat history as an infinite vertical graveyard | Structured workspace linking tasks, docs, and memory |
| Conversational pleasantries and filler text | Dense, quiet, high-signal technical precision |
| Black-box auto-collected telemetry | User-audited, locally controlled memory store |
| Bright neon accents and glowing badges | Restrained warm ember tone with deep monochrome surfaces |

> "Silence is not the absence of thought; it is the environment where serious thinking happens."`,
      timestamp: '2026-10-29T14:16:30-07:00',
      status: 'complete',
    },
  ],
  'conv-perf': [
    {
      id: 'msg-perf-1',
      conversationId: 'conv-perf',
      role: 'user',
      content: 'How should we virtualize the 50,000 item task tree to guarantee 60fps scrolling?',
      timestamp: '2026-10-27T10:00:00-07:00',
    },
    {
      id: 'msg-perf-2',
      conversationId: 'conv-perf',
      role: 'assistant',
      content: `Use a fixed row-height virtualizer with a calculated window offset:

1. **Calculate slice range**: \`startIndex = Math.floor(scrollTop / rowHeight)\`, \`endIndex = startIndex + visibleCount + overscan\`.
2. **Transform container**: Apply \`transform: translateY(startIndex * rowHeight px)\` so child DOM node count remains constant (~30 elements).
3. **Zero garbage collection**: Avoid allocating new objects or array slices inside \`onScroll\`. Store offsets in flat typed arrays.`,
      timestamp: '2026-10-27T10:01:20-07:00',
      status: 'complete',
    },
  ],
};

export const initialTasks: Task[] = [
  {
    id: 'task-1',
    title: 'Implement delta compression for LWW-Element-Set CRDT',
    description: 'Compress state payloads by exchanging only entries created after the target peer’s latest watermark clock.',
    status: 'in_progress',
    priority: 'high',
    dueDate: '2026-10-31T18:00:00',
    projectId: 'proj-engine',
    conversationId: 'conv-sync',
    createdAt: '2026-10-30T22:35:00-07:00',
  },
  {
    id: 'task-2',
    title: 'Formalize vector clock garbage collection watermark',
    description: 'Ensure offline peers do not cause boundless tombstone growth beyond 7 days of disconnection.',
    status: 'pending',
    priority: 'urgent',
    dueDate: '2026-10-30T23:59:00',
    projectId: 'proj-engine',
    conversationId: 'conv-sync',
    createdAt: '2026-10-30T22:36:00-07:00',
  },
  {
    id: 'task-3',
    title: 'Benchmark SQLite FTS5 vector hybrid search latency',
    description: 'Measure p99 query time over 250,000 document chunks using sqlite-vec.',
    status: 'pending',
    priority: 'medium',
    dueDate: '2026-11-02T12:00:00',
    projectId: 'proj-engine',
    createdAt: '2026-10-30T15:20:00-07:00',
  },
  {
    id: 'task-4',
    title: 'Audit keyboard shortcut map against macOS standard menu items',
    description: 'Ensure Cmd+K, Cmd+J, and Cmd+Shift+P do not collide with OS system accessibility hooks.',
    status: 'completed',
    priority: 'low',
    dueDate: '2026-10-29T17:00:00',
    projectId: 'proj-desktop',
    createdAt: '2026-10-28T09:00:00-07:00',
  },
  {
    id: 'task-5',
    title: 'Review brand contrast ratios for warm ember accent (#E05D26)',
    description: 'Validate minimum 4.5:1 text contrast on #0A0A0A dark and #FFFFFF light backgrounds.',
    status: 'completed',
    priority: 'medium',
    projectId: 'proj-brand',
    conversationId: 'conv-brand',
    createdAt: '2026-10-29T16:00:00-07:00',
  },
  {
    id: 'task-6',
    title: 'Eliminate all telemetry endpoints from build bundle',
    description: 'Verify network tab has zero outbound pings when navigating between views or editing memory.',
    status: 'pending',
    priority: 'high',
    dueDate: '2026-11-01T10:00:00',
    projectId: 'proj-privacy',
    createdAt: '2026-10-28T14:30:00-07:00',
  },
];

export const initialMemories: MemoryItem[] = [
  {
    id: 'mem-1',
    title: 'Preferred Architecture & Code Style',
    content: 'User prefers modern TypeScript, strict null checks, zero conversational boilerplate, and functional composition over class hierarchies.',
    category: 'preference',
    createdAt: '2026-10-25T11:00:00-07:00',
    lastUsed: '2026-10-30T22:33:10-07:00',
  },
  {
    id: 'mem-2',
    title: 'Offline-First Invariant',
    content: 'All Hearth core features must operate fully offline with local-first persistence before network synchronization.',
    category: 'fact',
    createdAt: '2026-10-26T14:20:00-07:00',
    lastUsed: '2026-10-30T22:30:22-07:00',
  },
  {
    id: 'mem-3',
    title: 'Typography & Visual Discipline',
    content: 'Use Geist & Geist Mono exclusively. No static pill enclosures for metadata; render metadata as clean, unboxed text.',
    category: 'preference',
    createdAt: '2026-10-28T10:15:00-07:00',
    lastUsed: '2026-10-30T19:15:00-07:00',
  },
  {
    id: 'mem-4',
    title: 'Local Storage Encryption Target',
    content: 'Workspace state is committed locally to AES-GCM-256 encrypted storage blocks.',
    category: 'project',
    createdAt: '2026-10-28T15:00:00-07:00',
    lastUsed: '2026-10-29T12:00:00-07:00',
  },
];

export const initialSettings: AppSettings = {
  theme: 'dark',
  clarificationStyle: 'aggressive',
  reasoningDepth: 'deep',
  userName: 'Alex Chen',
  workspaceName: 'Hearth Studio',
  soundEnabled: false,
  autoExtractMemory: true,
  telemetryEnabled: false,
  fontSize: 'default',
};

export const promptSuggestions = [
  {
    title: 'Think through an idea',
    desc: 'Clarify tradeoffs, causal assumptions, and failure modes.',
    prompt: 'I want to think through the tradeoffs of building a local-first search index vs embedding server.',
  },
  {
    title: 'Create a plan',
    desc: 'Break down an engineering milestone into deterministic phases.',
    prompt: 'Help me create an implementation plan for zero-downtime database replication.',
  },
  {
    title: 'Break down a task',
    desc: 'Deconstruct a complex requirement into prioritized, testable items.',
    prompt: 'Break down our offline CRDT synchronization engine into actionable development tasks.',
  },
  {
    title: 'Summarize something',
    desc: 'Extract key decisions, arguments, and open questions without noise.',
    prompt: 'Summarize the differences between Raft consensus and Paxos in multi-datacenter environments.',
  },
  {
    title: 'Explore a project',
    desc: 'Deep-dive into architecture, open tasks, and active context.',
    prompt: 'What are the current open tasks and architecture constraints for the Local Intelligence Engine?',
  },
];
