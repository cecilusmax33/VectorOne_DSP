'use client';

import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  Bell,
  BookMarked,
  BookOpen,
  Database,
  HelpCircle,
  History,
  Keyboard,
  LayoutDashboard,
  Search,
  ShieldCheck,
  SlidersHorizontal,
} from 'lucide-react';
import { WorkspaceView } from '@/lib/types';

interface HelpViewProps {
  onNavigateView: (view: WorkspaceView) => void;
  onOpenHowToPopup: () => void;
  onOpenCheatSheet: () => void;
  onOpenShortcuts: () => void;
}

interface HelpSection {
  id: string;
  number: string;
  title: string;
  summary: string;
  icon: React.ReactNode;
  steps: string[];
  tips: string;
  actionLabel: string;
  actionType: 'view' | 'howto' | 'cheatsheet' | 'shortcuts';
  targetView?: WorkspaceView;
}

const HELP_SECTIONS: HelpSection[] = [
  {
    id: 'workbench',
    number: '01',
    title: 'Query Workbench & Multi-Platform Launchers',
    summary:
      'Compose search operator queries automatically from sidebar parameters or write custom syntax directly.',
    icon: <Search className="w-4 h-4 text-[#ff4d00]" />,
    steps: [
      'Select your target search engine tab (Google, Bing, DuckDuckGo, GitHub, Shodan, or Wayback) to tailor syntax.',
      'Edit parameters in the sidebar or type directly into the Composed Query box; use "Sync back to sidebar parameters" to clear manual overrides.',
      'Click "Run Automated Search" (Ctrl/⌘ + Enter) for live Gemini-grounded search results and synthesis, or use "Launch on:" links to open the query directly on external platforms.',
      'Use the Active Refinement Scope card beside the composer for 1-click insertion of site:, filetype:, inurl:, intitle:, intext:, and after: snippets.',
    ],
    tips: 'Press Ctrl/⌘ + K anywhere in the app to jump straight to the Query Workbench and focus the query input.',
    actionLabel: 'Open Query Workbench',
    actionType: 'view',
    targetView: 'workbench',
  },
  {
    id: 'filters',
    number: '02',
    title: 'Advanced Filtering (Date, Rank, Geo & DLP)',
    summary:
      'Combine domain scoping, date ranges, SERP rank windows, language, country, keywords, and DLP filters.',
    icon: <SlidersHorizontal className="w-4 h-4 text-[#ff4d00]" />,
    steps: [
      '01. Domain & Scope: Scope queries to a single domain (site:), add URL path prefixes (inurl:), or exclude www and dev/staging subdomains.',
      '02. Date, Rank, Lang & Geo: Filter by Last 24h/7d/30d/1y or custom After/Before dates, slice SERP rank windows (Top 10, 11–30, 31–50, or custom ranks), and target language/country codes.',
      '03. File Types & Operators: Toggle common extensions (pdf, xlsx, sql, env, json, log) and combine intitle:, inurl:, intext:, exact phrases, and exclusions.',
      '04–05. Keywords & Sensitive Data Filters: Group custom keywords with AND/OR boolean logic and layer compliance DLP clauses.',
    ],
    tips: 'All active filters update the composed query live and are recorded on every entry in Search History.',
    actionLabel: 'Configure in Workbench',
    actionType: 'view',
    targetView: 'workbench',
  },
  {
    id: 'catalog',
    number: '03',
    title: 'Dork Reference Catalog & Operator Cheat Sheet',
    summary:
      'Explore categorized audit templates and a complete operator reference with examples.',
    icon: <BookOpen className="w-4 h-4 text-[#ff4d00]" />,
    steps: [
      'Open Dork Catalog (Ctrl/⌘ + D) to search across 8 audit categories including Public Documents, Cloud Exposure, and API Discovery.',
      'Your currently entered Target Domain automatically replaces {domain} inside every template preview.',
      'Click "Load into Workbench" to populate the full query and platform settings, or "Run Live" to open it directly.',
      'Switch to the Operator Cheat Sheet tab—or open the quick drawer anytime via Ctrl/⌘ + /—to review site:, filetype:, inurl:, cache:, and boolean syntax.',
    ],
    tips: 'Use "Insert Operator" in the Cheat Sheet drawer or tab to append an operator snippet directly to your active query.',
    actionLabel: 'Browse Dork Catalog',
    actionType: 'view',
    targetView: 'catalog',
  },
  {
    id: 'database',
    number: '04',
    title: 'Findings Database, Triage & CSV / JSON Export',
    summary:
      'Index discovered URLs locally, assign triage states and remediation notes, and export selected records.',
    icon: <Database className="w-4 h-4 text-[#ff4d00]" />,
    steps: [
      'Save individual results from the Query Workbench with "+ Save" or save all live findings at once using Ctrl/⌘ + S.',
      'Filter stored records by free text, domain, sensitivity category, or triage status (New, Reviewed, Archived).',
      'Toggle between the responsive 1/2/3-column Card Grid and high-density Table view using the Grid / Table switch.',
      'Click "Export Findings" (or press Ctrl/⌘ + E) to open the Export Modal, pick specific rows, customize the filename, and download CSV or JSON.',
    ],
    tips: 'You can also import previously exported JSON backups via "Import JSON" to restore or merge audit findings.',
    actionLabel: 'Open Findings Database',
    actionType: 'view',
    targetView: 'database',
  },
  {
    id: 'dashboard',
    number: '05',
    title: 'Telemetry Dashboard & Light / Dark Theme',
    summary:
      'Monitor 14-day search volume, platform distribution, sensitivity breakdown, and alert telemetry.',
    icon: <LayoutDashboard className="w-4 h-4 text-[#ff4d00]" />,
    steps: [
      'Review the 4 KPI cards at the top of the Dashboard for total findings indexed, searches executed, Gmail alerts sent, and unique domains.',
      'Inspect the 14-Day Search Activity chart and platform breakdown to identify audit coverage gaps.',
      'Review sensitivity distribution bars and Top Indexed Domains to prioritize high-risk remediation.',
      'Use the Light / Dark toggle pinned at the bottom-right corner of the Dashboard page to switch color themes anytime.',
    ],
    tips: 'Click "Re-run" on any item in the Recent Search Activity Feed to reload that exact query into the Workbench.',
    actionLabel: 'View Dashboard',
    actionType: 'view',
    targetView: 'dashboard',
  },
  {
    id: 'history',
    number: '06',
    title: 'Search History Audit Log',
    summary:
      'Maintain a complete local audit trail of every automated search, external API call, and launcher click.',
    icon: <History className="w-4 h-4 text-[#ff4d00]" />,
    steps: [
      'Every executed query automatically logs timestamp, platform, execution mode, result count, and all applied refinements.',
      'Filter history entries by query text, domain, platform, or execution mode in Grid or Table layout.',
      'Click "Re-run" to restore any historical query in the Workbench, or "Alert" to turn a past query into a monitored Alert Rule.',
      'Download a complete audit log spreadsheet anytime via "Export History CSV".',
    ],
    tips: 'History stores up to 500 recent runs locally in your browser and can be cleared via "Clear Log" when rotating engagements.',
    actionLabel: 'Open Search History',
    actionType: 'view',
    targetView: 'history',
  },
  {
    id: 'alerts',
    number: '07',
    title: 'Gmail Alerts & External API / Webhook Connectors',
    summary:
      'Send confirmed findings digests via Google Workspace Gmail OAuth and integrate external REST APIs or SIEM webhooks.',
    icon: <Bell className="w-4 h-4 text-[#ff4d00]" />,
    steps: [
      'Sign in with Google on the Alerts & APIs view to authorize outbound Gmail notifications (gmail.send scope).',
      'Create Alert Rules specifying a monitored query, recipient email, cadence label, and minimum findings threshold.',
      'Every outbound email displays a confirmation preview modal showing recipient, subject, and body before any message is dispatched.',
      'Add custom Search APIs (GET) or Alert Webhooks (POST) under External Connectors—all requests route safely through the server-side proxy.',
    ],
    tips: 'From Findings Database, select specific findings and click "Send Gmail Digest" to notify stakeholders about targeted exposures.',
    actionLabel: 'Open Alerts & APIs',
    actionType: 'view',
    targetView: 'alerts',
  },
  {
    id: 'shortcuts',
    number: '08',
    title: 'Global Keyboard Shortcuts & Navigation',
    summary:
      'Navigate views, focus the query composer, run searches, and export findings without leaving the keyboard.',
    icon: <Keyboard className="w-4 h-4 text-[#ff4d00]" />,
    steps: [
      'Ctrl/⌘ + K focuses the Query Workbench composer; Ctrl/⌘ + Enter executes an automated grounded search.',
      'Ctrl/⌘ + D opens the Dork Catalog; Ctrl/⌘ + / toggles the quick Operator Cheat Sheet drawer.',
      'Ctrl/⌘ + S saves all unsaved live findings to the database; Ctrl/⌘ + E opens the Export modal.',
      'Ctrl/⌘ + 1 through Ctrl/⌘ + 7 switch directly between Dashboard, Workbench, Catalog, Database, History, Alerts, and Help.',
    ],
    tips: 'Press ? when not typing in an input field to pop open the full Keyboard Shortcuts Reference, or Esc to close any modal.',
    actionLabel: 'View Shortcuts Reference',
    actionType: 'shortcuts',
  },
  {
    id: 'compliance',
    number: '09',
    title: 'Ethical Use, Privacy Compliance & Quick Start',
    summary:
      'Document authorized audit scope, review liability boundaries, and relaunch the Quick Search Query popup.',
    icon: <ShieldCheck className="w-4 h-4 text-[#ff4d00]" />,
    steps: [
      'Record your engagement ticket ID or authorized domain scope under Compliance & Ethics for local audit documentation.',
      'Ensure every query targets only domains you own or hold explicit written authorization to assess.',
      'Relaunch the "How To Use" startup popup anytime using the button below to run a Quick Search Query from anywhere.',
      'Review the Operator Cheat Sheet drawer (Ctrl/⌘ + /) alongside Compliance rules whenever onboarding new team members.',
    ],
    tips: 'Checking "Don\'t show this quick-start popup on startup" inside the How-To modal only suppresses auto-open; you can always reopen it here.',
    actionLabel: 'Open Compliance & Ethics',
    actionType: 'view',
    targetView: 'compliance',
  },
];

