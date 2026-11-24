'use client';

import React, { useState } from 'react';
import {
  BookOpen,
  Database,
  History,
  Bell,
  ShieldCheck,
  Search,
  Plus,
  Trash2,
  RotateCcw,
  ChevronDown,
  ChevronRight,
  SlidersHorizontal,
  LayoutDashboard,
  HelpCircle,
} from 'lucide-react';
import {
  COMMON_FILE_TYPES,
  COUNTRY_OPTIONS,
  DATE_PRESET_OPTIONS,
  LANGUAGE_OPTIONS,
  RESULT_POSITION_PRESETS,
  SENSITIVE_DATA_FILTERS,
} from '@/lib/dork-catalog';
import {
  DatePreset,
  KeywordGroup,
  ResultPositionPreset,
  SearchParameters,
  WorkspaceView,
} from '@/lib/types';

interface SidebarPanelProps {
  activeView: WorkspaceView;
  onSelectView: (view: WorkspaceView) => void;
  params: SearchParameters;
  onUpdateParams: (updater: (prev: SearchParameters) => SearchParameters) => void;
  onResetParams: () => void;
  keywordGroups: KeywordGroup[];
  onAddKeyword: (groupId: string, keyword: string) => void;
  onRemoveKeyword: (groupId: string, keyword: string) => void;
  onCreateKeywordGroup: (name: string) => void;
  findingsCount: number;
  historyCount: number;
  alertRulesCount: number;
}

const inputCls =
  'w-full px-2.5 py-1.5 text-xs font-mono bg-[var(--v-bg)] text-[var(--v-ink)] border border-[var(--v-border)] rounded-xs placeholder:text-[var(--v-ink-dim)] focus:outline-none focus:border-[#ff4d00]';
const selectCls =
  'w-full px-2 py-1.5 text-xs font-mono bg-[var(--v-bg)] text-[var(--v-ink)] border border-[var(--v-border)] rounded-xs focus:outline-none focus:border-[#ff4d00]';

