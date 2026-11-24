'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  BookMarked,
  Check,
  Copy,
  Database,
  ExternalLink,
  Mail,
  Play,
  Plus,
  Send,
  Webhook,
} from 'lucide-react';
import {
  buildPlatformSearchUrl,
  composeDorkQuery,
  COUNTRY_OPTIONS,
  DORK_CATALOG,
  LANGUAGE_OPTIONS,
  PLATFORM_DEFINITIONS,
  resolveDateBounds,
  resolvePositionWindow,
  SENSITIVE_DATA_FILTERS,
} from '@/lib/dork-catalog';
import {
  ExternalApiConfig,
  FindingRecord,
  PlatformId,
  SearchParameters,
  SensitivityLevel,
} from '@/lib/types';

export interface LiveSearchResultItem {
  rankPosition: number;
  title: string;
  url: string;
  domain: string;
  snippet: string;
  saved?: boolean;
}

interface QueryWorkbenchProps {
  params: SearchParameters;
  onUpdateParams: (updater: (prev: SearchParameters) => SearchParameters) => void;
  isSearching: boolean;
  searchError: string | null;
  liveSummary: string;
  liveResults: LiveSearchResultItem[];
  executedQueries: string[];
  onRunAutomatedSearch: () => void;
  onLogExternalLaunch: (platform: PlatformId, query: string) => void;
  onSaveFinding: (item: LiveSearchResultItem) => void;
  onSaveAllFindings: () => void;
  onOpenCheatSheet: () => void;
  onSendResultsAlert: (items: LiveSearchResultItem[]) => void;
  externalApis: ExternalApiConfig[];
  onRunExternalApi: (api: ExternalApiConfig, query: string) => Promise<void>;
  externalApiOutput: { provider: string; status: number; body: string } | null;
  isRunningExternalApi: boolean;
  queryInputRef?: React.RefObject<HTMLTextAreaElement | null>;
}

