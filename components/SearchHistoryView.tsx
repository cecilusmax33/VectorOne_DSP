'use client';

import React, { useMemo, useState } from 'react';
import { BellPlus, Download, LayoutGrid, Play, Search, Table2, Trash2 } from 'lucide-react';
import { SearchHistoryEntry } from '@/lib/types';

interface SearchHistoryViewProps {
  history: SearchHistoryEntry[];
  onRerunEntry: (entry: SearchHistoryEntry) => void;
  onCreateAlertFromEntry: (entry: SearchHistoryEntry) => void;
  onClearHistory: () => void;
  onExportCsv: (filtered: SearchHistoryEntry[]) => void;
}

export default function SearchHistoryView({
  history,
  onRerunEntry,
  onCreateAlertFromEntry,
  onClearHistory,
  onExportCsv,
}: SearchHistoryViewProps) {
  const [filterText, setFilterText] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const filtered = useMemo(() => {
    const q = filterText.trim().toLowerCase();
    if (!q) return history;
    return history.filter(
      (h) =>
        h.composedQuery.toLowerCase().includes(q) ||
        h.targetDomain.toLowerCase().includes(q) ||
        h.platform.toLowerCase().includes(q) ||
        h.executionMode.toLowerCase().includes(q)
    );
  }, [history, filterText]);

  return (
    <div className="col-span-full bg-[var(--v-surface)] border border-[var(--v-border)] border-t-[3px] border-t-[#ff4d00] divide-y divide-[var(--v-border)]">
      <div className="p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-xl sm:text-2xl font-extrabold uppercase tracking-tight text-[var(--v-ink)]">
            Search History Audit Log
          </h1>
          <p className="text-xs font-mono text-[var(--v-ink-dim)] mt-1 tabular-nums">
            {history.length} logged execution(s) · Full query, domain, rank, geo, and DLP filter audit trail.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex p-0.5 bg-[var(--v-bg)] border border-[var(--v-border)] rounded-xs">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              aria-pressed={viewMode === 'grid'}
              className={`inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-mono rounded-xs transition-colors ${
                viewMode === 'grid'
                  ? 'bg-[#ff4d00] text-[#111113] font-bold'
                  : 'text-[var(--v-ink-dim)] hover:text-[var(--v-ink)]'
              }`}
            >
              <LayoutGrid className="w-3 h-3" />
              Grid
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              aria-pressed={viewMode === 'table'}
              className={`inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-mono rounded-xs transition-colors ${
                viewMode === 'table'
                  ? 'bg-[#ff4d00] text-[#111113] font-bold'
                  : 'text-[var(--v-ink-dim)] hover:text-[var(--v-ink)]'
              }`}
            >
              <Table2 className="w-3 h-3" />
              Table
            </button>
          </div>

          <button
            type="button"
            onClick={onClearHistory}
            disabled={history.length === 0}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-medium text-red-700 dark:text-red-300 bg-[var(--v-bg)] border border-red-300 dark:border-red-800 rounded-xs hover:bg-red-50 dark:hover:bg-red-950/40 disabled:opacity-40 whitespace-nowrap"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear Log
          </button>
          <button
            type="button"
            onClick={() => onExportCsv(filtered)}
            disabled={filtered.length === 0}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-display font-extrabold uppercase tracking-tight text-[#111113] bg-[#ff4d00] rounded-xs hover:bg-[#ff621f] disabled:opacity-40 transition-colors whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" />
            Export History CSV
          </button>
        </div>
      </div>

      <div className="px-6 py-3.5 bg-[var(--v-bg)]">
        <div className="relative max-w-md">
          <Search className="w-3.5 h-3.5 text-[var(--v-ink-dim)] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            placeholder="Filter history by query, domain, or platform..."
            className="w-full pl-8 pr-3 py-1.5 text-xs font-mono bg-[var(--v-surface)] border border-[var(--v-border)] rounded-xs text-[var(--v-ink)] placeholder:text-[var(--v-ink-dim)] focus:outline-none focus:border-[#ff4d00]"
          />
        </div>
      </div>

      {filtered.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="p-5 bg-[var(--v-bg)]/40 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 items-stretch">
            {filtered.map((entry) => (
              <article
                key={entry.id}
                className="min-w-0 bg-[var(--v-surface)] border border-[var(--v-border)] p-4 flex flex-col justify-between gap-3.5 hover:border-[#ff4d00]/70 transition-colors"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2 text-[11px] font-mono">
                    <span className="font-bold uppercase text-[#ff4d00]">
                      {entry.platform} · {entry.executionMode}
                    </span>
                    <span className="tabular-nums text-[var(--v-ink)] font-semibold">
                      {entry.resultCount} hit(s)
                    </span>
                  </div>

                  <div className="p-2.5 bg-[var(--v-bg)] border border-[var(--v-border)] rounded-xs font-mono text-xs text-[var(--v-ink)] break-all">
                    {entry.composedQuery}
                  </div>

                  <div className="text-[11px] font-mono text-[var(--v-ink-dim)] leading-relaxed">
                    Domain: {entry.targetDomain || 'All'}
                    {entry.dateRangeLabel ? ` · Date: ${entry.dateRangeLabel}` : ''}
                    {entry.positionRangeLabel ? ` · ${entry.positionRangeLabel}` : ''}
                    {entry.language ? ` · Lang: ${entry.language}` : ''}
                    {entry.country ? ` · Country: ${entry.country.toUpperCase()}` : ''}
                    {entry.sensitiveFiltersApplied.length > 0
                      ? ` · DLP: ${entry.sensitiveFiltersApplied.join(', ')}`
                      : ''}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 pt-3 border-t border-[var(--v-border)]">
                  <span className="text-[10px] font-mono tabular-nums text-[var(--v-ink-dim)]">
                    {new Date(entry.timestamp).toLocaleString()}
                  </span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => onRerunEntry(entry)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-mono font-medium text-[var(--v-ink)] bg-[var(--v-bg)] border border-[var(--v-border)] rounded-xs hover:border-[#ff4d00] hover:text-[#ff4d00] transition-colors"
                    >
                      <Play className="w-3 h-3" />
                      Re-run
                    </button>
                    <button
                      type="button"
                      onClick={() => onCreateAlertFromEntry(entry)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-mono font-medium text-[var(--v-ink)] bg-[var(--v-bg)] border border-[var(--v-border)] rounded-xs hover:border-[#ff4d00] hover:text-[#ff4d00] transition-colors"
                    >
                      <BellPlus className="w-3 h-3" />
                      Alert
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--v-bg)] border-b border-[var(--v-border)] text-[11px] font-mono font-bold uppercase tracking-wider text-[var(--v-ink-dim)]">
                <th className="py-2.5 px-4 w-40">Timestamp</th>
                <th className="py-2.5 px-4">Query &amp; Active Refinements</th>
                <th className="py-2.5 px-4 w-36">Platform / Mode</th>
                <th className="py-2.5 px-4 w-24 text-right">Results</th>
                <th className="py-2.5 px-4 w-44 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--v-border)] text-xs">
              {filtered.map((entry) => (
                <tr key={entry.id} className="hover:bg-[var(--v-surface-2)]/40 align-top transition-colors">
                  <td className="py-2.5 px-4 font-mono tabular-nums text-[11px] text-[var(--v-ink-dim)] whitespace-nowrap">
                    {new Date(entry.timestamp).toLocaleString()}
                  </td>
                  <td className="py-2.5 px-4 space-y-1 min-w-[260px]">
                    <div className="font-mono text-[var(--v-ink)] break-all">
                      {entry.composedQuery}
                    </div>
                    <div className="text-[11px] font-mono text-[var(--v-ink-dim)]">
                      Domain: {entry.targetDomain || 'All'}
                      {entry.dateRangeLabel ? ` · Date: ${entry.dateRangeLabel}` : ''}
                      {entry.positionRangeLabel
                        ? ` · ${entry.positionRangeLabel}`
                        : ''}
                      {entry.language ? ` · Lang: ${entry.language}` : ''}
                      {entry.country
                        ? ` · Country: ${entry.country.toUpperCase()}`
                        : ''}
                      {entry.sensitiveFiltersApplied.length > 0
                        ? ` · DLP: ${entry.sensitiveFiltersApplied.join(', ')}`
                        : ''}
                    </div>
                  </td>
                  <td className="py-2.5 px-4 font-mono text-[11px] text-[var(--v-ink)]">
                    <div className="font-bold uppercase text-[#ff4d00]">{entry.platform}</div>
                    <div className="text-[var(--v-ink-dim)]">{entry.executionMode}</div>
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono tabular-nums text-[var(--v-ink)]">
                    {entry.resultCount}
                  </td>
                  <td className="py-2.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => onRerunEntry(entry)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-mono font-medium text-[var(--v-ink)] bg-[var(--v-bg)] border border-[var(--v-border)] rounded-xs hover:border-[#ff4d00] hover:text-[#ff4d00] transition-colors"
                    >
                      <Play className="w-3 h-3" />
                      Re-run
                    </button>
                    <button
                      type="button"
                      onClick={() => onCreateAlertFromEntry(entry)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-mono font-medium text-[var(--v-ink)] bg-[var(--v-bg)] border border-[var(--v-border)] rounded-xs hover:border-[#ff4d00] hover:text-[#ff4d00] transition-colors"
                    >
                      <BellPlus className="w-3 h-3" />
                      Alert
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )
      ) : (
        <div className="p-12 text-center space-y-2">
          <div className="text-xs font-mono font-bold text-[var(--v-ink)]">
            No Search History Logged Yet
          </div>
          <p className="text-xs text-[var(--v-ink-dim)] max-w-md mx-auto">
            Every automated search or multi-platform query launch is recorded here for auditability and CSV reporting.
          </p>
        </div>
      )}
    </div>
  );
}
