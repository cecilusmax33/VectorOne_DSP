'use client';

import React from 'react';
import { Keyboard, X } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  open: boolean;
  onClose: () => void;
}

const SHORTCUT_GROUPS: {
  group: string;
  items: { keys: string[]; description: string }[];
}[] = [
  {
    group: 'Search & Findings Actions',
    items: [
      {
        keys: ['Ctrl / ⌘', 'K'],
        description: 'Jump to Query Workbench & focus query composer',
      },
      {
        keys: ['Ctrl / ⌘', 'Enter'],
        description: 'Run automated grounded search for current query',
      },
      {
        keys: ['Ctrl / ⌘', 'S'],
        description: 'Save all unsaved live results to Findings Database',
      },
      {
        keys: ['Ctrl / ⌘', 'E'],
        description: 'Open Export Findings modal (CSV / JSON) or export History CSV',
      },
    ],
  },
  {
    group: 'Workspace Navigation',
    items: [
      {
        keys: ['Ctrl / ⌘', 'D'],
        description: 'Open Dork Reference Catalog',
      },
      {
        keys: ['Ctrl / ⌘', '1'],
        description: 'Switch to Dashboard',
      },
      {
        keys: ['Ctrl / ⌘', '2'],
        description: 'Switch to Query Workbench',
      },
      {
        keys: ['Ctrl / ⌘', '3'],
        description: 'Switch to Dork Catalog',
      },
      {
        keys: ['Ctrl / ⌘', '4'],
        description: 'Switch to Findings Database',
      },
      {
        keys: ['Ctrl / ⌘', '5'],
        description: 'Switch to Search History',
      },
      {
        keys: ['Ctrl / ⌘', '6'],
        description: 'Switch to Alerts & APIs',
      },
      {
        keys: ['Ctrl / ⌘', '7'],
        description: 'Switch to Help & Feature Guide',
      },
    ],
  },
  {
    group: 'Reference & Overlays',
    items: [
      {
        keys: ['Ctrl / ⌘', '/'],
        description: 'Toggle Google Dorking Operator Cheat Sheet',
      },
      {
        keys: ['?'],
        description: 'Open Keyboard Shortcuts Reference (when not typing)',
      },
      {
        keys: ['Esc'],
        description: 'Close active drawer, dialog, or sidebar',
      },
    ],
  },
];

export default function KeyboardShortcutsModal({
  open,
  onClose,
}: KeyboardShortcutsModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="keyboard-shortcuts-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-[var(--v-surface)] border border-[var(--v-border)] border-t-[3px] border-t-[#ff4d00] rounded-xs shadow-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-[var(--v-border)] bg-[var(--v-bg)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Keyboard className="w-4 h-4 text-[#ff4d00]" />
            <h2
              id="keyboard-shortcuts-title"
              className="font-display text-sm font-extrabold uppercase tracking-tight text-[var(--v-ink)]"
            >
              VectorOne_DSP Keyboard Shortcuts
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close keyboard shortcuts"
            className="p-1 text-[var(--v-ink-dim)] hover:text-[#ff4d00] rounded-xs transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto scroll-smooth divide-y divide-[var(--v-border)]">
          {SHORTCUT_GROUPS.map((section) => (
            <div key={section.group} className="px-6 py-4 space-y-2.5">
              <h3 className="text-[11px] font-mono uppercase tracking-wider font-bold text-[#ff4d00]">
                {section.group}
              </h3>
              <div className="divide-y divide-[var(--v-border)] border border-[var(--v-border)] rounded-xs bg-[var(--v-bg)]">
                {section.items.map((item) => (
                  <div
                    key={item.description}
                    className="px-3.5 py-2 flex items-center justify-between gap-4 text-xs"
                  >
                    <span className="text-[var(--v-ink)]">{item.description}</span>
                    <span className="inline-flex items-center gap-1 shrink-0">
                      {item.keys.map((k, idx) => (
                        <React.Fragment key={k}>
                          <kbd className="px-1.5 py-0.5 text-[11px] font-mono bg-[var(--v-surface)] text-[var(--v-ink)] border border-[var(--v-border)] rounded-xs">
                            {k}
                          </kbd>
                          {idx < item.keys.length - 1 && (
                            <span className="text-[var(--v-ink-dim)] text-[10px]">+</span>
                          )}
                        </React.Fragment>
                      ))}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="px-6 py-3 border-t border-[var(--v-border)] bg-[var(--v-bg)] flex justify-between items-center text-[11px] font-mono text-[var(--v-ink-dim)]">
          <span>Use Ctrl on Windows/Linux or ⌘ Command on macOS.</span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-mono font-medium text-[var(--v-ink)] bg-[var(--v-surface)] border border-[var(--v-border)] rounded-xs hover:border-[#ff4d00] hover:text-[#ff4d00] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