export default function QueryWorkbench({
  params,
  onUpdateParams,
  isSearching,
  searchError,
  liveSummary,
  liveResults,
  executedQueries,
  onRunAutomatedSearch,
  onLogExternalLaunch,
  onSaveFinding,
  onSaveAllFindings,
  onOpenCheatSheet,
  onSendResultsAlert,
  externalApis,
  onRunExternalApi,
  externalApiOutput,
  isRunningExternalApi,
  queryInputRef,
}: QueryWorkbenchProps) {
  const [copied, setCopied] = useState(false);
  const resultsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isSearching && liveResults.length > 0 && resultsRef.current) {
      const prefersReduced =
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      resultsRef.current.scrollIntoView({
        behavior: prefersReduced ? 'auto' : 'smooth',
        block: 'nearest',
      });
    }
  }, [isSearching, liveResults.length]);

  const composedQuery = composeDorkQuery(params);
  const dateBounds = resolveDateBounds(params);
  const posWindow = resolvePositionWindow(params);
  const activeDork = params.activeDorkId
    ? DORK_CATALOG.find((d) => d.id === params.activeDorkId)
    : null;

  const activeLanguageLabel =
    LANGUAGE_OPTIONS.find((l) => l.code === params.language)?.label ||
    'Any Language';
  const activeCountryLabel =
    COUNTRY_OPTIONS.find((c) => c.code === params.country)?.label || 'Global';

  const activeSensitiveNames = params.activeSensitiveFilterIds
    .map((id) => SENSITIVE_DATA_FILTERS.find((f) => f.id === id)?.label)
    .filter((v): v is string => Boolean(v));

  const inferSensitivityLabel = (): SensitivityLevel => {
    if (params.activeSensitiveFilterIds.length > 0) {
      const first = SENSITIVE_DATA_FILTERS.find(
        (f) => f.id === params.activeSensitiveFilterIds[0]
      );
      if (first) return first.category;
    }
    return activeDork?.sensitivityLevel ?? 'Standard';
  };

  const handleCopyQuery = async () => {
    if (!composedQuery) return;
    try {
      await navigator.clipboard.writeText(composedQuery);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard unavailable
    }
  };

  const enabledSearchApis = externalApis.filter(
    (a) => a.providerType === 'Search API' && a.endpointUrl.trim()
  );

  const handleAppendOperator = (snippet: string) => {
    const base =
      params.customRawOverride !== '' ? params.customRawOverride : composedQuery;
    const next = base.trim() ? `${base.trim()} ${snippet}` : snippet;
    onUpdateParams((prev) => ({
      ...prev,
      customRawOverride: next,
    }));
    queryInputRef?.current?.focus();
  };

  const quickOperators = [
    { label: 'site:', snippet: `site:${params.targetDomain.trim() || 'example.com'}` },
    { label: 'filetype:pdf', snippet: 'filetype:pdf' },
    { label: 'inurl:', snippet: 'inurl:admin' },
    { label: 'intitle:', snippet: 'intitle:"index of"' },
    { label: 'intext:', snippet: 'intext:"confidential"' },
    { label: 'after:', snippet: 'after:2025-01-01' },
  ];

  return (
    <>
      {/* Section 1: Editorial Hero & Platform Selector */}
      <div className="col-span-full space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-3 max-w-2xl">
            <h1 className="font-display text-4xl sm:text-5xl font-extrabold leading-[0.95] text-[var(--v-ink)] text-balance">
              Operator Composer.
            </h1>
            <p className="text-sm text-[var(--v-ink-dim)] leading-relaxed">
              Refine domain scope, date bounds, result position window, language, country, and sensitive DLP filters from the sidebar or edit raw syntax directly.
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenCheatSheet}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-mono text-[var(--v-ink)] bg-[var(--v-surface)] border border-[var(--v-border)] rounded-xs hover:border-[#ff4d00] hover:text-[#ff4d00] transition-colors whitespace-nowrap"
          >
            <BookMarked className="w-3.5 h-3.5 text-[#ff4d00]" />
            Operator Cheat Sheet
          </button>
        </div>

        {/* Platform Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="inline-flex flex-wrap items-center gap-1 p-1 bg-[var(--v-surface)] rounded-xs border border-[var(--v-border)]">
            {PLATFORM_DEFINITIONS.map((plat) => {
              const active = params.selectedPlatform === plat.id;
              return (
                <button
                  key={plat.id}
                  type="button"
                  onClick={() =>
                    onUpdateParams((prev) => ({
                      ...prev,
                      selectedPlatform: plat.id,
                    }))
                  }
                  title={plat.shortNote}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-xs transition-colors whitespace-nowrap ${
                    active
                      ? 'bg-[#ff4d00] text-[#111113]'
                      : 'text-[var(--v-ink-dim)] hover:text-[var(--v-ink)]'
                  }`}
                >
                  {plat.label}
                </button>
              );
            })}
          </div>

          <div className="text-xs font-mono text-[var(--v-ink-dim)]">
            Classification:{' '}
            <span
              className={
                inferSensitivityLabel() === 'Standard'
                  ? 'font-bold text-[var(--v-ink)]'
                  : 'font-bold text-[#ff4d00]'
              }
            >
              {inferSensitivityLabel()}
            </span>
          </div>
        </div>
      </div>

      {/* Section 2A: Signature Query Card with 3px Top Vermilion Accent */}
      <div className="col-span-1 md:col-span-1 xl:col-span-2 min-w-0 bg-[var(--v-surface)] border border-[var(--v-border)] border-t-[3px] border-t-[#ff4d00] p-6 space-y-5">
        {/* Active Dork Explanation Banner (if loaded from catalog) */}
        {activeDork && (
          <div className="p-3.5 bg-[var(--v-bg)] border border-[var(--v-border)] rounded-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="text-xs space-y-0.5">
              <div className="font-semibold text-[var(--v-ink)]">
                Active Template: {activeDork.name} ({activeDork.category})
              </div>
              <div className="text-[var(--v-ink-dim)]">{activeDork.whatItDoes}</div>
            </div>
            <button
              type="button"
              onClick={() =>
                onUpdateParams((prev) => ({ ...prev, activeDorkId: null }))
              }
              className="text-[11px] font-mono text-[var(--v-ink-dim)] hover:text-[#ff4d00] whitespace-nowrap self-start sm:self-center"
            >
              Clear Template
            </button>
          </div>
        )}

        {/* Composed Query Input Box */}
        <div className="space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-[var(--v-ink-dim)]">
            <span>
              Composed Query ({params.selectedPlatform.toUpperCase()} syntax)
              {params.customRawOverride ? ' · Manual override active' : ''}
            </span>
            <div className="flex items-center gap-4">
              {params.customRawOverride && (
                <button
                  type="button"
                  onClick={() =>
                    onUpdateParams((prev) => ({
                      ...prev,
                      customRawOverride: '',
                    }))
                  }
                  className="text-[#ff4d00] hover:underline"
                >
                  Sync back to sidebar parameters
                </button>
              )}
              <button
                type="button"
                onClick={handleCopyQuery}
                disabled={!composedQuery}
                className="inline-flex items-center gap-1.5 text-[var(--v-ink-dim)] hover:text-[#ff4d00] disabled:opacity-40"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-500" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    Copy to Clipboard
                  </>
                )}
              </button>
            </div>
          </div>

          <textarea
            ref={queryInputRef}
            rows={4}
            value={
              params.customRawOverride !== ''
                ? params.customRawOverride
                : composedQuery
            }
            onChange={(e) =>
              onUpdateParams((prev) => ({
                ...prev,
                customRawOverride: e.target.value,
              }))
            }
            placeholder="Configure domain/keywords in the sidebar or type any search operator query directly (e.g. site:example.com filetype:pdf confidential)..."
            className="w-full p-3.5 text-xs font-mono bg-[var(--v-bg)] border border-[var(--v-border)] rounded-xs text-[var(--v-ink)] placeholder:text-[var(--v-ink-dim)] focus:outline-none focus:border-[#ff4d00] leading-relaxed"
          />

          {/* Active Constraints Summary Line (Zero-Pill Inline Metadata) */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] font-mono text-[var(--v-ink-dim)] pt-1">
            <span>
              Date: <strong className="font-bold text-[var(--v-ink)]">{dateBounds.label}</strong>
            </span>
            <span aria-hidden="true">·</span>
            <span>
              Ranks:{' '}
              <strong className="font-bold tabular-nums text-[var(--v-ink)]">
                {posWindow.label}
              </strong>
            </span>
            <span aria-hidden="true">·</span>
            <span>
              Language:{' '}
              <strong className="font-bold text-[var(--v-ink)]">
                {activeLanguageLabel}
              </strong>
            </span>
            <span aria-hidden="true">·</span>
            <span>
              Country:{' '}
              <strong className="font-bold text-[var(--v-ink)]">
                {activeCountryLabel}
              </strong>
            </span>
            {activeSensitiveNames.length > 0 && (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-[#ff4d00] font-bold">
                  Sensitive Filters: {activeSensitiveNames.join(', ')}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Action Row: Automated Search + External API + Direct Multi-Platform Launchers */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-[var(--v-border)]">
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={onRunAutomatedSearch}
              disabled={isSearching || !composedQuery}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-display font-extrabold uppercase tracking-tight bg-[#ff4d00] text-[#111113] rounded-xs hover:bg-[#ff621f] disabled:opacity-50 transition-colors whitespace-nowrap"
            >
              <Play className="w-3.5 h-3.5" />
              {isSearching
                ? 'Running Grounded Search...'
                : 'Run Automated Search'}
            </button>

            {enabledSearchApis.map((api) => (
              <button
                key={api.id}
                type="button"
                disabled={isRunningExternalApi || !composedQuery}
                onClick={() => onRunExternalApi(api, composedQuery)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-medium text-[var(--v-ink)] bg-[var(--v-bg)] border border-[var(--v-border)] rounded-xs hover:border-[#ff4d00] hover:text-[#ff4d00] disabled:opacity-50 whitespace-nowrap"
              >
                <Webhook className="w-3.5 h-3.5 text-[#ff4d00]" />
                {api.providerName}
              </button>
            ))}
          </div>

          {/* Multi-Platform Direct Launchers */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-mono text-[var(--v-ink-dim)] mr-1">
              Launch on:
            </span>
            {PLATFORM_DEFINITIONS.map((plat) => {
              const platQuery = composeDorkQuery(params, plat.id);
              const href = buildPlatformSearchUrl(platQuery, plat.id, params);
              return (
                <a
                  key={plat.id}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => onLogExternalLaunch(plat.id, platQuery)}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-mono text-[var(--v-ink-dim)] bg-[var(--v-bg)] border border-[var(--v-border)] rounded-xs hover:border-[#ff4d00] hover:text-[#ff4d00] transition-colors whitespace-nowrap"
                >
                  {plat.label}
                  <ExternalLink className="w-3 h-3" />
                </a>
              );
            })}
          </div>
        </div>
      </div>

      {/* Section 2B: Active Refinement Scope & Quick Operator Insertion (Completes 2-col on md, 3-col on xl) */}
      <aside className="col-span-1 min-w-0 bg-[var(--v-surface)] border border-[var(--v-border)] border-t-[3px] border-t-[#ff4d00] p-5 space-y-4">
        <div className="flex items-center justify-between gap-2 pb-3 border-b border-[var(--v-border)]">
          <div>
            <h2 className="font-display text-sm font-bold uppercase tracking-tight text-[var(--v-ink)]">
              Active Refinement Scope
            </h2>
            <p className="text-[11px] text-[var(--v-ink-dim)] mt-0.5">
              Live parameter state &amp; 1-click operator snippets.
            </p>
          </div>
        </div>

        <dl className="divide-y divide-[var(--v-border)] text-xs">
          <div className="py-2 flex items-center justify-between gap-2">
            <dt className="font-mono text-[11px] text-[var(--v-ink-dim)]">Target Domain</dt>
            <dd className="font-mono font-semibold text-[var(--v-ink)] truncate">
              {params.targetDomain.trim() || 'Global'}
            </dd>
          </div>
          <div className="py-2 flex items-center justify-between gap-2">
            <dt className="font-mono text-[11px] text-[var(--v-ink-dim)]">Date Bounds</dt>
            <dd className="font-mono font-semibold text-[var(--v-ink)] truncate">
              {dateBounds.label}
            </dd>
          </div>
          <div className="py-2 flex items-center justify-between gap-2">
            <dt className="font-mono text-[11px] text-[var(--v-ink-dim)]">Position Window</dt>
            <dd className="font-mono font-semibold tabular-nums text-[var(--v-ink)]">
              {posWindow.label}
            </dd>
          </div>
          <div className="py-2 flex items-center justify-between gap-2">
            <dt className="font-mono text-[11px] text-[var(--v-ink-dim)]">Language</dt>
            <dd className="font-mono font-semibold text-[var(--v-ink)] truncate">
              {activeLanguageLabel}
            </dd>
          </div>
          <div className="py-2 flex items-center justify-between gap-2">
            <dt className="font-mono text-[11px] text-[var(--v-ink-dim)]">Country</dt>
            <dd className="font-mono font-semibold text-[var(--v-ink)] truncate">
              {activeCountryLabel}
            </dd>
          </div>
          <div className="py-2 flex items-start justify-between gap-2">
            <dt className="font-mono text-[11px] text-[var(--v-ink-dim)] shrink-0">DLP Filters</dt>
            <dd className="font-mono font-semibold text-right text-[#ff4d00]">
              {activeSensitiveNames.length > 0
                ? activeSensitiveNames.join(', ')
                : 'None selected'}
            </dd>
          </div>
        </dl>

        <div className="pt-2 border-t border-[var(--v-border)] space-y-2">
          <div className="text-[11px] font-mono uppercase tracking-wider text-[var(--v-ink-dim)]">
            Quick Insert Operators
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 gap-1.5">
            {quickOperators.map((op) => (
              <button
                key={op.label}
                type="button"
                onClick={() => handleAppendOperator(op.snippet)}
                className="px-2.5 py-1.5 text-[11px] font-mono text-left text-[var(--v-ink)] bg-[var(--v-bg)] border border-[var(--v-border)] rounded-xs hover:border-[#ff4d00] hover:text-[#ff4d00] transition-colors truncate"
                title={`Append ${op.snippet}`}
              >
                + {op.label}
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* Section 3: External API Response Inspector (if executed) */}
      {externalApiOutput && (
        <div className="col-span-full p-5 bg-[var(--v-surface)] border border-[var(--v-border)] space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="font-bold text-[var(--v-ink)]">
              External API Response — {externalApiOutput.provider}
            </span>
            <span className="tabular-nums text-[#ff4d00]">
              HTTP {externalApiOutput.status}
            </span>
          </div>
          <pre className="p-3.5 bg-[var(--v-bg)] border border-[var(--v-border)] rounded-xs text-[11px] font-mono text-[var(--v-ink)] max-h-48 overflow-y-auto whitespace-pre-wrap">
            {externalApiOutput.body}
          </pre>
        </div>
      )}

      {/* Section 4: Error Banner */}
      {searchError && (
        <div className="col-span-full px-5 py-3.5 bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-900/70 text-xs text-red-800 dark:text-red-200">
          <strong>Search Error:</strong> {searchError}
        </div>
      )}

      {/* Section 5: Live Automated Results */}
      <div ref={resultsRef} className="col-span-full space-y-4">
        {(isSearching || liveResults.length > 0 || liveSummary) && (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-[var(--v-ink)]">
                Automated Search Findings
              </h2>
              <p className="text-xs text-[var(--v-ink-dim)]">
                {liveResults.length > 0
                  ? `${liveResults.length} web-grounded result(s) retrieved within ${posWindow.label}.`
                  : 'Executing grounded web search across selected scope.'}
              </p>
            </div>

            {liveResults.length > 0 && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onSendResultsAlert(liveResults)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[var(--v-ink)] bg-[var(--v-surface)] border border-[var(--v-border)] rounded-xs hover:border-[#ff4d00] whitespace-nowrap"
                >
                  <Mail className="w-3.5 h-3.5 text-[#ff4d00]" />
                  Send Gmail Alert
                </button>
                <button
                  type="button"
                  onClick={onSaveAllFindings}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-[#111113] bg-[#ff4d00] rounded-xs hover:bg-[#ff621f] whitespace-nowrap"
                >
                  <Database className="w-3.5 h-3.5" />
                  Save All to Database
                </button>
              </div>
            )}
          </div>
        )}

        {/* Loading Skeleton */}
        {isSearching && (
          <div className="bg-[var(--v-surface)] border border-[var(--v-border)] divide-y divide-[var(--v-border)]">
            {[1, 2, 3, 4].map((row) => (
              <div
                key={row}
                className="px-4 py-3.5 flex items-center justify-between gap-4 animate-pulse"
              >
                <div className="space-y-2 flex-1">
                  <div className="h-3.5 bg-[var(--v-surface-2)] rounded-xs w-1/3" />
                  <div className="h-3 bg-[var(--v-bg)] rounded-xs w-2/3" />
                </div>
                <div className="h-7 w-24 bg-[var(--v-surface-2)] rounded-xs" />
              </div>
            ))}
          </div>
        )}

        {/* Analytical Grounding Summary + Grounded Results Responsive Grid */}
        {!isSearching && (liveSummary || liveResults.length > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-start">
            {liveSummary && (
              <div
                className={`p-5 bg-[var(--v-surface)] border border-[var(--v-border)] space-y-2 min-w-0 ${
                  liveResults.length > 0 ? 'md:col-span-2 xl:col-span-1' : 'col-span-full'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="font-semibold text-[var(--v-ink)]">
                    Grounded Search Synthesis
                  </span>
                  {executedQueries.length > 0 && (
                    <span className="text-[11px] font-mono text-[var(--v-ink-dim)] break-all">
                      Executed: {executedQueries.join(' | ')}
                    </span>
                  )}
                </div>
                <div className="text-xs text-[var(--v-ink-dim)] leading-relaxed whitespace-pre-wrap">
                  {liveSummary}
                </div>
              </div>
            )}

            {liveResults.length > 0 && (
              <div
                className={`overflow-x-auto bg-[var(--v-surface)] border border-[var(--v-border)] min-w-0 ${
                  liveSummary ? 'md:col-span-2 xl:col-span-2' : 'col-span-full'
                }`}
              >
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[var(--v-bg)] border-b border-[var(--v-border)] text-[11px] font-mono font-bold text-[var(--v-ink-dim)]">
                      <th className="py-2.5 px-3 w-14 text-right">Rank</th>
                      <th className="py-2.5 px-3">Title &amp; URL</th>
                      <th className="py-2.5 px-3 w-44">Domain</th>
                      <th className="py-2.5 px-3 w-28 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--v-border)] text-xs">
                    {liveResults.map((item) => (
                      <tr
                        key={`${item.rankPosition}-${item.url}`}
                        className="hover:bg-[var(--v-surface-2)]/50 transition-colors"
                      >
                        <td className="py-2.5 px-3 text-right font-mono tabular-nums text-[var(--v-ink-dim)]">
                          #{item.rankPosition}
                        </td>
                        <td className="py-2.5 px-3 min-w-[240px]">
                          <div className="font-medium text-[var(--v-ink)]">
                            {item.title}
                          </div>
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] font-mono text-[#ff4d00] hover:underline break-all inline-flex items-center gap-1 mt-0.5"
                          >
                            {item.url}
                            <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                          </a>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-[var(--v-ink-dim)]">
                          {item.domain}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          {item.saved ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-emerald-500">
                              <Check className="w-3 h-3" />
                              Saved
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => onSaveFinding(item)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-[var(--v-ink)] bg-[var(--v-bg)] border border-[var(--v-border)] rounded-xs hover:border-[#ff4d00] hover:text-[#ff4d00] whitespace-nowrap"
                            >
                              <Plus className="w-3 h-3" />
                              Save
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Empty State (Variation 17 Finding Pipeline Empty) */}
        {!isSearching && liveResults.length === 0 && !liveSummary && (
          <div className="border border-dashed border-[var(--v-border)] p-12 text-center space-y-2.5">
            <Send className="w-6 h-6 text-[var(--v-ink-dim)] mx-auto" />
            <div className="text-xs font-mono font-bold text-[var(--v-ink)]">
              Finding Pipeline Empty
            </div>
            <p className="text-xs text-[var(--v-ink-dim)] max-w-md mx-auto">
              Select a domain, keywords, date range, rank window, language, or country in the sidebar—or load a template from the Dork Catalog—then click Run Automated Search.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