export default function HelpView({
  onNavigateView,
  onOpenHowToPopup,
  onOpenCheatSheet,
  onOpenShortcuts,
}: HelpViewProps) {
  const [searchText, setSearchText] = useState('');

  const filteredSections = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    if (!q) return HELP_SECTIONS;
    return HELP_SECTIONS.filter(
      (sec) =>
        sec.title.toLowerCase().includes(q) ||
        sec.summary.toLowerCase().includes(q) ||
        sec.tips.toLowerCase().includes(q) ||
        sec.steps.some((step) => step.toLowerCase().includes(q))
    );
  }, [searchText]);

  const handleCardAction = (sec: HelpSection) => {
    if (sec.actionType === 'view' && sec.targetView) {
      onNavigateView(sec.targetView);
    } else if (sec.actionType === 'howto') {
      onOpenHowToPopup();
    } else if (sec.actionType === 'cheatsheet') {
      onOpenCheatSheet();
    } else if (sec.actionType === 'shortcuts') {
      onOpenShortcuts();
    }
  };

  return (
    <div className="col-span-full bg-[var(--v-surface)] border border-[var(--v-border)] border-t-[3px] border-t-[#ff4d00] divide-y divide-[var(--v-border)]">
      {/* Header & Quick Utility Launchers */}
      <div className="p-6 flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1 max-w-2xl">
          <h1 className="font-display text-xl sm:text-2xl font-extrabold uppercase tracking-tight text-[var(--v-ink)] flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-[#ff4d00] shrink-0" />
            Help Center &amp; Feature Documentation
          </h1>
          <p className="text-xs text-[var(--v-ink-dim)] leading-relaxed">
            Step-by-step instructions for every workspace tool in VectorOne_DSP—from query composition and advanced filtering to findings triage, CSV/JSON export, Gmail alerts, and keyboard shortcuts.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onOpenCheatSheet}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-medium text-[var(--v-ink)] bg-[var(--v-bg)] border border-[var(--v-border)] rounded-xs hover:border-[#ff4d00] hover:text-[#ff4d00] transition-colors whitespace-nowrap"
          >
            <BookMarked className="w-3.5 h-3.5 text-[#ff4d00]" />
            Operator Cheat Sheet
          </button>
          <button
            type="button"
            onClick={onOpenShortcuts}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-medium text-[var(--v-ink)] bg-[var(--v-bg)] border border-[var(--v-border)] rounded-xs hover:border-[#ff4d00] hover:text-[#ff4d00] transition-colors whitespace-nowrap"
          >
            <Keyboard className="w-3.5 h-3.5 text-[#ff4d00]" />
            Shortcuts
          </button>
          <button
            type="button"
            onClick={onOpenHowToPopup}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-display font-extrabold uppercase tracking-tight bg-[#ff4d00] text-[#111113] rounded-xs hover:bg-[#ff621f] transition-colors whitespace-nowrap"
          >
            <Search className="w-3.5 h-3.5" />
            Quick Search Popup
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="px-6 py-3.5 bg-[var(--v-bg)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 text-[var(--v-ink-dim)] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search help topics (e.g. Gmail, CSV, dork, rank, webhook)..."
            className="w-full pl-8 pr-3 py-1.5 text-xs font-mono bg-[var(--v-surface)] border border-[var(--v-border)] rounded-xs text-[var(--v-ink)] placeholder:text-[var(--v-ink-dim)] focus:outline-none focus:border-[#ff4d00]"
          />
        </div>
        <div className="text-[11px] font-mono tabular-nums text-[var(--v-ink-dim)]">
          Showing {filteredSections.length} of {HELP_SECTIONS.length} feature guide(s)
        </div>
      </div>

      {/* Responsive 1 / 2 / 3-Column Feature Guides Grid */}
      <div className="p-5 bg-[var(--v-bg)]/40">
        {filteredSections.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 items-stretch">
            {filteredSections.map((sec) => (
              <article
                key={sec.id}
                className="min-w-0 bg-[var(--v-surface)] border border-[var(--v-border)] p-5 flex flex-col justify-between gap-4 hover:border-[#ff4d00]/70 transition-colors"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <span className="text-[11px] font-mono font-bold text-[#ff4d00]">
                        Guide {sec.number}
                      </span>
                      <h2 className="font-display text-sm font-bold uppercase tracking-tight text-[var(--v-ink)] leading-snug">
                        {sec.title}
                      </h2>
                    </div>
                    <span className="p-1.5 bg-[var(--v-bg)] border border-[var(--v-border)] rounded-xs shrink-0">
                      {sec.icon}
                    </span>
                  </div>

                  <p className="text-xs text-[var(--v-ink-dim)] leading-relaxed">
                    {sec.summary}
                  </p>

                  <ol className="space-y-1.5 text-xs text-[var(--v-ink-dim)] leading-relaxed list-decimal pl-4">
                    {sec.steps.map((step) => (
                      <li key={step}>{step}</li>
                    ))}
                  </ol>
                </div>

                <div className="space-y-3 pt-3 border-t border-[var(--v-border)]">
                  <div className="p-2.5 bg-[var(--v-bg)] border border-[var(--v-border)] rounded-xs text-[11px] text-[var(--v-ink-dim)] leading-relaxed">
                    <strong className="font-mono text-[var(--v-ink)]">Tip:</strong>{' '}
                    {sec.tips}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCardAction(sec)}
                    className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-mono font-semibold text-[var(--v-ink)] bg-[var(--v-bg)] border border-[var(--v-border)] rounded-xs hover:border-[#ff4d00] hover:text-[#ff4d00] transition-colors"
                  >
                    {sec.actionLabel}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="p-10 text-center space-y-2">
            <div className="text-xs font-mono font-bold text-[var(--v-ink)]">
              No Matching Help Topics
            </div>
            <p className="text-xs text-[var(--v-ink-dim)]">
              Try a broader keyword or clear the search box to browse all 9 feature guides.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
