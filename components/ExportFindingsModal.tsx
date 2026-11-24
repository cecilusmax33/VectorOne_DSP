'use client';

import React, { useMemo, useState } from 'react';
import {
  CheckSquare,
  Download,
  FileJson,
  FileSpreadsheet,
  Search,
  Square,
  X,
} from 'lucide-react';
import {
  FindingRecord,
  SensitivityLevel,
  TriageStatus,
} from '@/lib/types';

export type ExportFormat = 'csv' | 'json';

interface ExportFindingsModalProps {
  open: boolean;
  findings: FindingRecord[];
  initialSelectedIds?: string[];
  onClose: () => void;
  onDownload: (
    selectedFindings: FindingRecord[],
    format: ExportFormat,
    filename: string
  ) => void;
}

export default function ExportFindingsModal({
  open,
  findings,
  initialSelectedIds = [],
  onClose,
  onDownload,
}: ExportFindingsModalProps) {
  const [format, setFormat] = useState<ExportFormat>('csv');
  const [filenameBase, setFilenameBase] = useState(
    () => `vectorone_dsp_findings_${new Date().toISOString().slice(0, 10)}`
  );
  const [searchText, setSearchText] = useState('');
  const [domainFilter, setDomainFilter] = useState('All');
  const [sensitivityFilter, setSensitivityFilter] = useState<
    'All' | SensitivityLevel
  >('All');
  const [statusFilter, setStatusFilter] = useState<'All' | TriageStatus>('All');
  const [selectedIds, setSelectedIds] = useState<string[]>(() => {
    const validIds = new Set(findings.map((f) => f.id));
    const preselected = initialSelectedIds.filter((id) => validIds.has(id));
    return preselected.length > 0 ? preselected : findings.map((f) => f.id);
  });

  const uniqueDomains = useMemo(() => {
    const set = new Set(findings.map((f) => f.domain).filter(Boolean));
    return ['All', ...Array.from(set).sort()];
  }, [findings]);

  const filteredFindings = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    return findings.filter((f) => {
      if (domainFilter !== 'All' && f.domain !== domainFilter) return false;
      if (
        sensitivityFilter !== 'All' &&
        f.sensitivityCategory !== sensitivityFilter
      ) {
        return false;
      }
      if (statusFilter !== 'All' && f.triageStatus !== statusFilter) {
        return false;
      }
      if (!q) return true;
      return (
        f.title.toLowerCase().includes(q) ||
        f.url.toLowerCase().includes(q) ||
        f.domain.toLowerCase().includes(q) ||
        f.queryUsed.toLowerCase().includes(q) ||
        f.notes.toLowerCase().includes(q)
      );
    });
  }, [findings, searchText, domainFilter, sensitivityFilter, statusFilter]);

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  const selectedFindings = useMemo(
    () => findings.filter((f) => selectedSet.has(f.id)),
    [findings, selectedSet]
  );

  const allFilteredSelected =
    filteredFindings.length > 0 &&
    filteredFindings.every((f) => selectedSet.has(f.id));

  if (!open) return null;

  const toggleFinding = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllFiltered = () => {
    const filteredIds = filteredFindings.map((f) => f.id);
    if (allFilteredSelected) {
      const filteredSet = new Set(filteredIds);
      setSelectedIds((prev) => prev.filter((id) => !filteredSet.has(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...filteredIds])));
    }
  };

  const handleClearAll = () => {
    setSelectedIds([]);
  };

  const handleInvertVisible = () => {
    const visibleSet = new Set(filteredFindings.map((f) => f.id));
    setSelectedIds((prev) => {
      const prevSet = new Set(prev);
      const next = prev.filter((id) => !visibleSet.has(id));
      for (const f of filteredFindings) {
        if (!prevSet.has(f.id)) {
          next.push(f.id);
        }
      }
      return next;
    });
  };

  const sanitizedBase =
    filenameBase
      .trim()
      .replace(/\.(csv|json)$/i, '')
      .replace(/[^a-zA-Z0-9._-]+/g, '_') || 'vectorone_dsp_findings';
  const resolvedFilename = `${sanitizedBase}.${format}`;

  const sensitivityTextStyle = (level: SensitivityLevel) => {
    switch (level) {
      case 'Credential-Risk':
      case 'Regulated':
        return 'text-red-700 dark:text-red-400 font-semibold';
      case 'Sensitive-PII':
      case 'Config-Exposure':
        return 'text-amber-700 dark:text-amber-400 font-semibold';
      default:
        return 'text-[var(--v-ink-dim)]';
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="export-findings-modal-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl bg-[var(--v-surface)] border border-[var(--v-border)] border-t-[3px] border-t-[#ff4d00] rounded-xs shadow-lg overflow-hidden flex flex-col max-h-[88vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[var(--v-border)] bg-[var(--v-bg)] flex items-center justify-between shrink-0">
          <div>
            <h2
              id="export-findings-modal-title"
              className="font-display text-base font-extrabold uppercase tracking-tight text-[var(--v-ink)] flex items-center gap-2"
            >
              <Download className="w-4 h-4 text-[#ff4d00]" />
              Export Search Findings
            </h2>
            <p className="text-xs text-[var(--v-ink-dim)] mt-0.5">
              Select specific indexed findings from your local database and download them as CSV or JSON.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close export modal"
            className="p-1.5 text-[var(--v-ink-dim)] hover:text-[#ff4d00] rounded-xs transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Format & Filename Configuration */}
        <div className="px-6 py-4 border-b border-[var(--v-border)] grid grid-cols-1 md:grid-cols-12 gap-4 items-end shrink-0">
          <div className="md:col-span-5 space-y-1.5">
            <span className="block text-[11px] font-mono uppercase tracking-wider text-[var(--v-ink-dim)]">
              Export Format
            </span>
            <div
              role="radiogroup"
              aria-label="Export file format"
              className="grid grid-cols-2 p-1 bg-[var(--v-bg)] border border-[var(--v-border)] rounded-xs gap-1"
            >
              <button
                type="button"
                role="radio"
                aria-checked={format === 'csv'}
                onClick={() => setFormat('csv')}
                className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded-xs transition-colors whitespace-nowrap shrink-0 ${
                  format === 'csv'
                    ? 'bg-[#ff4d00] text-[#111113] font-bold'
                    : 'text-[var(--v-ink-dim)] hover:text-[var(--v-ink)]'
                }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                CSV (.csv)
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={format === 'json'}
                onClick={() => setFormat('json')}
                className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded-xs transition-colors whitespace-nowrap shrink-0 ${
                  format === 'json'
                    ? 'bg-[#ff4d00] text-[#111113] font-bold'
                    : 'text-[var(--v-ink-dim)] hover:text-[var(--v-ink)]'
                }`}
              >
                <FileJson className="w-3.5 h-3.5" />
                JSON (.json)
              </button>
            </div>
          </div>

          <div className="md:col-span-7 space-y-1.5">
            <label
              htmlFor="export-filename-input"
              className="block text-[11px] font-mono uppercase tracking-wider text-[var(--v-ink-dim)]"
            >
              Output Filename ({resolvedFilename})
            </label>
            <input
              id="export-filename-input"
              type="text"
              value={filenameBase}
              onChange={(e) => setFilenameBase(e.target.value)}
              placeholder="vectorone_dsp_findings"
              className="w-full px-3 py-2 text-xs font-mono bg-[var(--v-bg)] border border-[var(--v-border)] rounded-xs text-[var(--v-ink)] placeholder:text-[var(--v-ink-dim)] focus:outline-none focus:border-[#ff4d00]"
            />
          </div>
        </div>

        {/* Filter & Selection Toolbar */}
        <div className="px-6 py-3 bg-[var(--v-bg)] border-b border-[var(--v-border)] space-y-2.5 shrink-0">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
            <div className="sm:col-span-5 relative">
              <Search className="w-3.5 h-3.5 text-[var(--v-ink-dim)] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Filter findings to select..."
                className="w-full pl-8 pr-3 py-1.5 text-xs font-mono bg-[var(--v-surface)] border border-[var(--v-border)] rounded-xs text-[var(--v-ink)] placeholder:text-[var(--v-ink-dim)] focus:outline-none focus:border-[#ff4d00]"
              />
            </div>
            <div className="sm:col-span-3">
              <select
                value={domainFilter}
                onChange={(e) => setDomainFilter(e.target.value)}
                aria-label="Filter export list by domain"
                className="w-full px-2 py-1.5 text-xs font-mono bg-[var(--v-surface)] border border-[var(--v-border)] rounded-xs text-[var(--v-ink)] focus:outline-none focus:border-[#ff4d00]"
              >
                {uniqueDomains.map((dom) => (
                  <option key={dom} value={dom}>
                    {dom === 'All' ? 'All Domains' : dom}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <select
                value={sensitivityFilter}
                onChange={(e) =>
                  setSensitivityFilter(
                    e.target.value as 'All' | SensitivityLevel
                  )
                }
                aria-label="Filter export list by sensitivity"
                className="w-full px-2 py-1.5 text-xs font-mono bg-[var(--v-surface)] border border-[var(--v-border)] rounded-xs text-[var(--v-ink)] focus:outline-none focus:border-[#ff4d00]"
              >
                <option value="All">All Risk</option>
                <option value="Standard">Standard</option>
                <option value="Sensitive-PII">Sensitive-PII</option>
                <option value="Config-Exposure">Config-Exposure</option>
                <option value="Credential-Risk">Credential-Risk</option>
                <option value="Regulated">Regulated</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as 'All' | TriageStatus)
                }
                aria-label="Filter export list by triage status"
                className="w-full px-2 py-1.5 text-xs font-mono bg-[var(--v-surface)] border border-[var(--v-border)] rounded-xs text-[var(--v-ink)] focus:outline-none focus:border-[#ff4d00]"
              >
                <option value="All">All Triage</option>
                <option value="New">New</option>
                <option value="Reviewed">Reviewed</option>
                <option value="Archived">Archived</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono">
            <div className="text-[var(--v-ink-dim)] tabular-nums">
              <span className="text-[#ff4d00] font-bold">
                {selectedFindings.length}
              </span>{' '}
              of {findings.length} finding(s) selected ·{' '}
              {filteredFindings.length} shown
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleSelectAllFiltered}
                disabled={filteredFindings.length === 0}
                className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-mono text-[var(--v-ink)] bg-[var(--v-surface)] border border-[var(--v-border)] rounded-xs hover:border-[#ff4d00] hover:text-[#ff4d00] disabled:opacity-40 transition-colors whitespace-nowrap"
              >
                {allFilteredSelected ? (
                  <>
                    <Square className="w-3 h-3" />
                    Unselect Visible
                  </>
                ) : (
                  <>
                    <CheckSquare className="w-3 h-3" />
                    Select Visible ({filteredFindings.length})
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleInvertVisible}
                disabled={filteredFindings.length === 0}
                className="px-2 py-1 text-[11px] font-mono text-[var(--v-ink)] bg-[var(--v-surface)] border border-[var(--v-border)] rounded-xs hover:border-[#ff4d00] hover:text-[#ff4d00] disabled:opacity-40 transition-colors whitespace-nowrap"
              >
                Invert
              </button>
              <button
                type="button"
                onClick={handleClearAll}
                disabled={selectedFindings.length === 0}
                className="px-2 py-1 text-[11px] font-mono text-[var(--v-ink-dim)] bg-[var(--v-surface)] border border-[var(--v-border)] rounded-xs hover:border-[#ff4d00] hover:text-[#ff4d00] disabled:opacity-40 transition-colors whitespace-nowrap"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>

        {/* Scrollable Findings Selection List */}
        <div className="flex-1 overflow-y-auto scroll-smooth divide-y divide-[var(--v-border)]">
          {filteredFindings.length > 0 ? (
            filteredFindings.map((item) => {
              const isChecked = selectedSet.has(item.id);
              return (
                <label
                  key={item.id}
                  className={`px-6 py-3 flex items-start gap-3 cursor-pointer transition-colors ${
                    isChecked
                      ? 'bg-[#ff4d00]/[0.06] hover:bg-[#ff4d00]/[0.1]'
                      : 'hover:bg-[var(--v-surface-2)]/40'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleFinding(item.id)}
                    className="mt-1 rounded-xs border-[var(--v-border)] accent-[#ff4d00] shrink-0"
                  />
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <div className="text-xs font-medium text-[var(--v-ink)] truncate">
                        {item.rankPosition ? (
                          <span className="font-mono text-[var(--v-ink-dim)] mr-1.5">
                            #{item.rankPosition}
                          </span>
                        ) : null}
                        {item.title}
                      </div>
                      <span className="text-[11px] font-mono tabular-nums text-[var(--v-ink-dim)] shrink-0">
                        {new Date(item.discoveredAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="text-[11px] font-mono text-[#ff4d00] truncate">
                      {item.url}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] font-mono text-[var(--v-ink-dim)]">
                      <span>{item.domain || 'unknown'}</span>
                      <span aria-hidden="true">·</span>
                      <span>{item.platform}</span>
                      <span aria-hidden="true">·</span>
                      <span className={sensitivityTextStyle(item.sensitivityCategory)}>
                        {item.sensitivityCategory}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{item.triageStatus}</span>
                    </div>
                  </div>
                </label>
              );
            })
          ) : (
            <div className="p-10 text-center space-y-2">
              <div className="text-xs font-mono font-bold text-[var(--v-ink)]">
                {findings.length === 0
                  ? 'No Saved Findings in Database'
                  : 'No Findings Match Filter'}
              </div>
              <p className="text-xs text-[var(--v-ink-dim)] max-w-md mx-auto">
                {findings.length === 0
                  ? 'Save results from the Query Workbench or import a JSON backup to export findings.'
                  : 'Adjust your search query or dropdown filters above to view findings.'}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-[var(--v-border)] bg-[var(--v-bg)] flex flex-wrap items-center justify-between gap-3 shrink-0">
          <span className="text-[11px] font-mono text-[var(--v-ink-dim)] tabular-nums">
            Ready to download {selectedFindings.length} finding(s) as{' '}
            <strong className="text-[var(--v-ink)]">
              {format.toUpperCase()}
            </strong>
          </span>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-mono font-medium text-[var(--v-ink)] bg-[var(--v-surface)] border border-[var(--v-border)] rounded-xs hover:border-[#ff4d00] hover:text-[#ff4d00] transition-colors whitespace-nowrap"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={selectedFindings.length === 0}
              onClick={() =>
                onDownload(selectedFindings, format, resolvedFilename)
              }
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-display font-extrabold uppercase tracking-tight text-[#111113] bg-[#ff4d00] rounded-xs hover:bg-[#ff621f] disabled:opacity-40 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5" />
              Download {format.toUpperCase()} ({selectedFindings.length})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
