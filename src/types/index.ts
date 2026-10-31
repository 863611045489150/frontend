export type ActiveView = 'home' | 'chat' | 'tasks' | 'projects' | 'memory' | 'settings';

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'pending' | 'in_progress' | 'completed';

export interface Citation {
  id: string;
  title: string;
  source: string;
  snippet: string;
  url?: string;
}

export interface ClarificationData {
  id: string;
  question: string;
  options: string[];
  selectedOption?: string;
  customInput?: string;
  isAnswered: boolean;
}

export interface Message {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  citations?: Citation[];
  clarification?: ClarificationData;
  status?: 'complete' | 'streaming' | 'thinking';
  thinkingContent?: string;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  projectId?: string;
  summary?: string;
  tags?: string[];
  messageCount: number;
  pinned?: boolean;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  projectId?: string;
  conversationId?: string;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  color: string;
  taskCount: number;
  conversationCount: number;
  updatedAt: string;
  contextSnippet?: string;
}

export interface MemoryItem {
  id: string;
  title: string;
  content: string;
  category: 'preference' | 'context' | 'fact' | 'project';
  createdAt: string;
  lastUsed?: string;
}

export interface AppSettings {
  theme: 'dark' | 'light';
  clarificationStyle: 'aggressive' | 'balanced' | 'minimal';
  reasoningDepth: 'standard' | 'deep';
  userName: string;
  workspaceName: string;
  soundEnabled: boolean;
  autoExtractMemory: boolean;
  telemetryEnabled: boolean;
  fontSize: 'compact' | 'default' | 'comfortable';
}
