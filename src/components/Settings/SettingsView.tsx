import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Sun,
  Moon,
  Sparkles,
  Shield,
  Keyboard,
  Info,
  Sliders,
  Check,
  Trash2,
} from 'lucide-react';
import { AppSettings } from '../../types';

interface SettingsViewProps {
  settings: AppSettings;
  onUpdateSettings: (settings: Partial<AppSettings>) => void;
  onClearAllMemory: () => void;
  onResetWorkspace: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  onClearAllMemory,
  onResetWorkspace,
}) => {
  const [activeSection, setActiveSection] = useState<
    'general' | 'appearance' | 'ai' | 'memory' | 'privacy' | 'shortcuts' | 'about'
  >('general');

  const shortcuts = [
    { key: '⌘ K', description: 'Open universal command palette & search' },
    { key: '⌘ N', description: 'New conversation' },
    { key: '⌘ \\', description: 'Toggle left sidebar collapse' },
    { key: 'Return', description: 'Send message in composer' },
    { key: 'Shift + Return', description: 'Insert newline in composer' },
    { key: 'Esc', description: 'Close modal, prompt, or command palette' },
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-[var(--bg-main)] overflow-hidden">
      {/* Header */}
      <div className="h-14 px-6 border-b border-[var(--border-subtle)] flex items-center justify-between shrink-0 bg-[var(--bg-main)]">
        <div className="flex items-center gap-3">
          <SettingsIcon className="w-4 h-4 text-[var(--accent-ember)]" />
          <h1 className="text-[15px] font-medium text-[var(--text-primary)]">Settings</h1>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar */}
        <div className="w-56 border-r border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-3 space-y-1 shrink-0 hidden sm:block">
          {[
            { id: 'general', label: 'General' },
            { id: 'appearance', label: 'Appearance' },
            { id: 'ai', label: 'AI Preferences' },
            { id: 'memory', label: 'Memory & State' },
            { id: 'privacy', label: 'Privacy & Security' },
            { id: 'shortcuts', label: 'Keyboard Shortcuts' },
            { id: 'about', label: 'About Hearth' },
          ].map(section => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id as any)}
              className={`w-full text-left px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all ${
                activeSection === section.id
                  ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-subtle)] shadow-xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)]'
              }`}
            >
              {section.label}
            </button>
          ))}
        </div>

        {/* Settings Content Area */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-10">
          <div className="max-w-2xl space-y-8">
            {/* GENERAL */}
            {activeSection === 'general' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-medium text-[var(--text-primary)]">General Settings</h2>
                  <p className="text-[13px] text-[var(--text-secondary)] mt-0.5">
                    Workspace identification and personal preferences.
                  </p>
                </div>

                <div className="space-y-4 pt-2">
                  <div className="space-y-1.5">
                    <label className="text-[12px] font-mono uppercase text-[var(--text-tertiary)]">
                      User Name
                    </label>
                    <input
                      type="text"
                      value={settings.userName}
                      onChange={e => onUpdateSettings({ userName: e.target.value })}
                      className="w-full max-w-md px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-[13.5px] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-ember)]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[12px] font-mono uppercase text-[var(--text-tertiary)]">
                      Workspace Name
                    </label>
                    <input
                      type="text"
                      value={settings.workspaceName}
                      onChange={e => onUpdateSettings({ workspaceName: e.target.value })}
                      className="w-full max-w-md px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-[13.5px] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-ember)]"
                    />
                  </div>

                  <div className="pt-2">
                    <label className="text-[12px] font-mono uppercase text-[var(--text-tertiary)] block mb-1.5">
                      Font Density
                    </label>
                    <div className="flex gap-2">
                      {(['compact', 'default', 'comfortable'] as const).map(size => (
                        <button
                          key={size}
                          onClick={() => onUpdateSettings({ fontSize: size })}
                          className={`px-3 py-1.5 rounded-lg text-[12.5px] font-medium capitalize border transition-all ${
                            settings.fontSize === size
                              ? 'border-[var(--accent-ember)] bg-[var(--accent-ember-subtle)] text-[var(--text-primary)]'
                              : 'border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-secondary)]'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* APPEARANCE */}
            {activeSection === 'appearance' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-medium text-[var(--text-primary)]">Appearance</h2>
                  <p className="text-[13px] text-[var(--text-secondary)] mt-0.5">
                    Switch themes and adjust the visual environment.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  {/* Dark Theme Card */}
                  <div
                    onClick={() => onUpdateSettings({ theme: 'dark' })}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      settings.theme === 'dark'
                        ? 'border-[var(--accent-ember)] ring-1 ring-[var(--accent-ember)] bg-[#161616]'
                        : 'border-[var(--border-subtle)] bg-[#111111] opacity-70 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Moon className="w-4 h-4 text-white" />
                        <span className="text-[14px] font-medium text-white">Dark Theme</span>
                      </div>
                      {settings.theme === 'dark' && (
                        <Check className="w-4 h-4 text-[var(--accent-ember)]" />
                      )}
                    </div>
                    <div className="space-y-1.5 p-2 rounded bg-[#0A0A0A] border border-[#242424] text-[11px] font-mono text-[#929292]">
                      <div>Main: #0A0A0A</div>
                      <div>Accent: Warm Ember (#E05D26)</div>
                    </div>
                  </div>

                  {/* Light Theme Card */}
                  <div
                    onClick={() => onUpdateSettings({ theme: 'light' })}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      settings.theme === 'light'
                        ? 'border-[var(--accent-ember)] ring-1 ring-[var(--accent-ember)] bg-[#FFFFFF]'
                        : 'border-[var(--border-subtle)] bg-[#F7F7F7] opacity-70 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Sun className="w-4 h-4 text-[#111111]" />
                        <span className="text-[14px] font-medium text-[#111111]">Light Theme</span>
                      </div>
                      {settings.theme === 'light' && (
                        <Check className="w-4 h-4 text-[var(--accent-ember)]" />
                      )}
                    </div>
                    <div className="space-y-1.5 p-2 rounded bg-[#FFFFFF] border border-[#EAEAEA] text-[11px] font-mono text-[#737373]">
                      <div>Main: #FFFFFF</div>
                      <div>Accent: Ember (#D9531E)</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* AI PREFERENCES */}
            {activeSection === 'ai' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-medium text-[var(--text-primary)]">AI Preferences</h2>
                  <p className="text-[13px] text-[var(--text-secondary)] mt-0.5">
                    Control Hearth’s core reasoning and clarification engine.
                  </p>
                </div>

                {/* Clarification Threshold (Ask first. Answer once.) */}
                <div className="p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] space-y-3">
                  <div>
                    <h3 className="text-[14px] font-medium text-[var(--text-primary)]">
                      Clarification Policy
                    </h3>
                    <p className="text-[12px] text-[var(--text-secondary)] mt-0.5">
                      Determines when Hearth pauses to ask clarifying questions before committing to an architecture or design.
                    </p>
                  </div>

                  <div className="space-y-2">
                    {[
                      {
                        id: 'aggressive',
                        title: 'Aggressive (Recommended)',
                        desc: 'Clarify any prompt that admits multiple architectural paths.',
                      },
                      {
                        id: 'balanced',
                        title: 'Balanced',
                        desc: 'Ask only when parameters are missing or ambiguous.',
                      },
                      {
                        id: 'minimal',
                        title: 'Minimal',
                        desc: 'Assume standard defaults unless explicitly requested.',
                      },
                    ].map(item => (
                      <div
                        key={item.id}
                        onClick={() => onUpdateSettings({ clarificationStyle: item.id as any })}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                          settings.clarificationStyle === item.id
                            ? 'border-[var(--accent-ember)] bg-[var(--accent-ember-subtle)]'
                            : 'border-[var(--border-subtle)] bg-[var(--bg-main)] hover:border-[var(--border-strong)]'
                        }`}
                      >
                        <div className="text-[13px] font-medium text-[var(--text-primary)]">
                          {item.title}
                        </div>
                        <div className="text-[11.5px] text-[var(--text-secondary)] mt-0.5">
                          {item.desc}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Reasoning Depth */}
                <div className="p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] space-y-3">
                  <div>
                    <h3 className="text-[14px] font-medium text-[var(--text-primary)]">
                      Reasoning Depth
                    </h3>
                    <p className="text-[12px] text-[var(--text-secondary)] mt-0.5">
                      Select between deep causal decomposition or standard direct synthesis.
                    </p>
                  </div>

                  <div className="flex gap-2">
                    {[
                      { id: 'deep', label: 'Deep (Full Causal Trace)' },
                      { id: 'standard', label: 'Standard (Concise)' },
                    ].map(item => (
                      <button
                        key={item.id}
                        onClick={() => onUpdateSettings({ reasoningDepth: item.id as any })}
                        className={`px-3 py-2 rounded-lg text-[13px] font-medium border transition-all ${
                          settings.reasoningDepth === item.id
                            ? 'border-[var(--accent-ember)] bg-[var(--accent-ember-subtle)] text-[var(--text-primary)]'
                            : 'border-[var(--border-subtle)] bg-[var(--bg-main)] text-[var(--text-secondary)]'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* MEMORY & DATA */}
            {activeSection === 'memory' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-medium text-[var(--text-primary)]">Memory & State</h2>
                  <p className="text-[13px] text-[var(--text-secondary)] mt-0.5">
                    Manage persistent knowledge and local cache.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[13.5px] font-medium text-[var(--text-primary)]">
                        Auto-extract Workspace Memory
                      </div>
                      <div className="text-[12px] text-[var(--text-secondary)]">
                        Propose facts for your review when technical decisions are finalized.
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.autoExtractMemory}
                      onChange={e => onUpdateSettings({ autoExtractMemory: e.target.checked })}
                      className="accent-[var(--accent-ember)] w-4 h-4 cursor-pointer"
                    />
                  </div>

                  <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between">
                    <div>
                      <div className="text-[13.5px] font-medium text-red-400">
                        Purge Memory Store
                      </div>
                      <div className="text-[12px] text-[var(--text-secondary)]">
                        Permanently delete all remembered preferences and technical facts.
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to delete all saved memories?')) {
                          onClearAllMemory();
                        }
                      }}
                      className="px-3 py-1.5 rounded-lg border border-red-500/40 text-red-400 hover:bg-red-500/10 text-[12.5px] font-medium transition-colors"
                    >
                      Purge All
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* PRIVACY */}
            {activeSection === 'privacy' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-medium text-[var(--text-primary)]">Privacy & Security</h2>
                  <p className="text-[13px] text-[var(--text-secondary)] mt-0.5">
                    Zero-telemetry architecture and local data isolation.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] space-y-4 text-[13px]">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-[var(--text-primary)]">Telemetry & Diagnostics</div>
                      <div className="text-[12px] text-[var(--text-secondary)]">Outbound analytics pings are disabled by default.</div>
                    </div>
                    <span className="text-[11px] font-mono uppercase text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded">
                      Disabled
                    </span>
                  </div>

                  <div className="pt-3 border-t border-[var(--border-subtle)]">
                    <div className="font-medium text-[var(--text-primary)]">Local Storage Encryption</div>
                    <p className="text-[12px] text-[var(--text-secondary)] mt-1">
                      All state synchronization payloads are stored client-side in encrypted browser storage blocks.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* KEYBOARD SHORTCUTS */}
            {activeSection === 'shortcuts' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-medium text-[var(--text-primary)]">Keyboard Shortcuts</h2>
                  <p className="text-[13px] text-[var(--text-secondary)] mt-0.5">
                    Accelerate your workflow with quiet keystrokes.
                  </p>
                </div>

                <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] divide-y divide-[var(--border-subtle)] overflow-hidden">
                  {shortcuts.map((sc, idx) => (
                    <div key={idx} className="p-3.5 flex items-center justify-between text-[13px]">
                      <span className="text-[var(--text-secondary)]">{sc.description}</span>
                      <kbd className="px-2 py-1 rounded bg-[var(--bg-main)] border border-[var(--border-subtle)] text-[11.5px] font-mono text-[var(--text-primary)] font-semibold">
                        {sc.key}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ABOUT HEARTH */}
            {activeSection === 'about' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-medium text-[var(--text-primary)]">About Hearth</h2>
                  <p className="text-[13px] text-[var(--text-secondary)] mt-0.5">
                    Version 1.4.2 • Desktop Edition
                  </p>
                </div>

                <div className="p-5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] space-y-4">
                  <div className="text-[14.5px] font-medium text-[var(--text-primary)]">
                    "A quiet workspace for thinking with AI."
                  </div>
                  <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">
                    Hearth is built on the belief that intelligence should not scream for your attention. Traditional AI assistants rush to guess answers, spew conversational boilerplate, and drown the user in endless vertical chat streams.
                  </p>
                  <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">
                    Hearth operates on a simple principle: <strong>Ask first. Answer once.</strong> We provide a structured, calm environment connecting tasks, project state, and user-audited memory.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
