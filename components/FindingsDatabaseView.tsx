'use client';

import React, { useMemo, useRef, useState } from 'react';
import {
  Download,
  ExternalLink,
  LayoutGrid,
  Mail,
  Search,
  Table2,
  Trash2,
  Upload,
} from 'lucide-react';
import {
  FindingRecord,
  SensitivityLevel,
  TriageStatus,
} from '@/lib/types';

interface FindingsDatabaseViewProps {
  findings: FindingRecord[];
  onUpdateStatus: (id: string, status: TriageStatus) => void;
  onUpdateNotes: (id: string, notes: string) => void;
  onDeleteFindings: (ids: string[]) => void;
  onOpenExportModal: (preselectedIds?: string[]) => void;
  onImportJson: (records: FindingRecord[]) => void;
  onSendDigest: (selected: FindingRecord[]) => void;
}

export default function FindingsDatabaseView({
  findings,
  onUpdateStatus,
  onUpdateNotes,
  onDeleteFindings,
  onOpenExportModal,
  onImportJson,
  onSendDigest,
}: FindingsDatabaseViewProps) {
  const [searchText, setSearchText] = useState('');
  const [domainFilter, setDomainFilter] = useState('All');
  const [sensitivityFilter, setSensitivityFilter] = useState<
    'All' | SensitivityLevel
  >('All');
  const [statusFilter, setStatusFilter] = useState<'All' | TriageStatus>('All');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const uniqueDomains = useMemo(() => {
    const set = new Set(findings.map((f) => f.domain).filter(Boolean));
    return ['All', ...Array.from(set).sort()];
  }, [findings]);

  const filtered = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    return findings.filter((f) => {
      if (domainFilter !== 'All' && f.domain !== domainFilter) return false;
      if (
        sensitivityFilter !== 'All' &&
        f.sensitivityCategory !== sensitivityFilter
      )
        return false;
      if (statusFilter !== 'All' && f.triageStatus !== statusFilter)
        return false;
      if (!q) return true;
      return (
        f.title.toLowerCase().includes(q) ||
        f.url.toLowerCase().includes(q) ||
        f.domain.toLowerCase().includes(q) ||
        f.queryUsed.toLowerCase().includes(q) ||
        f.snippet.toLowerCase().includes(q) ||
        f.notes.toLowerCase().includes(q)
      );
    });
  }, [findings, searchText, domainFilter, sensitivityFilter, statusFilter]);

  const allSelected =
    filtered.length > 0 && filtered.every((f) => selectedIds.includes(f.id));

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filtered.map((f) => f.id));
    }
  };

  const toggleRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportError(null);
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (!Array.isArray(parsed)) {
        throw new Error('JSON backup must contain an array of finding records.');
      }
      onImportJson(parsed as FindingRecord[]);
    } catch (err: unknown) {
      setImportError(
        err instanceof Error ? err.message : 'Failed to parse JSON import.'
      );
    } finally {
      e.target.value = '';
    }
  };

  const selectedRecords = filtered.filter((f) => selectedIds.includes(f.id));

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
    <div className="col-span-full bg-[var(--v-surface)] border border-[var(--v-border)] border-t-[3px] border-t-[#ff4d00] divide-y divide-[var(--v-border)]">
      {/* Header & Export Toolbar */}
      <div className="p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-xl sm:text-2xl font-extrabold uppercase tracking-tight text-[var(--v-ink)]">
            Searchable Findings Database
          </h1>
          <p className="text-xs font-mono text-[var(--v-ink-dim)] mt-1 tabular-nums">
            {findings.length} total stored finding(s) · {filtered.length}{' '}
            matching current filters
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

          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-medium text-[var(--v-ink)] bg-[var(--v-bg)] border border-[var(--v-border)] rounded-xs hover:border-[#ff4d00] hover:text-[#ff4d00] transition-colors whitespace-nowrap"
          >
            <Upload className="w-3.5 h-3.5" />
            Import JSON
          </button>
          <button
            type="button"
            onClick={() =>
              onOpenExportModal(
                selectedRecords.length > 0
                  ? selectedRecords.map((r) => r.id)
                  : filtered.map((f) => f.id)
              )
            }
            disabled={findings.length === 0}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-display font-extrabold uppercase tracking-tight text-[#111113] bg-[#ff4d00] rounded-xs hover:bg-[#ff621f] disabled:opacity-40 transition-colors whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" />
            Export Findings ({selectedRecords.length > 0 ? selectedRecords.length : filtered.length})
          </button>
        </div>
      </div>

      {importError && (
        <div className="px-5 py-2.5 bg-red-50 dark:bg-red-950/40 text-xs text-red-800 dark:text-red-200">
          {importError}
        </div>
      )}

      {/* Search & Multi-Facet Filter Bar */}
      <div className="px-6 py-3.5 bg-[var(--v-bg)] grid grid-cols-1 md:grid-cols-12 gap-2.5 items-center">
        <div className="md:col-span-5 relative">
          <Search className="w-3.5 h-3.5 text-[var(--v-ink-dim)] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search title, URL, domain, query, or analyst notes..."
            className="w-full pl-8 pr-3 py-1.5 text-xs font-mono bg-[var(--v-surface)] border border-[var(--v-border)] rounded-xs text-[var(--v-ink)] placeholder:text-[var(--v-ink-dim)] focus:outline-none focus:border-[#ff4d00]"
          />
        </div>

        <div className="md:col-span-3">
          <select
            value={domainFilter}
            onChange={(e) => setDomainFilter(e.target.value)}
            className="w-full px-2.5 py-1.5 text-xs font-mono bg-[var(--v-surface)] border border-[var(--v-border)] rounded-xs text-[var(--v-ink)] focus:outline-none focus:border-[#ff4d00]"
          >
            {uniqueDomains.map((dom) => (
              <option key={dom} value={dom}>
                {dom === 'All' ? 'All Domains' : dom}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2">
          <select
            value={sensitivityFilter}
            onChange={(e) =>
              setSensitivityFilter(e.target.value as 'All' | SensitivityLevel)
            }
            className="w-full px-2.5 py-1.5 text-xs font-mono bg-[var(--v-surface)] border border-[var(--v-border)] rounded-xs text-[var(--v-ink)] focus:outline-none focus:border-[#ff4d00]"
          >
            <option value="All">All Sensitivity</option>
            <option value="Standard">Standard</option>
            <option value="Sensitive-PII">Sensitive-PII</option>
            <option value="Config-Exposure">Config-Exposure</option>
            <option value="Credential-Risk">Credential-Risk</option>
            <option value="Regulated">Regulated</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as 'All' | TriageStatus)
            }
            className="w-full px-2.5 py-1.5 text-xs font-mono bg-[var(--v-surface)] border border-[var(--v-border)] rounded-xs text-[var(--v-ink)] focus:outline-none focus:border-[#ff4d00]"
          >
            <option value="All">All Triage</option>
            <option value="New">New</option>
            <option value="Reviewed">Reviewed</option>
            <option value="Archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Bulk Action Strip */}
      {selectedRecords.length > 0 && (
        <div className="px-6 py-2.5 bg-[#ff4d00]/10 flex flex-wrap items-center justify-between gap-3 text-xs">
          <span className="font-mono font-semibold text-[var(--v-ink)] tabular-nums">
            {selectedRecords.length} finding(s) selected
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() =>
                onOpenExportModal(selectedRecords.map((r) => r.id))
              }
              className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-mono font-bold bg-[var(--v-surface)] text-[var(--v-ink)] border border-[var(--v-border)] rounded-xs hover:border-[#ff4d00] hover:text-[#ff4d00] transition-colors whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5" />
              Export Selected
            </button>
            <button
              type="button"
              onClick={() => onSendDigest(selectedRecords)}
              className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-mono font-bold bg-[#ff4d00] text-[#111113] rounded-xs hover:bg-[#ff621f] transition-colors whitespace-nowrap"
            >
              <Mail className="w-3.5 h-3.5" />
              Send Gmail Digest
            </button>
            <button
              type="button"
              onClick={() => {
                onDeleteFindings(selectedRecords.map((r) => r.id));
                setSelectedIds([]);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-mono font-medium text-red-700 dark:text-red-300 bg-[var(--v-bg)] border border-red-300 dark:border-red-800 rounded-xs hover:bg-red-50 dark:hover:bg-red-950/40"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete Selected
            </button>
          </div>
        </div>
      )}

      {/* Responsive 1/2/3-Column Grid or High-Density Table */}
      {filtered.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="p-5 bg-[var(--v-bg)]/40 space-y-3">
            <div className="flex items-center justify-between text-[11px] font-mono text-[var(--v-ink-dim)]">
              <label className="inline-flex items-center gap-2 cursor-pointer hover:text-[var(--v-ink)]">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleSelectAll}
                  aria-label="Select all filtered findings"
                  className="rounded-xs border-[var(--v-border)] accent-[#ff4d00]"
                />
                <span>Select all {filtered.length} matching finding(s)</span>
              </label>
              <span className="tabular-nums">
                {selectedRecords.length} selected
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 items-stretch">
              {filtered.map((item) => {
                const isSelected = selectedIds.includes(item.id);
                return (
                  <article
                    key={item.id}
                    className={`min-w-0 bg-[var(--v-surface)] border p-4 flex flex-col justify-between gap-3.5 transition-colors ${
                      isSelected
                        ? 'border-[#ff4d00]'
                        : 'border-[var(--v-border)] hover:border-[#ff4d00]/60'
                    }`}
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <label className="inline-flex items-center gap-2 cursor-pointer min-w-0">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleRow(item.id)}
                            aria-label={`Select ${item.title}`}
                            className="rounded-xs border-[var(--v-border)] accent-[#ff4d00] shrink-0"
                          />
                          <span className="font-mono text-[11px] text-[var(--v-ink-dim)] truncate">
                            {item.rankPosition ? `#${item.rankPosition} · ` : ''}
                            {item.domain}
                          </span>
                        </label>
                        <span
                          className={`text-[11px] font-mono shrink-0 ${sensitivityTextStyle(
                            item.sensitivityCategory
                          )}`}
                        >
                          {item.sensitivityCategory}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <h3 className="text-xs font-semibold text-[var(--v-ink)] leading-snug">
                          {item.title}
                        </h3>
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] font-mono text-[#ff4d00] hover:underline break-all inline-flex items-center gap-1"
                        >
                          {item.url}
                          <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                        </a>
                      </div>

                      <div className="p-2 bg-[var(--v-bg)] border border-[var(--v-border)] rounded-xs text-[11px] font-mono text-[var(--v-ink-dim)] break-all">
                        {item.queryUsed}
                      </div>
                    </div>

                    <div className="space-y-2 pt-2.5 border-t border-[var(--v-border)]">
                      <div className="flex items-center justify-between gap-2 text-[11px] font-mono text-[var(--v-ink-dim)]">
                        <span>
                          {item.platform}
                          {item.language ? ` · ${item.language}` : ''}
                          {item.country ? ` · ${item.country.toUpperCase()}` : ''}
                        </span>
                        <span className="tabular-nums">
                          {new Date(item.discoveredAt).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <select
                          value={item.triageStatus}
                          onChange={(e) =>
                            onUpdateStatus(item.id, e.target.value as TriageStatus)
                          }
                          aria-label={`Triage status for ${item.title}`}
                          className="w-full px-2 py-1 text-[11px] font-mono bg-[var(--v-bg)] border border-[var(--v-border)] rounded-xs text-[var(--v-ink)] focus:outline-none focus:border-[#ff4d00]"
                        >
                          <option value="New">New</option>
                          <option value="Reviewed">Reviewed</option>
                          <option value="Archived">Archived</option>
                        </select>
                        <input
                          type="text"
                          value={item.notes}
                          onChange={(e) => onUpdateNotes(item.id, e.target.value)}
                          placeholder="Add remediation note..."
                          className="w-full px-2 py-1 text-[11px] bg-[var(--v-bg)] border border-[var(--v-border)] rounded-xs text-[var(--v-ink)] placeholder:text-[var(--v-ink-dim)] focus:outline-none focus:border-[#ff4d00]"
                        />
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--v-bg)] border-b border-[var(--v-border)] text-[11px] font-mono font-bold uppercase tracking-wider text-[var(--v-ink-dim)]">
                <th className="py-2.5 px-3 w-10">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleSelectAll}
                    aria-label="Select all filtered findings"
                    className="rounded-xs border-[var(--v-border)] accent-[#ff4d00]"
                  />
                </th>
                <th className="py-2.5 px-3">Finding &amp; Query Context</th>
                <th className="py-2.5 px-3 w-40">Domain &amp; Geo</th>
                <th className="py-2.5 px-3 w-36">Sensitivity</th>
                <th className="py-2.5 px-3 w-32">Triage</th>
                <th className="py-2.5 px-3 w-52">Analyst Notes</th>
                <th className="py-2.5 px-3 w-28 text-right">Discovered</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--v-border)] text-xs">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-[var(--v-surface-2)]/40 align-top transition-colors">
                  <td className="py-2.5 px-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(item.id)}
                      onChange={() => toggleRow(item.id)}
                      aria-label={`Select ${item.title}`}
                      className="mt-0.5 rounded-xs border-[var(--v-border)] accent-[#ff4d00]"
                    />
                  </td>
                  <td className="py-2.5 px-3 min-w-[260px] space-y-0.5">
                    <div className="font-medium text-[var(--v-ink)]">
                      {item.rankPosition ? (
                        <span className="font-mono text-[var(--v-ink-dim)] mr-1.5">
                          #{item.rankPosition}
                        </span>
                      ) : null}
                      {item.title}
                    </div>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-mono text-[#ff4d00] hover:underline break-all inline-flex items-center gap-1"
                    >
                      {item.url}
                      <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                    </a>
                    <div className="text-[11px] font-mono text-[var(--v-ink-dim)] truncate max-w-md">
                      {item.queryUsed}
                    </div>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-[11px] text-[var(--v-ink)]">
                    <div>{item.domain}</div>
                    <div className="text-[var(--v-ink-dim)]">
                      {item.platform}
                      {item.language ? ` · ${item.language}` : ''}
                      {item.country ? ` · ${item.country.toUpperCase()}` : ''}
                    </div>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-[11px]">
                    <span className={sensitivityTextStyle(item.sensitivityCategory)}>
                      {item.sensitivityCategory}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <select
                      value={item.triageStatus}
                      onChange={(e) =>
                        onUpdateStatus(item.id, e.target.value as TriageStatus)
                      }
                      className="w-full px-2 py-1 text-[11px] font-mono bg-[var(--v-bg)] border border-[var(--v-border)] rounded-xs text-[var(--v-ink)] focus:outline-none focus:border-[#ff4d00]"
                    >
                      <option value="New">New</option>
                      <option value="Reviewed">Reviewed</option>
                      <option value="Archived">Archived</option>
                    </select>
                  </td>
                  <td className="py-2.5 px-3">
                    <input
                      type="text"
                      value={item.notes}
                      onChange={(e) => onUpdateNotes(item.id, e.target.value)}
                      placeholder="Add remediation note..."
                      className="w-full px-2 py-1 text-[11px] bg-[var(--v-bg)] border border-[var(--v-border)] rounded-xs text-[var(--v-ink)] placeholder:text-[var(--v-ink-dim)] focus:outline-none focus:border-[#ff4d00]"
                    />
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono tabular-nums text-[11px] text-[var(--v-ink-dim)] whitespace-nowrap">
                    {new Date(item.discoveredAt).toLocaleDateString()}
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
            No Saved Findings Yet
          </div>
          <p className="text-xs text-[var(--v-ink-dim)] max-w-md mx-auto">
            Execute an automated search in the Query Workbench and save results to populate your local searchable findings database, or import a JSON backup.
          </p>
        </div>
      )}
    </div>
  );
}
