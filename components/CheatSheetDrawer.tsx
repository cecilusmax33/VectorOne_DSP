'use client';

import React, { useMemo, useRef, useState } from 'react';
import { Copy, Check, PlusCircle, Search, X } from 'lucide-react';
import {
  OPERATOR_CHEAT_SHEET,
  OperatorCheatSheetItem,
} from '@/lib/cheat-sheet';

interface CheatSheetDrawerProps {
  open: boolean;
  onClose: () => void;
  onInsertSnippet: (snippet: string) => void;
}

const CATEGORIES: ('All' | OperatorCheatSheetItem['category'])[] = [
  'All',
  'Domain & Scope',
  'URL & Title',
  'Content & File Type',
  'Temporal & Rank',
  'Boolean & Precision',
  'Diagnostic & Cache',
];

export default function CheatSheetDrawer({
  open,
  onClose,
  onInsertSnippet,
}: CheatSheetDrawerProps) {
  const [search, setSearch] = useState('');
  const [category, setCategory] =
    useState<(typeof CATEGORIES)[number]>('All');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  const handleCategoryChange = (cat: (typeof CATEGORIES)[number]) => {
    setCategory(cat);
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    listRef.current?.scrollTo({
      top: 0,
      behavior: prefersReduced ? 'auto' : 'smooth',
    });
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return OPERATOR_CHEAT_SHEET.filter((item) => {
      if (category !== 'All' && item.category !== category) return false;
      if (!q) return true;
      return (
        item.operator.toLowerCase().includes(q) ||
        item.summary.toLowerCase().includes(q) ||
        item.whatItDoes.toLowerCase().includes(q) ||
        item.example.toLowerCase().includes(q)
      );
    });
  }, [search, category]);

  if (!open) return null;

  const handleCopy = async (item: OperatorCheatSheetItem) => {
    try {
      await navigator.clipboard.writeText(item.example);
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 1500);
    } catch {
      // Clipboard blocked in restricted context
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/60"
      role="dialog"
      aria-modal="true"
      aria-label="Google Dorking Cheat Sheet"
    >
      <div className="w-full max-w-2xl bg-[var(--v-surface)] h-full border-l border-[var(--v-border)] border-t-[3px] border-t-[#ff4d00] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[var(--v-border)] flex items-center justify-between shrink-0">
          <div>
            <h2 className="font-display text-lg font-extrabold uppercase tracking-tight text-[var(--v-ink)]">
              Google Dorking Operator Cheat Sheet
            </h2>
            <p className="text-xs text-[var(--v-ink-dim)] mt-0.5">
              Complete syntax reference, behavioral explanations, and live query examples.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close cheat sheet"
            className="p-2 text-[var(--v-ink-dim)] hover:text-[#ff4d00] rounded-xs hover:bg-[var(--v-bg)] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="px-6 py-3.5 bg-[var(--v-bg)] border-b border-[var(--v-border)] space-y-2.5 shrink-0">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[var(--v-ink-dim)] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search operators (e.g. site:, filetype:, inurl:, after:)..."
              className="w-full pl-8 pr-3 py-1.5 text-xs font-mono bg-[var(--v-surface)] border border-[var(--v-border)] rounded-xs text-[var(--v-ink)] placeholder:text-[var(--v-ink-dim)] focus:outline-none focus:border-[#ff4d00]"
            />
          </div>

          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => handleCategoryChange(cat)}
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
        </div>

        {/* Operators List */}
        <div
          ref={listRef}
          className="flex-1 overflow-y-auto scroll-smooth divide-y divide-[var(--v-border)]"
        >
          {filtered.map((item) => (
            <div key={item.id} className="px-6 py-4 space-y-2 hover:bg-[var(--v-surface-2)]/40 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2.5">
                    <code className="text-sm font-bold font-mono text-[#ff4d00] bg-[#ff4d00]/10 px-2 py-0.5 rounded-xs">
                      {item.operator}
                    </code>
                    <span className="text-xs font-semibold text-[var(--v-ink)]">
                      {item.summary}
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-[var(--v-ink-dim)]">
                    {item.category} · Supported: {item.platforms.join(', ')}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleCopy(item)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-mono font-medium text-[var(--v-ink)] bg-[var(--v-bg)] border border-[var(--v-border)] rounded-xs hover:border-[#ff4d00] hover:text-[#ff4d00] transition-colors whitespace-nowrap"
                  >
                    {copiedId === item.id ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-500" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        Copy Example
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onInsertSnippet(item.insertSnippet);
                      onClose();
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-mono font-bold text-[#111113] bg-[#ff4d00] rounded-xs hover:bg-[#ff621f] transition-colors whitespace-nowrap"
                  >
                    <PlusCircle className="w-3 h-3" />
                    Insert
                  </button>
                </div>
              </div>

              <p className="text-xs text-[var(--v-ink-dim)] leading-relaxed">
                {item.whatItDoes}
              </p>

              <div className="bg-[var(--v-bg)] border border-[var(--v-border)] rounded-xs p-2.5 space-y-1">
                <div className="text-[11px] font-mono text-[var(--v-ink)] break-all">
                  {item.example}
                </div>
                <div className="text-[11px] text-[var(--v-ink-dim)]">
                  {item.exampleExplanation}
                </div>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="px-6 py-12 text-center text-xs font-mono text-[var(--v-ink-dim)]">
              No operators match &quot;{search}&quot;. Clear your search filter to view all 20 operators.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