export default function SidebarPanel({
  activeView,
  onSelectView,
  params,
  onUpdateParams,
  onResetParams,
  keywordGroups,
  onAddKeyword,
  onRemoveKeyword,
  onCreateKeywordGroup,
  findingsCount,
  historyCount,
  alertRulesCount,
}: SidebarPanelProps) {
  const [newKeywordText, setNewKeywordText] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState(
    keywordGroups[0]?.id ?? 'kw-docs'
  );
  const [newGroupName, setNewGroupName] = useState('');
  const [showNewGroupInput, setShowNewGroupInput] = useState(false);

  const [openSections, setOpenSections] = useState({
    domain: true,
    expanded: true,
    operators: false,
    keywords: true,
    sensitive: true,
  });

  const toggleSection = (key: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const navItems: {
    id: WorkspaceView;
    label: string;
    icon: React.ReactNode;
    count?: number;
  }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: 'workbench',
      label: 'Query Workbench',
      icon: <Search className="w-4 h-4" />,
    },
    {
      id: 'catalog',
      label: 'Dork Catalog',
      icon: <BookOpen className="w-4 h-4" />,
    },
    {
      id: 'database',
      label: 'Findings Database',
      icon: <Database className="w-4 h-4" />,
      count: findingsCount,
    },
    {
      id: 'history',
      label: 'Search History',
      icon: <History className="w-4 h-4" />,
      count: historyCount,
    },
    {
      id: 'alerts',
      label: 'Alerts & APIs',
      icon: <Bell className="w-4 h-4" />,
      count: alertRulesCount,
    },
    {
      id: 'compliance',
      label: 'Compliance & Ethics',
      icon: <ShieldCheck className="w-4 h-4" />,
    },
    {
      id: 'help',
      label: 'Help & Guide',
      icon: <HelpCircle className="w-4 h-4" />,
    },
  ];

  const handleToggleFileType = (ft: string) => {
    onUpdateParams((prev) => ({
      ...prev,
      customRawOverride: '',
      fileTypes: prev.fileTypes.includes(ft)
        ? prev.fileTypes.filter((item) => item !== ft)
        : [...prev.fileTypes, ft],
    }));
  };

  const handleToggleKeyword = (kw: string) => {
    onUpdateParams((prev) => ({
      ...prev,
      customRawOverride: '',
      activeKeywords: prev.activeKeywords.includes(kw)
        ? prev.activeKeywords.filter((item) => item !== kw)
        : [...prev.activeKeywords, kw],
    }));
  };

  const handleToggleSensitiveFilter = (id: string) => {
    onUpdateParams((prev) => ({
      ...prev,
      customRawOverride: '',
      activeSensitiveFilterIds: prev.activeSensitiveFilterIds.includes(id)
        ? prev.activeSensitiveFilterIds.filter((item) => item !== id)
        : [...prev.activeSensitiveFilterIds, id],
    }));
  };

  const handleDatePresetChange = (preset: DatePreset) => {
    onUpdateParams((prev) => ({
      ...prev,
      customRawOverride: '',
      datePreset: preset,
      dateAfter: preset === 'custom' ? prev.dateAfter : '',
      dateBefore: preset === 'custom' ? prev.dateBefore : '',
    }));
  };

  const handlePositionPresetChange = (preset: ResultPositionPreset) => {
    const found = RESULT_POSITION_PRESETS.find((p) => p.id === preset);
    onUpdateParams((prev) => ({
      ...prev,
      resultPositionPreset: preset,
      resultStartRank: found ? found.start : prev.resultStartRank,
      resultEndRank: found ? found.end : prev.resultEndRank,
    }));
  };

  const handleAddKeywordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newKeywordText.trim();
    if (!trimmed) return;
    onAddKeyword(selectedGroupId, trimmed);
    onUpdateParams((prev) => ({
      ...prev,
      customRawOverride: '',
      activeKeywords: prev.activeKeywords.includes(trimmed)
        ? prev.activeKeywords
        : [...prev.activeKeywords, trimmed],
    }));
    setNewKeywordText('');
  };

  const handleCreateGroupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newGroupName.trim();
    if (!trimmed) return;
    onCreateKeywordGroup(trimmed);
    setNewGroupName('');
    setShowNewGroupInput(false);
  };

  return (
    <aside className="w-[280px] shrink-0 bg-[var(--v-surface)] border-r border-[var(--v-border)] flex flex-col h-full overflow-hidden">
      {/* Brand Lockup */}
      <div className="px-5 py-4 border-b border-[var(--v-border)] flex flex-col shrink-0">
        <span className="font-display text-lg font-extrabold tracking-tight text-[var(--v-ink)] whitespace-nowrap">
          VectorOne
        </span>
        <span className="text-[11px] font-mono font-bold text-[#ff4d00] whitespace-nowrap mt-0.5">
          OSINT Studio / DSP
        </span>
      </div>

      {/* Primary Workspace Navigation */}
      <nav
        aria-label="Primary workspace navigation"
        className="border-b border-[var(--v-border)] py-2.5 px-2.5 space-y-0.5 shrink-0"
      >
        {navItems.map((item) => {
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectView(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-xs transition-colors whitespace-nowrap ${
                isActive
                  ? 'bg-[var(--v-surface-2)] text-[var(--v-ink)]'
                  : 'text-[var(--v-ink-dim)] hover:bg-[var(--v-surface-2)]/60 hover:text-[var(--v-ink)]'
              }`}
            >
              <span className="flex items-center gap-2.5 truncate">
                <span className={isActive ? 'text-[#ff4d00]' : ''}>{item.icon}</span>
                <span className="truncate">{item.label}</span>
              </span>
              {typeof item.count === 'number' && (
                <span
                  className={`font-mono text-[11px] tabular-nums ${
                    isActive ? 'text-[#ff4d00] font-bold' : 'text-[var(--v-ink-dim)]'
                  }`}
                >
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Scrollable Search Parameters & Keywords Sidebar */}
      <div className="flex-1 overflow-y-auto scroll-smooth divide-y divide-[var(--v-border)]">
        {/* Sidebar Header */}
        <div className="px-4 py-2.5 bg-[var(--v-bg)]/50 flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-[var(--v-ink)]">
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#ff4d00]" />
            Search Parameters
          </span>
          <button
            type="button"
            onClick={onResetParams}
            title="Reset all query parameters"
            className="text-[11px] font-mono text-[var(--v-ink-dim)] hover:text-[#ff4d00] flex items-center gap-1 whitespace-nowrap"
          >
            <RotateCcw className="w-3 h-3" />
            Reset
          </button>
        </div>

        {/* 1. Domain & Scope */}
        <div className="px-4 py-3">
          <button
            type="button"
            onClick={() => toggleSection('domain')}
            className="w-full flex items-center justify-between text-xs font-semibold text-[var(--v-ink)] mb-2"
          >
            <span>01. Domain &amp; Scope</span>
            {openSections.domain ? (
              <ChevronDown className="w-3.5 h-3.5 text-[var(--v-ink-dim)]" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-[var(--v-ink-dim)]" />
            )}
          </button>

          {openSections.domain && (
            <div className="space-y-2.5">
              <div>
                <label className="block text-[11px] font-mono text-[#ff4d00] mb-1">
                  Target Domain (site:)
                </label>
                <input
                  type="text"
                  value={params.targetDomain}
                  onChange={(e) =>
                    onUpdateParams((prev) => ({
                      ...prev,
                      customRawOverride: '',
                      targetDomain: e.target.value,
                    }))
                  }
                  placeholder="e.g. example.com"
                  className={inputCls}
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-[var(--v-ink-dim)] mb-1">
                  URL Path Prefix (inurl:)
                </label>
                <input
                  type="text"
                  value={params.pathPrefix}
                  onChange={(e) =>
                    onUpdateParams((prev) => ({
                      ...prev,
                      customRawOverride: '',
                      pathPrefix: e.target.value,
                    }))
                  }
                  placeholder="e.g. /api/v1 or admin"
                  className={inputCls}
                />
              </div>

              <div className="space-y-1.5 pt-0.5">
                <label className="flex items-center gap-2 text-xs text-[var(--v-ink-dim)] hover:text-[var(--v-ink)] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={params.excludeWww}
                    onChange={(e) =>
                      onUpdateParams((prev) => ({
                        ...prev,
                        customRawOverride: '',
                        excludeWww: e.target.checked,
                      }))
                    }
                    className="rounded-xs border-[var(--v-border)] accent-[#ff4d00]"
                  />
                  <span>Exclude primary www (-site:www.)</span>
                </label>
                <label className="flex items-center gap-2 text-xs text-[var(--v-ink-dim)] hover:text-[var(--v-ink)] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={params.excludeSubdomains}
                    onChange={(e) =>
                      onUpdateParams((prev) => ({
                        ...prev,
                        customRawOverride: '',
                        excludeSubdomains: e.target.checked,
                      }))
                    }
                    className="rounded-xs border-[var(--v-border)] accent-[#ff4d00]"
                  />
                  <span>Exclude dev/staging subdomains</span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* 2. Expanded Filters: Date Range, Position, Language, Country */}
        <div className="px-4 py-3">
          <button
            type="button"
            onClick={() => toggleSection('expanded')}
            className="w-full flex items-center justify-between text-xs font-semibold text-[var(--v-ink)] mb-2"
          >
            <span>02. Date, Rank, Lang &amp; Geo</span>
            {openSections.expanded ? (
              <ChevronDown className="w-3.5 h-3.5 text-[var(--v-ink-dim)]" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-[var(--v-ink-dim)]" />
            )}
          </button>

          {openSections.expanded && (
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-mono text-[var(--v-ink-dim)] mb-1">
                  Date Range
                </label>
                <select
                  value={params.datePreset}
                  onChange={(e) =>
                    handleDatePresetChange(e.target.value as DatePreset)
                  }
                  className={selectCls}
                >
                  {DATE_PRESET_OPTIONS.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label}
                    </option>
                  ))}
                </select>

                {params.datePreset === 'custom' && (
                  <div className="grid grid-cols-2 gap-1.5 mt-1.5">
                    <div>
                      <span className="block text-[10px] font-mono text-[var(--v-ink-dim)] mb-0.5">
                        After
                      </span>
                      <input
                        type="date"
                        value={params.dateAfter}
                        onChange={(e) =>
                          onUpdateParams((prev) => ({
                            ...prev,
                            customRawOverride: '',
                            dateAfter: e.target.value,
                          }))
                        }
                        className="w-full px-1.5 py-1 text-[11px] font-mono bg-[var(--v-bg)] text-[var(--v-ink)] border border-[var(--v-border)] rounded-xs focus:outline-none focus:border-[#ff4d00]"
                      />
                    </div>
                    <div>
                      <span className="block text-[10px] font-mono text-[var(--v-ink-dim)] mb-0.5">
                        Before
                      </span>
                      <input
                        type="date"
                        value={params.dateBefore}
                        onChange={(e) =>
                          onUpdateParams((prev) => ({
                            ...prev,
                            customRawOverride: '',
                            dateBefore: e.target.value,
                          }))
                        }
                        className="w-full px-1.5 py-1 text-[11px] font-mono bg-[var(--v-bg)] text-[var(--v-ink)] border border-[var(--v-border)] rounded-xs focus:outline-none focus:border-[#ff4d00]"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-mono text-[var(--v-ink-dim)] mb-1">
                  Result Position Window
                </label>
                <select
                  value={params.resultPositionPreset}
                  onChange={(e) =>
                    handlePositionPresetChange(
                      e.target.value as ResultPositionPreset
                    )
                  }
                  className={selectCls}
                >
                  {RESULT_POSITION_PRESETS.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label}
                    </option>
                  ))}
                </select>

                {params.resultPositionPreset === 'custom' && (
                  <div className="grid grid-cols-2 gap-1.5 mt-1.5">
                    <div>
                      <span className="block text-[10px] font-mono text-[var(--v-ink-dim)] mb-0.5">
                        Start Rank
                      </span>
                      <input
                        type="number"
                        min={1}
                        max={200}
                        value={params.resultStartRank}
                        onChange={(e) =>
                          onUpdateParams((prev) => ({
                            ...prev,
                            resultStartRank: Math.max(
                              1,
                              Number(e.target.value) || 1
                            ),
                          }))
                        }
                        className="w-full px-2 py-1 text-xs font-mono tabular-nums bg-[var(--v-bg)] text-[var(--v-ink)] border border-[var(--v-border)] rounded-xs focus:outline-none focus:border-[#ff4d00]"
                      />
                    </div>
                    <div>
                      <span className="block text-[10px] font-mono text-[var(--v-ink-dim)] mb-0.5">
                        End Rank
                      </span>
                      <input
                        type="number"
                        min={1}
                        max={200}
                        value={params.resultEndRank}
                        onChange={(e) =>
                          onUpdateParams((prev) => ({
                            ...prev,
                            resultEndRank: Math.max(
                              prev.resultStartRank,
                              Number(e.target.value) || prev.resultStartRank
                            ),
                          }))
                        }
                        className="w-full px-2 py-1 text-xs font-mono tabular-nums bg-[var(--v-bg)] text-[var(--v-ink)] border border-[var(--v-border)] rounded-xs focus:outline-none focus:border-[#ff4d00]"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-mono text-[var(--v-ink-dim)] mb-1">
                    Language
                  </label>
                  <select
                    value={params.language}
                    onChange={(e) =>
                      onUpdateParams((prev) => ({
                        ...prev,
                        language: e.target.value,
                      }))
                    }
                    className={selectCls}
                  >
                    {LANGUAGE_OPTIONS.map((lang) => (
                      <option key={lang.code || 'any'} value={lang.code}>
                        {lang.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-[var(--v-ink-dim)] mb-1">
                    Country
                  </label>
                  <select
                    value={params.country}
                    onChange={(e) =>
                      onUpdateParams((prev) => ({
                        ...prev,
                        country: e.target.value,
                      }))
                    }
                    className={selectCls}
                  >
                    {COUNTRY_OPTIONS.map((c) => (
                      <option key={c.code || 'global'} value={c.code}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {params.country && !params.targetDomain && (
                <label className="flex items-center gap-2 text-xs text-[var(--v-ink-dim)] hover:text-[var(--v-ink)] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={params.countryTldBoost}
                    onChange={(e) =>
                      onUpdateParams((prev) => ({
                        ...prev,
                        customRawOverride: '',
                        countryTldBoost: e.target.checked,
                      }))
                    }
                    className="rounded-xs border-[var(--v-border)] accent-[#ff4d00]"
                  />
                  <span>Scope by country ccTLD</span>
                </label>
              )}
            </div>
          )}
        </div>

        {/* 3. File Types & Advanced Operators */}
        <div className="px-4 py-3">
          <button
            type="button"
            onClick={() => toggleSection('operators')}
            className="w-full flex items-center justify-between text-xs font-semibold text-[var(--v-ink)] mb-2"
          >
            <span>03. File Types &amp; Operators</span>
            {openSections.operators ? (
              <ChevronDown className="w-3.5 h-3.5 text-[var(--v-ink-dim)]" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-[var(--v-ink-dim)]" />
            )}
          </button>

          {openSections.operators && (
            <div className="space-y-2.5">
              <div>
                <span className="block text-[11px] font-mono text-[var(--v-ink-dim)] mb-1.5">
                  File Extensions (filetype:)
                </span>
                <div className="flex flex-wrap gap-1">
                  {COMMON_FILE_TYPES.map((ft) => {
                    const active = params.fileTypes.includes(ft);
                    return (
                      <button
                        key={ft}
                        type="button"
                        onClick={() => handleToggleFileType(ft)}
                        className={`px-2 py-1 text-[11px] font-mono rounded-xs border transition-colors ${
                          active
                            ? 'bg-[#ff4d00] text-[#111113] font-bold border-[#ff4d00]'
                            : 'bg-[var(--v-bg)] text-[var(--v-ink-dim)] border-[var(--v-border)] hover:border-[#ff4d00] hover:text-[var(--v-ink)]'
                        }`}
                      >
                        .{ft}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-[var(--v-ink-dim)] mb-1">
                  Page Title (intitle:)
                </label>
                <input
                  type="text"
                  value={params.inTitle}
                  onChange={(e) =>
                    onUpdateParams((prev) => ({
                      ...prev,
                      customRawOverride: '',
                      inTitle: e.target.value,
                    }))
                  }
                  placeholder="e.g. Index of /"
                  className={inputCls}
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-[var(--v-ink-dim)] mb-1">
                  URL Keyword (inurl:)
                </label>
                <input
                  type="text"
                  value={params.inUrl}
                  onChange={(e) =>
                    onUpdateParams((prev) => ({
                      ...prev,
                      customRawOverride: '',
                      inUrl: e.target.value,
                    }))
                  }
                  placeholder="e.g. swagger"
                  className={inputCls}
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-[var(--v-ink-dim)] mb-1">
                  Body Text (intext:)
                </label>
                <input
                  type="text"
                  value={params.inText}
                  onChange={(e) =>
                    onUpdateParams((prev) => ({
                      ...prev,
                      customRawOverride: '',
                      inText: e.target.value,
                    }))
                  }
                  placeholder="e.g. DB_HOST"
                  className={inputCls}
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-[var(--v-ink-dim)] mb-1">
                  Exact Phrase (&quot;...&quot;)
                </label>
                <input
                  type="text"
                  value={params.exactPhrase}
                  onChange={(e) =>
                    onUpdateParams((prev) => ({
                      ...prev,
                      customRawOverride: '',
                      exactPhrase: e.target.value,
                    }))
                  }
                  placeholder="e.g. internal use only"
                  className={inputCls}
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-[var(--v-ink-dim)] mb-1">
                  Exclude Terms (comma separated)
                </label>
                <input
                  type="text"
                  value={params.excludeTerms}
                  onChange={(e) =>
                    onUpdateParams((prev) => ({
                      ...prev,
                      customRawOverride: '',
                      excludeTerms: e.target.value,
                    }))
                  }
                  placeholder="e.g. marketing, blog"
                  className={inputCls}
                />
              </div>
            </div>
          )}
        </div>

        {/* 4. Customizable Keywords List */}
        <div className="px-4 py-3">
          <button
            type="button"
            onClick={() => toggleSection('keywords')}
            className="w-full flex items-center justify-between text-xs font-semibold text-[var(--v-ink)] mb-2"
          >
            <span>04. Customizable Keywords</span>
            {openSections.keywords ? (
              <ChevronDown className="w-3.5 h-3.5 text-[var(--v-ink-dim)]" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-[var(--v-ink-dim)]" />
            )}
          </button>

          {openSections.keywords && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-mono text-[var(--v-ink-dim)]">
                  Combinator
                </span>
                <div className="inline-flex border border-[var(--v-border)] rounded-xs overflow-hidden">
                  {(['OR', 'AND'] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() =>
                        onUpdateParams((prev) => ({
                          ...prev,
                          customRawOverride: '',
                          booleanMode: mode,
                        }))
                      }
                      className={`px-2 py-0.5 text-[11px] font-mono ${
                        params.booleanMode === mode
                          ? 'bg-[#ff4d00] text-[#111113] font-bold'
                          : 'bg-[var(--v-bg)] text-[var(--v-ink-dim)] hover:text-[var(--v-ink)]'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                {keywordGroups.map((group) => (
                  <div key={group.id} className="space-y-1">
                    <div className="text-[11px] font-medium text-[var(--v-ink-dim)]">
                      {group.name}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {group.keywords.map((kw) => {
                        const active = params.activeKeywords.includes(kw);
                        return (
                          <div
                            key={`${group.id}-${kw}`}
                            className="inline-flex items-center"
                          >
                            <button
                              type="button"
                              onClick={() => handleToggleKeyword(kw)}
                              className={`px-2 py-0.5 text-[11px] rounded-l-xs border transition-colors ${
                                active
                                  ? 'bg-[#ff4d00] text-[#111113] font-semibold border-[#ff4d00]'
                                  : 'bg-[var(--v-bg)] text-[var(--v-ink-dim)] border-[var(--v-border)] hover:text-[var(--v-ink)]'
                              }`}
                            >
                              {kw}
                            </button>
                            <button
                              type="button"
                              onClick={() => onRemoveKeyword(group.id, kw)}
                              aria-label={`Remove keyword ${kw}`}
                              className="px-1 py-0.5 text-[11px] border-y border-r border-[var(--v-border)] rounded-r-xs bg-[var(--v-bg)] text-[var(--v-ink-dim)] hover:text-red-500"
                            >
                              <Trash2 className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Custom Keyword */}
              <form onSubmit={handleAddKeywordSubmit} className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between">
                  <select
                    value={selectedGroupId}
                    onChange={(e) => setSelectedGroupId(e.target.value)}
                    className="text-[11px] bg-[var(--v-bg)] border border-[var(--v-border)] rounded-xs px-1.5 py-1 text-[var(--v-ink)] max-w-[165px]"
                  >
                    {keywordGroups.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setShowNewGroupInput((v) => !v)}
                    className="text-[11px] font-mono text-[#ff4d00] hover:underline whitespace-nowrap"
                  >
                    + New Group
                  </button>
                </div>

                <div className="flex gap-1">
                  <input
                    type="text"
                    value={newKeywordText}
                    onChange={(e) => setNewKeywordText(e.target.value)}
                    placeholder="Add custom keyword..."
                    className="flex-1 min-w-0 px-2 py-1 text-xs bg-[var(--v-bg)] text-[var(--v-ink)] border border-[var(--v-border)] rounded-xs placeholder:text-[var(--v-ink-dim)] focus:outline-none focus:border-[#ff4d00]"
                  />
                  <button
                    type="submit"
                    className="px-2 py-1 text-xs font-medium bg-[#ff4d00] text-[#111113] rounded-xs hover:bg-[#ff621f] shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>

              {showNewGroupInput && (
                <form onSubmit={handleCreateGroupSubmit} className="flex gap-1">
                  <input
                    type="text"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    placeholder="Group name..."
                    className="flex-1 min-w-0 px-2 py-1 text-xs bg-[var(--v-bg)] text-[var(--v-ink)] border border-[var(--v-border)] rounded-xs placeholder:text-[var(--v-ink-dim)] focus:outline-none focus:border-[#ff4d00]"
                  />
                  <button
                    type="submit"
                    className="px-2.5 py-1 text-[11px] font-semibold bg-[#ff4d00] text-[#111113] rounded-xs hover:bg-[#ff621f] shrink-0"
                  >
                    Create
                  </button>
                </form>
              )}
            </div>
          )}
        </div>

        {/* 5. Sensitive Data Query Filters (DLP & Compliance) */}
        <div className="px-4 py-3">
          <button
            type="button"
            onClick={() => toggleSection('sensitive')}
            className="w-full flex items-center justify-between text-xs font-semibold text-[var(--v-ink)] mb-2"
          >
            <span>05. Sensitive Data Filters</span>
            {openSections.sensitive ? (
              <ChevronDown className="w-3.5 h-3.5 text-[var(--v-ink-dim)]" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-[var(--v-ink-dim)]" />
            )}
          </button>

          {openSections.sensitive && (
            <div className="space-y-1.5">
              {SENSITIVE_DATA_FILTERS.map((filter) => {
                const active = params.activeSensitiveFilterIds.includes(filter.id);
                return (
                  <label
                    key={filter.id}
                    title={filter.description}
                    className={`flex items-start gap-2 p-2 rounded-xs border cursor-pointer transition-colors ${
                      active
                        ? 'bg-[#ff4d00]/10 border-[#ff4d00] text-[var(--v-ink)]'
                        : 'bg-[var(--v-bg)]/60 border-[var(--v-border)] text-[var(--v-ink-dim)] hover:text-[var(--v-ink)] hover:border-[var(--v-ink-dim)]'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={active}
                      onChange={() => handleToggleSensitiveFilter(filter.id)}
                      className="mt-0.5 rounded-xs border-[var(--v-border)] accent-[#ff4d00]"
                    />
                    <span className="text-[11px] leading-snug">
                      <span className="font-medium block text-[var(--v-ink)]">
                        {filter.label}
                      </span>
                      <span className={active ? 'text-[#ff4d00]' : 'text-[var(--v-ink-dim)]'}>
                        {filter.category}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
