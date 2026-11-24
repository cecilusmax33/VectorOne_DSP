'use client';

import React, { useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  HelpCircle,
  Play,
  Search,
  Sparkles,
  X,
} from 'lucide-react';
import { PLATFORM_DEFINITIONS } from '@/lib/dork-catalog';
import { PlatformId } from '@/lib/types';

interface HowToUseModalProps {
  open: boolean;
  initialQuery: string;
  initialPlatform: PlatformId;
  dontShowOnStartup: boolean;
  onToggleDontShowOnStartup: (value: boolean) => void;
  onClose: () => void;
  onRunQuickSearch: (query: string, platform: PlatformId) => void;
  onLoadIntoWorkbench: (query: string, platform: PlatformId) => void;
  onOpenHelpTab: () => void;
}

const QUICK_STARTER_QUERIES: {
  label: string;
  query: string;
  platform: PlatformId;
}[] = [
  {
    label: 'Public PDFs on domain',
    query: 'site:example.com filetype:pdf',
    platform: 'google',
  },
  {
    label: 'Admin & login paths',
    query: 'site:example.com (inurl:admin OR inurl:login)',
    platform: 'google',
  },
  {
    label: 'Directory index audit',
    query: 'site:example.com intitle:"index of"',
    platform: 'google',
  },
  {
    label: 'API spec & OpenAPI docs',
    query: 'site:example.com (inurl:swagger OR inurl:openapi OR filetype:json)',
    platform: 'bing',
  },
];

