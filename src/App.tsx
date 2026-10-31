import React, { useState, useEffect } from 'react';
import {
  initialConversations,
  initialMessages,
  initialTasks,
  initialProjects,
  initialMemories,
  initialSettings,
} from './data/mockData';
import {
  ActiveView,
  Conversation,
  Message,
  Task,
  Project,
  MemoryItem,
  AppSettings,
  ClarificationData,
} from './types';
import { Sidebar } from './components/Sidebar/Sidebar';
import { AppHeader } from './components/Header/AppHeader';
import { ContextPanel } from './components/ContextPanel/ContextPanel';
import { HomeDashboard } from './components/Home/HomeDashboard';
import { ChatWorkspace } from './components/Chat/ChatWorkspace';
import { TasksView } from './components/Tasks/TasksView';
import { ProjectsView } from './components/Projects/ProjectsView';
import { MemoryView } from './components/Memory/MemoryView';
import { SettingsView } from './components/Settings/SettingsView';
import { CommandPalette } from './components/CommandPalette/CommandPalette';
import { generateSmartTitle } from './utils/rules';

export default function App() {
  // Persistence with localStorage fallback
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    const saved = localStorage.getItem('hearth_conversations');
    return saved ? JSON.parse(saved) : initialConversations;
  });

  const [messages, setMessages] = useState<Record<string, Message[]>>(() => {
    const saved = localStorage.getItem('hearth_messages');
    return saved ? JSON.parse(saved) : initialMessages;
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('hearth_tasks');
    return saved ? JSON.parse(saved) : initialTasks;
  });

  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem('hearth_projects');
    return saved ? JSON.parse(saved) : initialProjects;
  });

  const [memories, setMemories] = useState<MemoryItem[]>(() => {
    const saved = localStorage.getItem('hearth_memories');
    return saved ? JSON.parse(saved) : initialMemories;
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('hearth_settings');
    return saved ? JSON.parse(saved) : initialSettings;
  });

  const [currentView, setCurrentView] = useState<ActiveView>('home');
  const [activeConversationId, setActiveConversationId] = useState<string>('conv-sync');

  // UI Panels
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth >= 1200 : true
  );
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);

  // Sync theme with DOM
  useEffect(() => {
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('hearth_settings', JSON.stringify(settings));
  }, [settings.theme]);

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('hearth_conversations', JSON.stringify(conversations));
  }, [conversations]);

  useEffect(() => {
    localStorage.setItem('hearth_messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('hearth_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('hearth_projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('hearth_memories', JSON.stringify(memories));
  }, [memories]);

  // Keyboard shortcuts (Cmd+K, Cmd+N, Cmd+\)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCmdOrCtrl = e.metaKey || e.ctrlKey;
      if (isCmdOrCtrl && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      } else if (isCmdOrCtrl && e.key === 'n') {
        e.preventDefault();
        handleNewConversation();
      } else if (isCmdOrCtrl && e.key === '\\') {
        e.preventDefault();
        setIsSidebarCollapsed(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const activeConversation = conversations.find(c => c.id === activeConversationId);
  const activeConversationMessages = activeConversationId ? messages[activeConversationId] || [] : [];

  // --- Handlers ---

  const handleNewConversation = (projectId?: string) => {
    const newId = `conv-${Date.now()}`;
    const newConv: Conversation = {
      id: newId,
      title: 'New Thought',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      projectId: projectId,
      messageCount: 0,
    };
    setConversations([newConv, ...conversations]);
    setMessages({ ...messages, [newId]: [] });
    setActiveConversationId(newId);
    setCurrentView('chat');
  };

  const handleStartConversationFromPrompt = (prompt: string, attachment?: string) => {
    const newId = `conv-${Date.now()}`;
    const title = generateSmartTitle(prompt);
    const userMsg: Message = {
      id: `msg-${Date.now()}-1`,
      conversationId: newId,
      role: 'user',
      content: attachment ? `${prompt}\n\n[Attached: ${attachment}]` : prompt,
      timestamp: new Date().toISOString(),
    };

    const newConv: Conversation = {
      id: newId,
      title,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messageCount: 1,
    };

    setConversations([newConv, ...conversations]);
    setMessages({ ...messages, [newId]: [userMsg] });
    setActiveConversationId(newId);
    setCurrentView('chat');

    // Simulate Hearth "Ask first. Answer once." clarification flow
    triggerClarificationResponse(newId, prompt);
  };

  const handleSendMessage = (content: string, attachments?: string[]) => {
    if (!activeConversationId) return;

    let fullContent = content;
    if (attachments && attachments.length > 0) {
      fullContent += `\n\n[Attached: ${attachments.join(', ')}]`;
    }

    const userMsg: Message = {
      id: `msg-${Date.now()}-u`,
      conversationId: activeConversationId,
      role: 'user',
      content: fullContent,
      timestamp: new Date().toISOString(),
    };

    const currentList = messages[activeConversationId] || [];
    const updatedMessages = [...currentList, userMsg];

    setMessages({
      ...messages,
      [activeConversationId]: updatedMessages,
    });

    // Update conversation title if default
    if (activeConversation && activeConversation.title === 'New Thought') {
      const newTitle = generateSmartTitle(content);
      handleUpdateConversationTitle(activeConversationId, newTitle);
    }

    // Trigger AI response (with clarification step if ambiguous)
    triggerClarificationResponse(activeConversationId, content);
  };

  const triggerClarificationResponse = (convId: string, prompt: string) => {
    setIsStreaming(true);

    // Initial "thinking" state
    const thinkingMsgId = `msg-${Date.now()}-think`;
    const thinkingMsg: Message = {
      id: thinkingMsgId,
      conversationId: convId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
      status: 'thinking',
    };

    setMessages(prev => ({
      ...prev,
      [convId]: [...(prev[convId] || []), thinkingMsg],
    }));

    // After 900ms, provide a clarification prompt (Hearth core stance: Ask first, answer once)
    setTimeout(() => {
      let clarificationQuestion = 'What is your primary architectural constraint for this requirement?';
      let options = [
        'High-throughput with low memory overhead (< 2MB buffer)',
        'Zero-data-loss durability with write-ahead-logging (WAL)',
        'Strict sub-millisecond p99 latency guarantees',
      ];

      if (prompt.toLowerCase().includes('plan') || prompt.toLowerCase().includes('break down')) {
        clarificationQuestion = 'What is the desired execution horizon and team capacity?';
        options = [
          'Immediate 1-week sprint (minimal viable implementation)',
          'Multi-milestone production rollout with regression testing',
          'Specification & architecture review document first',
        ];
      } else if (prompt.toLowerCase().includes('search') || prompt.toLowerCase().includes('index')) {
        clarificationQuestion = 'Which search modality takes precedence?';
        options = [
          'Exact token match with BM25 full-text search',
          'Dense vector embedding with SIMD cosine similarity',
          'Hybrid reciprocal rank fusion (RRF)',
        ];
      }

      const clarificationMsg: Message = {
        id: thinkingMsgId,
        conversationId: convId,
        role: 'assistant',
        content: `Before committing to a concrete specification, I want to clarify your primary requirement so we answer once and get it right.`,
        timestamp: new Date().toISOString(),
        clarification: {
          id: `clarif-${Date.now()}`,
          question: clarificationQuestion,
          options,
          isAnswered: false,
        },
        status: 'complete',
      };

      setMessages(prev => ({
        ...prev,
        [convId]: (prev[convId] || []).map(m => (m.id === thinkingMsgId ? clarificationMsg : m)),
      }));

      setIsStreaming(false);
    }, 850);
  };

  const handleAnswerClarification = (msgId: string, answer: string) => {
    if (!activeConversationId) return;

    // Mark clarification answered
    setMessages(prev => {
      const list = prev[activeConversationId] || [];
      return {
        ...prev,
        [activeConversationId]: list.map(m => {
          if (m.id === msgId && m.clarification) {
            return {
              ...m,
              clarification: {
                ...m.clarification,
                selectedOption: answer,
                isAnswered: true,
              },
            };
          }
          return m;
        }),
      };
    });

    // Generate definitive finalized answer with streaming simulation
    streamFinalizedAnswer(activeConversationId, answer);
  };

  const streamFinalizedAnswer = (convId: string, chosenConstraint: string) => {
    setIsStreaming(true);

    const answerMsgId = `msg-${Date.now()}-final`;
    const fullContent = `### Authoritative Architecture & Specification

Based on your selection of **${chosenConstraint}**, here is the definitive implementation:

\`\`\`typescript
export interface ExecutionContext {
  readonly constraint: string;
  readonly timestamp: number;
  readonly batchSize: number;
}

export class HearthTaskExecutor {
  private readonly buffer: Uint8Array = new Uint8Array(64 * 1024);

  constructor(private readonly context: ExecutionContext) {}

  public async executePipeline(): Promise<{ status: 'ok'; latencyMs: number }> {
    const start = performance.now();
    // Deterministic execution loop
    await this.flushSync();
    return {
      status: 'ok',
      latencyMs: performance.now() - start,
    };
  }

  private async flushSync(): Promise<void> {
    // Zero-allocation buffer pass
  }
}
\`\`\`

### Key Properties

1. **Deterministic Guarantees**: State convergence holds under high concurrency.
2. **Memory Bounds**: Zero dynamic heap allocations in hot loop paths.
3. **Audit Trail**: Every mutation is stamped with vector clocks for verifiable causal ordering.

> "A quiet system requires no apologies: it is built to exact specifications the first time."`;

    const assistantMsg: Message = {
      id: answerMsgId,
      conversationId: convId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
      status: 'streaming',
      citations: [
        {
          id: `cit-${Date.now()}`,
          title: 'Memory Invariant #1',
          source: 'User Memory: Preferred Architecture',
          snippet: 'Enforce strict typing, zero conversational fluff, and bounded memory.',
        },
      ],
    };

    setMessages(prev => ({
      ...prev,
      [convId]: [...(prev[convId] || []), assistantMsg],
    }));

    // Simulate word streaming
    const words = fullContent.split(' ');
    let currentWordIdx = 0;

    const streamInterval = setInterval(() => {
      currentWordIdx += 3;
      const partial = words.slice(0, currentWordIdx).join(' ');

      if (currentWordIdx >= words.length) {
        clearInterval(streamInterval);
        setIsStreaming(false);
        setMessages(prev => ({
          ...prev,
          [convId]: (prev[convId] || []).map(m =>
            m.id === answerMsgId ? { ...m, content: fullContent, status: 'complete' } : m
          ),
        }));
      } else {
        setMessages(prev => ({
          ...prev,
          [convId]: (prev[convId] || []).map(m =>
            m.id === answerMsgId ? { ...m, content: partial, status: 'streaming' } : m
          ),
        }));
      }
    }, 45);
  };

  const handleStopStreaming = () => {
    setIsStreaming(false);
    if (!activeConversationId) return;
    setMessages(prev => ({
      ...prev,
      [activeConversationId]: (prev[activeConversationId] || []).map(m =>
        m.status === 'streaming' ? { ...m, status: 'complete' } : m
      ),
    }));
  };

  const handleUpdateConversationTitle = (id: string, newTitle: string) => {
    setConversations(conversations.map(c => (c.id === id ? { ...c, title: newTitle } : c)));
  };

  const handleDeleteConversation = (id: string) => {
    const updated = conversations.filter(c => c.id !== id);
    setConversations(updated);
    const newMessages = { ...messages };
    delete newMessages[id];
    setMessages(newMessages);

    if (activeConversationId === id) {
      if (updated.length > 0) {
        setActiveConversationId(updated[0].id);
      } else {
        setCurrentView('home');
      }
    }
  };

  // --- Task Handlers ---

  const handleToggleTask = (taskId: string) => {
    setTasks(
      tasks.map(t => {
        if (t.id === taskId) {
          const nextStatus = t.status === 'completed' ? 'pending' : 'completed';
          return { ...t, status: nextStatus };
        }
        return t;
      })
    );
  };

  const handleAddTask = (taskData: Partial<Task>) => {
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: taskData.title || 'Untitled Task',
      description: taskData.description,
      status: taskData.status || 'pending',
      priority: taskData.priority || 'medium',
      dueDate: taskData.dueDate,
      projectId: taskData.projectId,
      conversationId: taskData.conversationId,
      createdAt: new Date().toISOString(),
    };
    setTasks([newTask, ...tasks]);
  };

  const handleUpdateTask = (task: Task) => {
    setTasks(tasks.map(t => (t.id === task.id ? task : t)));
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(tasks.filter(t => t.id !== taskId));
  };

  // --- Project Handlers ---

  const handleCreateProject = (projectData: Partial<Project>) => {
    const newProj: Project = {
      id: `proj-${Date.now()}`,
      name: projectData.name || 'Untitled Workspace',
      description: projectData.description || '',
      color: projectData.color || '#E05D26',
      taskCount: 0,
      conversationCount: 0,
      updatedAt: new Date().toISOString(),
      contextSnippet: projectData.contextSnippet,
    };
    setProjects([newProj, ...projects]);
  };

  // --- Memory Handlers ---

  const handleAddMemory = (memoryData: Partial<MemoryItem>) => {
    const newMem: MemoryItem = {
      id: `mem-${Date.now()}`,
      title: memoryData.title || 'New Knowledge',
      content: memoryData.content || '',
      category: memoryData.category || 'preference',
      createdAt: new Date().toISOString(),
    };
    setMemories([newMem, ...memories]);
  };

  const handleUpdateMemory = (memory: MemoryItem) => {
    setMemories(memories.map(m => (m.id === memory.id ? memory : m)));
  };

  const handleDeleteMemory = (id: string) => {
    setMemories(memories.filter(m => m.id !== id));
  };

  const handleClearAllMemory = () => {
    setMemories([]);
  };

  const handleToggleTheme = () => {
    setSettings(prev => ({
      ...prev,
      theme: prev.theme === 'dark' ? 'light' : 'dark',
    }));
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[var(--bg-main)] text-[var(--text-primary)]">
      {/* Left Sidebar */}
      <Sidebar
        currentView={currentView}
        activeConversationId={activeConversationId}
        conversations={conversations}
        tasks={tasks}
        projects={projects}
        theme={settings.theme}
        userName={settings.userName}
        isCollapsed={isSidebarCollapsed}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        onSelectView={view => {
          setCurrentView(view);
          setIsMobileSidebarOpen(false);
        }}
        onSelectConversation={id => {
          setActiveConversationId(id);
          setCurrentView('chat');
          setIsMobileSidebarOpen(false);
        }}
        onNewConversation={() => {
          handleNewConversation();
          setIsMobileSidebarOpen(false);
        }}
        onOpenSearch={() => setIsCommandPaletteOpen(true)}
        onToggleTheme={handleToggleTheme}
        onDeleteConversation={handleDeleteConversation}
        onRenameConversation={handleUpdateConversationTitle}
      />

      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 sm:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Main Center Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        {/* Universal Top Header */}
        <AppHeader
          currentView={currentView}
          activeConversationTitle={activeConversation?.title}
          isRightPanelOpen={isRightPanelOpen}
          onToggleRightPanel={() => setIsRightPanelOpen(!isRightPanelOpen)}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          onOpenSearch={() => setIsCommandPaletteOpen(true)}
        />

        {/* View Switcher */}
        <div className="flex-1 flex overflow-hidden">
          <main className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
            {currentView === 'home' && (
              <HomeDashboard
                userName={settings.userName}
                conversations={conversations}
                tasks={tasks}
                projects={projects}
                onStartConversation={handleStartConversationFromPrompt}
                onOpenConversation={id => {
                  setActiveConversationId(id);
                  setCurrentView('chat');
                }}
                onToggleTask={handleToggleTask}
                onNavigateToView={view => setCurrentView(view)}
              />
            )}

            {currentView === 'chat' && activeConversation && (
              <ChatWorkspace
                conversation={activeConversation}
                messages={activeConversationMessages}
                projects={projects}
                onSendMessage={handleSendMessage}
                onAnswerClarification={handleAnswerClarification}
                onUpdateTitle={newTitle => handleUpdateConversationTitle(activeConversation.id, newTitle)}
                onDeleteConversation={() => handleDeleteConversation(activeConversation.id)}
                isStreaming={isStreaming}
                onStopStreaming={handleStopStreaming}
                onRegenerateLast={() => {
                  const lastUserMsg = [...activeConversationMessages]
                    .reverse()
                    .find(m => m.role === 'user');
                  if (lastUserMsg) {
                    triggerClarificationResponse(activeConversation.id, lastUserMsg.content);
                  }
                }}
              />
            )}

            {currentView === 'tasks' && (
              <TasksView
                tasks={tasks}
                projects={projects}
                onToggleTask={handleToggleTask}
                onAddTask={handleAddTask}
                onDeleteTask={handleDeleteTask}
                onUpdateTask={handleUpdateTask}
              />
            )}

            {currentView === 'projects' && (
              <ProjectsView
                projects={projects}
                conversations={conversations}
                tasks={tasks}
                onSelectProjectConversation={convId => {
                  setActiveConversationId(convId);
                  setCurrentView('chat');
                }}
                onNewProjectConversation={projId => {
                  handleNewConversation(projId);
                }}
                onCreateProject={handleCreateProject}
                onToggleTask={handleToggleTask}
              />
            )}

            {currentView === 'memory' && (
              <MemoryView
                memories={memories}
                onAddMemory={handleAddMemory}
                onUpdateMemory={handleUpdateMemory}
                onDeleteMemory={handleDeleteMemory}
                onClearAll={handleClearAllMemory}
              />
            )}

            {currentView === 'settings' && (
              <SettingsView
                settings={settings}
                onUpdateSettings={newSettings => setSettings(prev => ({ ...prev, ...newSettings }))}
                onClearAllMemory={handleClearAllMemory}
                onResetWorkspace={() => {
                  localStorage.clear();
                  window.location.reload();
                }}
              />
            )}
          </main>

          {/* Right Contextual Panel (Collapsible) */}
          <ContextPanel
            isOpen={isRightPanelOpen}
            onClose={() => setIsRightPanelOpen(false)}
            activeConversation={activeConversation}
            projects={projects}
            tasks={tasks}
            memories={memories}
            onToggleTask={handleToggleTask}
            onAddTask={handleAddTask}
            onAddMemory={handleAddMemory}
            onOpenTasksView={() => setCurrentView('tasks')}
            onOpenMemoryView={() => setCurrentView('memory')}
          />
        </div>
      </div>

      {/* Global Command Palette (Cmd+K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        conversations={conversations}
        tasks={tasks}
        projects={projects}
        memories={memories}
        theme={settings.theme}
        onSelectConversation={id => {
          setActiveConversationId(id);
          setCurrentView('chat');
        }}
        onSelectView={view => setCurrentView(view)}
        onNewConversation={handleNewConversation}
        onToggleTheme={handleToggleTheme}
      />
    </div>
  );
}
