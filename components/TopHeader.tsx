'use client';

import React from 'react';
import { BookMarked, Download, HelpCircle, Keyboard, Menu, Play, ShieldAlert } from 'lucide-react';
import { WorkspaceView } from '@/lib/types';

interface TopHeaderProps {
  activeView: WorkspaceView;
  onOpenMobileSidebar: () => void;
  onOpenCheatSheet: () => void;
  onOpenShortcuts: () => void;
  onOpenHowTo: () => void;
  onRunPrimarySearch: () => void;
  onExportCsv: () => void;
  isSearching: boolean;
  gmailConnectedEmail: string | null;
  onNavigateAlerts: () => void;
}

const VIEW_LABELS: Record<WorkspaceView, string> = {
  dashboard: 'Dashboard',
  workbench: 'Query Workbench',
  catalog: 'Dork Reference Catalog',
  database: 'Findings Database',
  history: 'Search History Log',
  alerts: 'Gmail Alerts & External APIs',
  compliance: 'Ethical Use & Compliance',
  help: 'Help & Feature Guide',
};

export default function TopHeader({
  activeView,
  onOpenMobileSidebar,
  onOpenCheatSheet,
  onOpenShortcuts,
  onOpenHowTo,
  onRunPrimarySearch,
  onExportCsv,
  isSearching,
  gmailConnectedEmail,
  onNavigateAlerts,
}: TopHeaderProps) {
  return (
    <header className="h-14 bg-[var(--v-bg)] border-b border-[var(--v-border)] px-4 lg:px-6 flex items-center justify-between gap-6 shrink-0">
      {/* Zone 1: Breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          aria-label="Toggle workspace sidebar"
          className="lg:hidden p-2 -ml-2 text-[var(--v-ink-dim)] hover:text-[var(--v-ink)] rounded"
        >
          <Menu className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-2 text-xs font-mono min-w-0">
          <span className="font-bold text-[var(--v-ink)] whitespace-nowrap">
            VectorOne_DSP
          </span>
          <span className="text-[var(--v-ink-dim)]" aria-hidden="true">
            /
          </span>
          <span className="text-[var(--v-ink-dim)] truncate">
            {VIEW_LABELS[activeView]}
          </span>
        </div>
      </div>

      {/* Zone 2: Utility Links */}
      <div className="hidden md:flex items-center gap-5 text-xs font-medium text-[var(--v-ink-dim)]">
        <button
          type="button"
          onClick={onOpenCheatSheet}
          title="Open Dork Cheat Sheet (Ctrl+/)"
          className="flex items-center gap-1.5 text-[var(--v-ink-dim)] hover:text-[#ff4d00] transition-colors whitespace-nowrap shrink-0"
        >
          <BookMarked className="w-3.5 h-3.5" />
          Cheat Sheet
        </button>
        <button
          type="button"
          onClick={onOpenHowTo}
          title="Open How To Use & Quick Search popup"
          className="flex items-center gap-1.5 text-[var(--v-ink-dim)] hover:text-[#ff4d00] transition-colors whitespace-nowrap shrink-0"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          How To Use
        </button>
        <button
          type="button"
          onClick={onOpenShortcuts}
          title="View Keyboard Shortcuts (?)"
          className="flex items-center gap-1.5 text-[var(--v-ink-dim)] hover:text-[#ff4d00] transition-colors whitespace-nowrap shrink-0"
        >
          <Keyboard className="w-3.5 h-3.5" />
          Shortcuts
        </button>
        <button
          type="button"
          onClick={onNavigateAlerts}
          className="flex items-center gap-1.5 text-[var(--v-ink-dim)] hover:text-[var(--v-ink)] transition-colors whitespace-nowrap shrink-0"
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          {gmailConnectedEmail
            ? `Gmail: ${gmailConnectedEmail}`
            : 'Gmail Offline'}
        </button>
      </div>

      {/* Zone 3: Primary Action */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={onOpenCheatSheet}
          className="md:hidden px-2.5 py-1.5 text-xs font-medium text-[var(--v-ink)] border border-[var(--v-border)] rounded hover:border-[#ff4d00] whitespace-nowrap shrink-0"
        >
          Cheat Sheet
        </button>

        {activeView === 'database' || activeView === 'history' ? (
          <button
            type="button"
            onClick={onExportCsv}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-[#ff4d00] text-[#111113] rounded-xs hover:bg-[#ff621f] transition-colors whitespace-nowrap shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            {activeView === 'database' ? 'Export Findings' : 'Export CSV'}
          </button>
        ) : (
          <button
            type="button"
            onClick={onRunPrimarySearch}
            disabled={isSearching}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-[#ff4d00] text-[#111113] rounded-xs hover:bg-[#ff621f] disabled:opacity-60 transition-colors whitespace-nowrap shrink-0"
          >
            <Play className="w-3.5 h-3.5" />
            {isSearching ? 'Searching...' : 'Run Search'}
          </button>
        )}
      </div>
    </header>
  );
}