export default function HowToUseModal({
  open,
  initialQuery,
  initialPlatform,
  dontShowOnStartup,
  onToggleDontShowOnStartup,
  onClose,
  onRunQuickSearch,
  onLoadIntoWorkbench,
  onOpenHelpTab,
}: HowToUseModalProps) {
  const [quickQuery, setQuickQuery] = useState(
    initialQuery || 'site:example.com filetype:pdf'
  );
  const [platform, setPlatform] = useState<PlatformId>(initialPlatform);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = quickQuery.trim();
    if (!trimmed) return;
    onRunQuickSearch(trimmed, platform);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="how-to-use-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-[var(--v-surface)] border border-[var(--v-border)] border-t-[3px] border-t-[#ff4d00] rounded-xs shadow-lg overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[var(--v-border)] bg-[var(--v-bg)] flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <HelpCircle className="w-5 h-5 text-[#ff4d00] shrink-0" />
            <div className="min-w-0">
              <h2
                id="how-to-use-title"
                className="font-display text-base font-extrabold uppercase tracking-tight text-[var(--v-ink)] truncate"
              >
                How To Use VectorOne_DSP
              </h2>
              <p className="text-[11px] font-mono text-[var(--v-ink-dim)] truncate">
                Quick-start workflow &amp; instant Quick Search Query launcher
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close How To Use dialog"
            className="p-1.5 text-[var(--v-ink-dim)] hover:text-[#ff4d00] rounded-xs transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 overflow-y-auto scroll-smooth">
          {/* 3-Step Quick Workflow */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 bg-[var(--v-bg)] border border-[var(--v-border)] rounded-xs space-y-1">
              <div className="text-[11px] font-mono font-bold text-[#ff4d00]">
                01. Scope &amp; Filter
              </div>
              <p className="text-xs text-[var(--v-ink-dim)] leading-relaxed">
                Set a target domain, date window, rank slice, language, country, or DLP filter in the left sidebar.
              </p>
            </div>
            <div className="p-3.5 bg-[var(--v-bg)] border border-[var(--v-border)] rounded-xs space-y-1">
              <div className="text-[11px] font-mono font-bold text-[#ff4d00]">
                02. Run or Launch
              </div>
              <p className="text-xs text-[var(--v-ink-dim)] leading-relaxed">
                Execute a live Gemini-grounded search or open tailored syntax on Google, Bing, DuckDuckGo, GitHub, Shodan, or Wayback.
              </p>
            </div>
            <div className="p-3.5 bg-[var(--v-bg)] border border-[var(--v-border)] rounded-xs space-y-1">
              <div className="text-[11px] font-mono font-bold text-[#ff4d00]">
                03. Triage &amp; Export
              </div>
              <p className="text-xs text-[var(--v-ink-dim)] leading-relaxed">
                Save findings locally, track telemetry on the Dashboard, export CSV/JSON, or send confirmed Gmail alerts.
              </p>
            </div>
          </div>

          {/* Quick Search Query Form */}
          <form
            onSubmit={handleSubmit}
            className="p-5 bg-[var(--v-bg)] border border-[var(--v-border)] border-t-2 border-t-[#ff4d00] rounded-xs space-y-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label
                htmlFor="quick-search-query-input"
                className="inline-flex items-center gap-1.5 font-display text-sm font-bold uppercase tracking-tight text-[var(--v-ink)]"
              >
                <Search className="w-4 h-4 text-[#ff4d00]" />
                Quick Search Query
              </label>

              <div className="inline-flex flex-wrap items-center gap-1">
                {PLATFORM_DEFINITIONS.map((plat) => (
                  <button
                    key={plat.id}
                    type="button"
                    onClick={() => setPlatform(plat.id)}
                    className={`px-2 py-1 text-[11px] font-mono rounded-xs transition-colors whitespace-nowrap ${
                      platform === plat.id
                        ? 'bg-[#ff4d00] text-[#111113] font-bold'
                        : 'bg-[var(--v-surface)] text-[var(--v-ink-dim)] border border-[var(--v-border)] hover:text-[var(--v-ink)]'
                    }`}
                  >
                    {plat.label}
                  </button>
                ))}
              </div>
            </div>

            <textarea
              id="quick-search-query-input"
              rows={2}
              value={quickQuery}
              onChange={(e) => setQuickQuery(e.target.value)}
              placeholder="Enter any search operator query (e.g. site:example.com filetype:pdf confidential)..."
              className="w-full p-3 text-xs font-mono bg-[var(--v-surface)] border border-[var(--v-border)] rounded-xs text-[var(--v-ink)] placeholder:text-[var(--v-ink-dim)] focus:outline-none focus:border-[#ff4d00] leading-relaxed"
            />

            {/* Quick Starter Presets */}
            <div className="space-y-1.5">
              <div className="text-[11px] font-mono text-[var(--v-ink-dim)] flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-[#ff4d00]" />
                Starter Templates (click to fill)
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {QUICK_STARTER_QUERIES.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => {
                      setQuickQuery(preset.query);
                      setPlatform(preset.platform);
                    }}
                    className="px-2.5 py-1.5 text-left bg-[var(--v-surface)] border border-[var(--v-border)] rounded-xs hover:border-[#ff4d00] transition-colors"
                  >
                    <div className="text-[11px] font-semibold text-[var(--v-ink)]">
                      {preset.label}
                    </div>
                    <div className="text-[10px] font-mono text-[var(--v-ink-dim)] truncate">
                      {preset.query}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
              <button
                type="button"
                onClick={onOpenHelpTab}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-mono text-[var(--v-ink-dim)] hover:text-[#ff4d00] transition-colors"
              >
                <BookOpen className="w-3.5 h-3.5" />
                Open Full Help Guide
              </button>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  disabled={!quickQuery.trim()}
                  onClick={() => onLoadIntoWorkbench(quickQuery.trim(), platform)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-mono font-medium text-[var(--v-ink)] bg-[var(--v-surface)] border border-[var(--v-border)] rounded-xs hover:border-[#ff4d00] hover:text-[#ff4d00] disabled:opacity-40 transition-colors whitespace-nowrap"
                >
                  Load in Workbench
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  type="submit"
                  disabled={!quickQuery.trim()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-display font-extrabold uppercase tracking-tight bg-[#ff4d00] text-[#111113] rounded-xs hover:bg-[#ff621f] disabled:opacity-40 transition-colors whitespace-nowrap"
                >
                  <Play className="w-3.5 h-3.5" />
                  Run Quick Search
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-[var(--v-border)] bg-[var(--v-bg)] flex flex-wrap items-center justify-between gap-3 shrink-0">
          <label className="inline-flex items-center gap-2 text-xs text-[var(--v-ink-dim)] hover:text-[var(--v-ink)] cursor-pointer">
            <input
              type="checkbox"
              checked={dontShowOnStartup}
              onChange={(e) => onToggleDontShowOnStartup(e.target.checked)}
              className="rounded-xs border-[var(--v-border)] accent-[#ff4d00]"
            />
            <span>Don&apos;t show this quick-start popup on startup</span>
          </label>

          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-mono font-medium text-[var(--v-ink)] bg-[var(--v-surface)] border border-[var(--v-border)] rounded-xs hover:border-[#ff4d00] hover:text-[#ff4d00] transition-colors"
          >
            Enter Workspace
          </button>
        </div>
      </div>
    </div>
  );
}
