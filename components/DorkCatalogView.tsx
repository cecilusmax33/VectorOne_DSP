'use client';

import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  BookMarked,
  Copy,
  Check,
  Search,
  ExternalLink,
} from 'lucide-react';
import {
  buildPlatformSearchUrl,
  DORK_CATALOG,
} from '@/lib/dork-catalog';
import { OPERATOR_CHEAT_SHEET } from '@/lib/cheat-sheet';
import { DorkCatalogEntry, PlatformId } from '@/lib/types';

interface DorkCatalogViewProps {
  targetDomain: string;
  onLoadDork: (dork: DorkCatalogEntry) => void;
  onInsertOperatorSnippet: (snippet: string) => void;
}

const CATALOG_CATEGORIES: ('All' | DorkCatalogEntry['category'])[] = [
  'All',
  'Public Document Audit',
  'Configuration & Environment',
  'Cloud & Storage Exposure',
  'Admin & Auth Surfaces',
  'API & Schema Discovery',
  'Error & Diagnostic Logs',
  'Subdomain & Staging',
  'Sensitive Data & DLP Compliance',
];

export default function DorkCatalogView({
  targetDomain,
  onLoadDork,
  onInsertOperatorSnippet,
}: DorkCatalogViewProps) {
  const [activeTab, setActiveTab] = useState<'dorks' | 'cheatsheet'>('dorks');
  const [search, setSearch] = useState('');
  const [category, setCategory] =
    useState<(typeof CATALOG_CATEGORIES)[number]>('All');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const cleanDomain =
    targetDomain.trim().replace(/^https?:\/\//i, '').replace(/\/.*$/, '') ||
    'example.com';

  const domainKeyword = cleanDomain.split('.')[0] || 'example';

  const resolveTemplate = (tpl: string) =>
    tpl
      .replace(/\{domain\}/g, cleanDomain)
      .replace(/\{domain_keyword\}/g, domainKeyword);

  const filteredDorks = useMemo(() => {
    const q = search.trim().toLowerCase();
    return DORK_CATALOG.filter((dork) => {
      if (category !== 'All' && dork.category !== category) return false;
      if (!q) return true;
      return (
        dork.name.toLowerCase().includes(q) ||
        dork.operatorTemplate.toLowerCase().includes(q) ||
        dork.whatItDoes.toLowerCase().includes(q) ||
        dork.auditRationale.toLowerCase().includes(q)
      );
    });
  }, [search, category]);

  const filteredCheatSheet = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return OPERATOR_CHEAT_SHEET;
    return OPERATOR_CHEAT_SHEET.filter(
      (item) =>
        item.operator.toLowerCase().includes(q) ||
        item.summary.toLowerCase().includes(q) ||
        item.whatItDoes.toLowerCase().includes(q) ||
        item.example.toLowerCase().includes(q)
    );
  }, [search]);

  const handleCopy = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
    } catch {
      // Clipboard unavailable
    }
  };

  return (
    <div className="col-span-full bg-[var(--v-surface)] border border-[var(--v-border)] border-t-[3px] border-t-[#ff4d00] divide-y divide-[var(--v-border)]">
      {/* Header & Tabs */}
      <div className="p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-xl sm:text-2xl font-extrabold uppercase tracking-tight text-[var(--v-ink)]">
            Full Dork Reference Catalog &amp; Operator Cheat Sheet
          </h1>
          <p className="text-xs text-[var(--v-ink-dim)] mt-1">
            Every target search query and operator syntax explained with exact behavior, defensive audit rationale, and 1-click loading into the Query Workbench.
          </p>
        </div>

        <div className="inline-flex p-1 bg-[var(--v-bg)] rounded-xs border border-[var(--v-border)]">
          <button
            type="button"
            onClick={() => setActiveTab('dorks')}
            className={`px-3 py-1.5 text-xs font-mono rounded-xs transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'dorks'
                ? 'bg-[#ff4d00] text-[#111113] font-bold'
                : 'text-[var(--v-ink-dim)] hover:text-[var(--v-ink)]'
            }`}
          >
            Target Dork Catalog ({DORK_CATALOG.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('cheatsheet')}
            className={`px-3 py-1.5 text-xs font-mono rounded-xs transition-colors whitespace-nowrap shrink-0 inline-flex items-center gap-1.5 ${
              activeTab === 'cheatsheet'
                ? 'bg-[#ff4d00] text-[#111113] font-bold'
                : 'text-[var(--v-ink-dim)] hover:text-[var(--v-ink)]'
            }`}
          >
            <BookMarked className="w-3.5 h-3.5" />
            Operator Cheat Sheet ({OPERATOR_CHEAT_SHEET.length})
          </button>
        </div>
      </div>

      {/* Search & Category Filter */}
      <div className="px-6 py-4 bg-[var(--v-bg)] space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 text-[var(--v-ink-dim)] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={
                activeTab === 'dorks'
                  ? 'Filter dorks by name, syntax, or what they uncover...'
                  : 'Filter operators (site:, filetype:, inurl:, intitle:, after:)...'
              }
              className="w-full pl-8 pr-3 py-1.5 text-xs font-mono bg-[var(--v-surface)] border border-[var(--v-border)] rounded-xs text-[var(--v-ink)] placeholder:text-[var(--v-ink-dim)] focus:outline-none focus:border-[#ff4d00]"
            />
          </div>
          <div className="text-[11px] font-mono text-[var(--v-ink-dim)]">
            Preview Domain:{' '}
            <span className="text-[#ff4d00] font-bold">{cleanDomain}</span>
          </div>
        </div>

        {activeTab === 'dorks' && (
          <div className="flex flex-wrap gap-1.5">
            {CATALOG_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`px-2.5 py-1 text-[11px] font-mono rounded-xs border transition-colors whitespace-nowrap ${
                  category === cat
                    ? 'bg-[#ff4d00] text-[#111113] border-[#ff4d00] font-bold'
                    : 'bg-[var(--v-surface)] text-[var(--v-ink-dim)] border-[var(--v-border)] hover:text-[var(--v-ink)] hover:border-[#ff4d00]/50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Tab 1: Full Target Dork Responsive 1/2/3-Column Grid */}
      {activeTab === 'dorks' && (
        <div className="p-5 bg-[var(--v-bg)]/40">
          {filteredDorks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 items-stretch">
              {filteredDorks.map((dork) => {
                const resolved = resolveTemplate(dork.operatorTemplate);
                const primaryPlatform: PlatformId = dork.supportedPlatforms[0] ?? 'google';
                const externalHref = buildPlatformSearchUrl(resolved, primaryPlatform);

                return (
                  <article
                    key={dork.id}
                    className="min-w-0 bg-[var(--v-surface)] border border-[var(--v-border)] p-4 flex flex-col justify-between gap-4 hover:border-[#ff4d00]/70 transition-colors"
                  >
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <div className="text-[11px] font-mono text-[var(--v-ink-dim)]">
                          {dork.category} · {dork.sensitivityLevel}
                        </div>
                        <h3 className="text-sm font-bold text-[var(--v-ink)] leading-snug">
                          {dork.name}
                        </h3>
                        <div className="text-[11px] font-mono text-[var(--v-ink-dim)]">
                          Platforms: {dork.supportedPlatforms.join(', ')}
                        </div>
                      </div>

                      <div className="p-2.5 bg-[var(--v-bg)] border border-[var(--v-border)] rounded-xs font-mono text-xs text-[var(--v-ink)] break-all">
                        {resolved}
                      </div>

                      <div className="space-y-2 text-xs leading-relaxed">
                        <div>
                          <span className="font-mono text-[10px] uppercase tracking-wider font-bold text-[var(--v-ink)] block mb-0.5">
                            What This Dork Does
                          </span>
                          <p className="text-[var(--v-ink-dim)]">{dork.whatItDoes}</p>
                        </div>
                        <div>
                          <span className="font-mono text-[10px] uppercase tracking-wider font-bold text-[var(--v-ink)] block mb-0.5">
                            Audit Purpose
                          </span>
                          <p className="text-[var(--v-ink-dim)]">{dork.auditRationale}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 pt-3 border-t border-[var(--v-border)]">
                      <button
                        type="button"
                        onClick={() => onLoadDork(dork)}
                        className="w-full inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-display font-extrabold uppercase tracking-tight bg-[#ff4d00] text-[#111113] rounded-xs hover:bg-[#ff621f] transition-colors whitespace-nowrap"
                      >
                        Load into Workbench
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => handleCopy(dork.id, resolved)}
                          className="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 text-[11px] font-mono font-medium text-[var(--v-ink)] bg-[var(--v-bg)] border border-[var(--v-border)] rounded-xs hover:border-[#ff4d00] hover:text-[#ff4d00] transition-colors whitespace-nowrap"
                        >
                          {copiedId === dork.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-500" />
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              Copy
                            </>
                          )}
                        </button>

                        <a
                          href={externalHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 text-[11px] font-mono font-medium text-[var(--v-ink)] bg-[var(--v-bg)] border border-[var(--v-border)] rounded-xs hover:border-[#ff4d00] hover:text-[#ff4d00] transition-colors whitespace-nowrap"
                        >
                          Run Live
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="p-10 text-center text-xs font-mono text-[var(--v-ink-dim)]">
              No dork templates match your current filter.
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Comprehensive Operator Cheat Sheet Responsive 1/2/3-Column Grid */}
      {activeTab === 'cheatsheet' && (
        <div className="p-5 bg-[var(--v-bg)]/40">
          {filteredCheatSheet.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 items-stretch">
              {filteredCheatSheet.map((item) => (
                <article
                  key={item.id}
                  className="min-w-0 bg-[var(--v-surface)] border border-[var(--v-border)] p-4 flex flex-col justify-between gap-4 hover:border-[#ff4d00]/70 transition-colors"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <code className="font-mono text-xs font-bold text-[#ff4d00] bg-[#ff4d00]/10 px-2 py-0.5 rounded-xs">
                        {item.operator}
                      </code>
                      <span className="text-[11px] font-mono text-[var(--v-ink-dim)] truncate">
                        {item.category}
                      </span>
                    </div>

                    <div className="space-y-1 text-xs leading-relaxed">
                      <div className="font-semibold text-[var(--v-ink)]">
                        {item.summary}
                      </div>
                      <p className="text-[var(--v-ink-dim)]">{item.whatItDoes}</p>
                    </div>

                    <div className="space-y-1.5">
                      <div className="font-mono text-[11px] bg-[var(--v-bg)] border border-[var(--v-border)] rounded-xs px-2.5 py-1.5 text-[var(--v-ink)] break-all">
                        {item.example}
                      </div>
                      <p className="text-[11px] text-[var(--v-ink-dim)]">
                        {item.exampleExplanation}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-3 border-t border-[var(--v-border)]">
                    <button
                      type="button"
                      onClick={() => onInsertOperatorSnippet(item.insertSnippet)}
                      className="px-2.5 py-1.5 text-[11px] font-mono font-bold bg-[#ff4d00] text-[#111113] rounded-xs hover:bg-[#ff621f] transition-colors whitespace-nowrap"
                    >
                      Insert Operator
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCopy(item.id, item.example)}
                      className="px-2.5 py-1.5 text-[11px] font-mono font-medium text-[var(--v-ink)] bg-[var(--v-bg)] border border-[var(--v-border)] rounded-xs hover:border-[#ff4d00] hover:text-[#ff4d00] transition-colors whitespace-nowrap"
                    >
                      {copiedId === item.id ? 'Copied' : 'Copy Example'}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="p-10 text-center text-xs font-mono text-[var(--v-ink-dim)]">
              No operators match your current search filter.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
