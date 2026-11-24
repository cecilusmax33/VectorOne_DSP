'use client';

import React, { useMemo } from 'react';
import {
  Activity,
  ArrowRight,
  Bell,
  CheckCircle2,
  Database,
  Mail,
  Moon,
  Search,
  ShieldAlert,
  Sun,
  XCircle,
} from 'lucide-react';
import { PLATFORM_DEFINITIONS } from '@/lib/dork-catalog';
import {
  AlertDispatchLog,
  AlertRule,
  FindingRecord,
  PlatformId,
  SearchHistoryEntry,
  SensitivityLevel,
  WorkspaceView,
} from '@/lib/types';

interface DashboardViewProps {
  findings: FindingRecord[];
  history: SearchHistoryEntry[];
  alertRules: AlertRule[];
  alertLogs: AlertDispatchLog[];
  gmailConnectedEmail: string | null;
  theme: 'light' | 'dark';
  onChangeTheme: (theme: 'light' | 'dark') => void;
  onNavigateView: (view: WorkspaceView) => void;
  onRerunQuery: (entry: SearchHistoryEntry) => void;
}

const SENSITIVITY_ORDER: SensitivityLevel[] = [
  'Standard',
  'Config-Exposure',
  'Sensitive-PII',
  'Credential-Risk',
  'Regulated',
];

export default function DashboardView({
  findings,
  history,
  alertRules,
  alertLogs,
  gmailConnectedEmail,
  theme,
  onChangeTheme,
  onNavigateView,
  onRerunQuery,
}: DashboardViewProps) {
  // 1. Local Findings Metrics
  const findingsMetrics = useMemo(() => {
    const byTriage = { New: 0, Reviewed: 0, Archived: 0 };
    const bySensitivity: Record<SensitivityLevel, number> = {
      Standard: 0,
      'Config-Exposure': 0,
      'Sensitive-PII': 0,
      'Credential-Risk': 0,
      Regulated: 0,
    };
    const domainCounts = new Map<string, number>();

    for (const f of findings) {
      byTriage[f.triageStatus] = (byTriage[f.triageStatus] || 0) + 1;
      bySensitivity[f.sensitivityCategory] =
        (bySensitivity[f.sensitivityCategory] || 0) + 1;
      if (f.domain) {
        domainCounts.set(f.domain, (domainCounts.get(f.domain) || 0) + 1);
      }
    }

    const topDomains = Array.from(domainCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);

    const elevatedCount =
      bySensitivity['Config-Exposure'] +
      bySensitivity['Sensitive-PII'] +
      bySensitivity['Credential-Risk'] +
      bySensitivity.Regulated;

    return {
      total: findings.length,
      byTriage,
      bySensitivity,
      uniqueDomainsCount: domainCounts.size,
      topDomains,
      elevatedCount,
    };
  }, [findings]);

  // 2. Recent Search Activity (14-day timeline + platform distribution)
  const searchMetrics = useMemo(() => {
    const now = new Date();
    const dayBuckets: {
      dateKey: string;
      label: string;
      searches: number;
      findingsReturned: number;
    }[] = [];
    const bucketMap = new Map<string, (typeof dayBuckets)[number]>();

    for (let i = 13; i >= 0; i -= 1) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateKey = d.toISOString().slice(0, 10);
      const label = d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      });
      const entry = { dateKey, label, searches: 0, findingsReturned: 0 };
      dayBuckets.push(entry);
      bucketMap.set(dateKey, entry);
    }

    const platformCounts: Record<PlatformId, number> = {
      google: 0,
      bing: 0,
      duckduckgo: 0,
      github: 0,
      shodan: 0,
      wayback: 0,
    };

    const modeCounts = {
      'Gemini Grounded': 0,
      'External API': 0,
      'Engine Launcher': 0,
    };

    for (const h of history) {
      const key = h.timestamp.slice(0, 10);
      const bucket = bucketMap.get(key);
      if (bucket) {
        bucket.searches += 1;
        bucket.findingsReturned += h.resultCount || 0;
      }
      platformCounts[h.platform] = (platformCounts[h.platform] || 0) + 1;
      modeCounts[h.executionMode] = (modeCounts[h.executionMode] || 0) + 1;
    }

    const maxDailySearches = Math.max(
      1,
      ...dayBuckets.map((b) => b.searches)
    );

    return {
      totalSearches: history.length,
      dayBuckets,
      maxDailySearches,
      platformCounts,
      modeCounts,
      recentEntries: history.slice(0, 6),
    };
  }, [history]);

  // 3. Triggered Email Alerts Summary
  const alertMetrics = useMemo(() => {
    let sentCount = 0;
    let failedCount = 0;
    let totalFindingsDispatched = 0;

    for (const log of alertLogs) {
      if (log.status === 'Sent') {
        sentCount += 1;
        totalFindingsDispatched += log.findingsCount || 0;
      } else {
        failedCount += 1;
      }
    }

    const activeRulesCount = alertRules.filter((r) => r.enabled).length;
    const recentDispatches = alertLogs.slice(0, 5);

    return {
      totalDispatches: alertLogs.length,
      sentCount,
      failedCount,
      totalFindingsDispatched,
      activeRulesCount,
      totalRulesCount: alertRules.length,
      recentDispatches,
    };
  }, [alertLogs, alertRules]);

  const sensitivityBarColor = (level: SensitivityLevel) => {
    switch (level) {
      case 'Credential-Risk':
      case 'Regulated':
        return 'bg-red-600 dark:bg-red-500';
      case 'Sensitive-PII':
      case 'Config-Exposure':
        return 'bg-amber-500';
      default:
        return 'bg-[#ff4d00]';
    }
  };

  return (
    <div className="col-span-full space-y-6 pb-14">
      {/* Top Hero / Overview Bar */}
      <div className="bg-[var(--v-surface)] border border-[var(--v-border)] border-t-[3px] border-t-[#ff4d00] p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-xl sm:text-2xl font-extrabold uppercase tracking-tight text-[var(--v-ink)]">
            Workspace Telemetry &amp; Audit Dashboard
          </h1>
          <p className="text-xs text-[var(--v-ink-dim)] mt-1">
            Real-time overview of local indexed findings, recent multi-platform search activity, and triggered Gmail alert dispatches.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => onNavigateView('database')}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[var(--v-ink)] bg-[var(--v-bg)] border border-[var(--v-border)] rounded-xs hover:border-[#ff4d00] hover:text-[#ff4d00] transition-colors whitespace-nowrap shrink-0"
          >
            <Database className="w-3.5 h-3.5" />
            Browse Database
          </button>
          <button
            type="button"
            onClick={() => onNavigateView('workbench')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-display font-extrabold uppercase tracking-tight bg-[#ff4d00] text-[#111113] rounded-xs hover:bg-[#ff621f] transition-colors whitespace-nowrap shrink-0"
          >
            <Search className="w-3.5 h-3.5" />
            Open Query Workbench
          </button>
        </div>
      </div>

      {/* 4-Column Swiss-Grid KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 bg-[var(--v-surface)] border border-[var(--v-border)] divide-y sm:divide-y-0 sm:divide-x divide-[var(--v-border)]">
        {/* KPI 1: Total Findings Indexed */}
        <div className="p-5 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-[var(--v-ink-dim)]">
            <span>Findings Indexed</span>
            <Database className="w-4 h-4 text-[#ff4d00]" />
          </div>
          <div className="text-3xl font-bold font-mono tabular-nums text-[var(--v-ink)]">
            {findingsMetrics.total}
          </div>
          <div className="text-[11px] text-[var(--v-ink-dim)] font-mono tabular-nums">
            {findingsMetrics.byTriage.New} New ·{' '}
            {findingsMetrics.byTriage.Reviewed} Reviewed ·{' '}
            {findingsMetrics.byTriage.Archived} Archived
          </div>
        </div>

        {/* KPI 2: Search Activity */}
        <div className="p-5 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-[var(--v-ink-dim)]">
            <span>Searches Executed</span>
            <Activity className="w-4 h-4 text-[#ff4d00]" />
          </div>
          <div className="text-3xl font-bold font-mono tabular-nums text-[var(--v-ink)]">
            {searchMetrics.totalSearches}
          </div>
          <div className="text-[11px] text-[var(--v-ink-dim)] font-mono tabular-nums">
            {searchMetrics.modeCounts['Gemini Grounded']} Grounded ·{' '}
            {searchMetrics.modeCounts['Engine Launcher']} Launched ·{' '}
            {searchMetrics.modeCounts['External API']} API
          </div>
        </div>

        {/* KPI 3: Triggered Email Alerts */}
        <div className="p-5 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-[var(--v-ink-dim)]">
            <span>Triggered Email Alerts</span>
            <Mail className="w-4 h-4 text-[#ff4d00]" />
          </div>
          <div className="text-3xl font-bold font-mono tabular-nums text-[var(--v-ink)]">
            {alertMetrics.totalDispatches}
          </div>
          <div className="text-[11px] text-[var(--v-ink-dim)] font-mono tabular-nums">
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
              {alertMetrics.sentCount} Sent
            </span>{' '}
            ·{' '}
            <span
              className={
                alertMetrics.failedCount > 0
                  ? 'text-red-700 dark:text-red-400 font-semibold'
                  : 'text-[var(--v-ink-dim)]'
              }
            >
              {alertMetrics.failedCount} Failed
            </span>{' '}
            · {alertMetrics.activeRulesCount} Active Rule(s)
          </div>
        </div>

        {/* KPI 4: Domains & Elevated Findings */}
        <div className="p-5 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-[var(--v-ink-dim)]">
            <span>Domains &amp; Sensitive Hits</span>
            <ShieldAlert className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-bold font-mono tabular-nums text-[var(--v-ink)]">
            {findingsMetrics.uniqueDomainsCount}
          </div>
          <div className="text-[11px] text-[var(--v-ink-dim)] font-mono tabular-nums">
            {findingsMetrics.elevatedCount} elevated sensitivity finding(s)
          </div>
        </div>
      </div>

      {/* Responsive 1 -> 2 -> 3 Column Telemetry & Activity Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-stretch">
        {/* Panel 1: 14-Day Search Activity Visualization */}
        <div className="col-span-1 min-w-0 bg-[var(--v-surface)] border border-[var(--v-border)] divide-y divide-[var(--v-border)] flex flex-col">
          <div className="px-5 py-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-sm font-bold uppercase tracking-tight text-[var(--v-ink)]">
                14-Day Search Activity
              </h2>
              <p className="text-xs text-[var(--v-ink-dim)] mt-0.5">
                Daily query executions across automated grounding, engine launchers, and external APIs.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigateView('history')}
              className="text-xs font-mono font-semibold text-[#ff4d00] hover:underline inline-flex items-center gap-1 whitespace-nowrap shrink-0"
            >
              Full History
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="p-5 space-y-5 flex-1">
            {/* 14-day Bar Chart */}
            <div className="space-y-2">
              <div className="flex items-end gap-1.5 h-36 border-b border-[var(--v-border)] pb-1">
                {searchMetrics.dayBuckets.map((day) => {
                  const pct =
                    day.searches > 0
                      ? Math.max(
                          10,
                          Math.round(
                            (day.searches / searchMetrics.maxDailySearches) * 100
                          )
                        )
                      : 0;
                  return (
                    <div
                      key={day.dateKey}
                      className="flex-1 h-full flex flex-col items-center justify-end gap-1 group"
                      title={`${day.label}: ${day.searches} search(es), ${day.findingsReturned} grounded result(s)`}
                    >
                      <span className="text-[10px] font-mono tabular-nums text-[var(--v-ink-dim)] opacity-0 group-hover:opacity-100 transition-opacity">
                        {day.searches}
                      </span>
                      <div
                        style={{
                          height: day.searches > 0 ? `${pct}%` : '2px',
                        }}
                        className={`w-full rounded-t-xs transition-colors ${
                          day.searches > 0
                            ? 'bg-[#ff4d00] group-hover:bg-[#ff621f]'
                            : 'bg-[var(--v-surface-2)]'
                        }`}
                      />
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center justify-between text-[10px] font-mono tabular-nums text-[var(--v-ink-dim)]">
                <span>{searchMetrics.dayBuckets[0]?.label}</span>
                <span>{searchMetrics.dayBuckets[6]?.label}</span>
                <span>{searchMetrics.dayBuckets[13]?.label}</span>
              </div>
            </div>

            {/* Platform Execution Distribution */}
            <div className="pt-3 border-t border-[var(--v-border)] space-y-2.5">
              <div className="text-[11px] font-mono uppercase tracking-wider font-bold text-[var(--v-ink)]">
                Queries by Target Platform
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {PLATFORM_DEFINITIONS.map((plat) => {
                  const count = searchMetrics.platformCounts[plat.id] || 0;
                  const pct =
                    searchMetrics.totalSearches > 0
                      ? Math.round((count / searchMetrics.totalSearches) * 100)
                      : 0;
                  return (
                    <div
                      key={plat.id}
                      className="p-2.5 bg-[var(--v-bg)] border border-[var(--v-border)] rounded-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-[var(--v-ink)]">
                          {plat.label}
                        </span>
                        <span className="font-mono tabular-nums text-[var(--v-ink-dim)]">
                          {count}
                        </span>
                      </div>
                      <div className="h-1.5 bg-[var(--v-surface-2)] rounded-xs overflow-hidden">
                        <div
                          style={{ width: `${pct}%` }}
                          className="h-full bg-[#ff4d00]"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Panel 2: Local Database Findings Breakdown */}
        <div className="col-span-1 min-w-0 bg-[var(--v-surface)] border border-[var(--v-border)] divide-y divide-[var(--v-border)] flex flex-col">
          <div className="px-5 py-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-sm font-bold uppercase tracking-tight text-[var(--v-ink)]">
                Indexed Findings Distribution
              </h2>
              <p className="text-xs text-[var(--v-ink-dim)] mt-0.5">
                Sensitivity breakdown and top domains in local storage.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigateView('database')}
              className="text-xs font-mono font-semibold text-[#ff4d00] hover:underline inline-flex items-center gap-1 whitespace-nowrap shrink-0"
            >
              Open Database
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="p-5 space-y-5 flex-1">
            {/* Sensitivity Category Bars */}
            <div className="space-y-2.5">
              {SENSITIVITY_ORDER.map((level) => {
                const count = findingsMetrics.bySensitivity[level] || 0;
                const pct =
                  findingsMetrics.total > 0
                    ? Math.round((count / findingsMetrics.total) * 100)
                    : 0;
                return (
                  <div key={level} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[var(--v-ink)] font-medium">
                        {level}
                      </span>
                      <span className="font-mono tabular-nums text-[var(--v-ink-dim)]">
                        {count} ({pct}%)
                      </span>
                    </div>
                    <div className="h-2 bg-[var(--v-bg)] border border-[var(--v-border)] rounded-xs overflow-hidden">
                      <div
                        style={{ width: `${pct}%` }}
                        className={`h-full ${sensitivityBarColor(level)}`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Top Domains List */}
            <div className="pt-3 border-t border-[var(--v-border)] space-y-2">
              <div className="text-[11px] font-mono uppercase tracking-wider font-bold text-[var(--v-ink)]">
                Top Indexed Domains
              </div>
              {findingsMetrics.topDomains.length > 0 ? (
                <div className="divide-y divide-[var(--v-border)] border border-[var(--v-border)] rounded-xs bg-[var(--v-bg)]">
                  {findingsMetrics.topDomains.map(([domain, count]) => (
                    <div
                      key={domain}
                      className="px-3 py-2 flex items-center justify-between text-xs"
                    >
                      <span className="font-mono text-[var(--v-ink)] truncate">
                        {domain}
                      </span>
                      <span className="font-mono tabular-nums text-[var(--v-ink-dim)]">
                        {count} finding(s)
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 border border-dashed border-[var(--v-border)] rounded-xs text-center text-xs text-[var(--v-ink-dim)]">
                  No findings saved in the local database yet.
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Panel 3: Triggered Email Alerts Summary */}
        <div className="col-span-1 min-w-0 bg-[var(--v-surface)] border border-[var(--v-border)] divide-y divide-[var(--v-border)] flex flex-col">
          <div className="px-5 py-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-sm font-bold uppercase tracking-tight text-[var(--v-ink)] flex items-center gap-1.5">
                <Bell className="w-4 h-4 text-[#ff4d00]" />
                Triggered Email Alerts Summary
              </h2>
              <p className="text-[11px] text-[var(--v-ink-dim)] mt-0.5">
                {gmailConnectedEmail
                  ? `Gmail connected (${gmailConnectedEmail})`
                  : 'Connect Gmail in Alerts & APIs to send email digests'}{' '}
                · {alertMetrics.activeRulesCount}/{alertMetrics.totalRulesCount}{' '}
                active rule(s)
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigateView('alerts')}
              className="text-xs font-mono font-semibold text-[#ff4d00] hover:underline inline-flex items-center gap-1 whitespace-nowrap shrink-0"
            >
              Manage Alerts
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="px-5 py-3 bg-[var(--v-bg)] grid grid-cols-3 divide-x divide-[var(--v-border)] text-center">
            <div className="px-2">
              <div className="text-lg font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
                {alertMetrics.sentCount}
              </div>
              <div className="text-[11px] font-mono text-[var(--v-ink-dim)]">
                Emails Sent
              </div>
            </div>
            <div className="px-2">
              <div className="text-lg font-bold font-mono tabular-nums text-red-700 dark:text-red-400">
                {alertMetrics.failedCount}
              </div>
              <div className="text-[11px] font-mono text-[var(--v-ink-dim)]">
                Failed
              </div>
            </div>
            <div className="px-2">
              <div className="text-lg font-bold font-mono tabular-nums text-[var(--v-ink)]">
                {alertMetrics.totalFindingsDispatched}
              </div>
              <div className="text-[11px] font-mono text-[var(--v-ink-dim)]">
                Findings Notified
              </div>
            </div>
          </div>

          {alertMetrics.recentDispatches.length > 0 ? (
            <div className="divide-y divide-[var(--v-border)]">
              {alertMetrics.recentDispatches.map((log) => (
                <div
                  key={log.id}
                  className="px-5 py-3 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-0 space-y-0.5">
                    <div className="font-medium text-[var(--v-ink)] truncate">
                      {log.ruleName}
                    </div>
                    <div className="text-[11px] font-mono text-[var(--v-ink-dim)] truncate">
                      To: {log.recipientEmail} · {log.findingsCount} finding(s)
                    </div>
                  </div>

                  <div className="text-right shrink-0 space-y-0.5">
                    <div
                      className={`inline-flex items-center gap-1 text-[11px] font-mono font-semibold ${
                        log.status === 'Sent'
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-red-700 dark:text-red-400'
                      }`}
                    >
                      {log.status === 'Sent' ? (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5" />
                      )}
                      {log.status}
                    </div>
                    <div className="text-[10px] font-mono tabular-nums text-[var(--v-ink-dim)]">
                      {new Date(log.sentAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center space-y-2">
              <div className="text-xs font-mono font-bold text-[var(--v-ink)]">
                No Email Alerts Triggered Yet
              </div>
              <p className="text-xs text-[var(--v-ink-dim)]">
                Create an alert rule or dispatch a findings digest via Gmail to see alert telemetry here.
              </p>
            </div>
          )}
        </div>

        {/* Panel 4: Recent Search Queries Feed (2x2 partner on md, full 3-col span on xl) */}
        <div className="col-span-1 md:col-span-1 xl:col-span-3 min-w-0 bg-[var(--v-surface)] border border-[var(--v-border)] divide-y divide-[var(--v-border)] flex flex-col">
          <div className="px-5 py-4 flex items-center justify-between gap-3">
            <h2 className="font-display text-sm font-bold uppercase tracking-tight text-[var(--v-ink)]">
              Recent Search Activity Feed
            </h2>
            <span className="text-[11px] font-mono tabular-nums text-[var(--v-ink-dim)]">
              Latest {searchMetrics.recentEntries.length} of{' '}
              {searchMetrics.totalSearches}
            </span>
          </div>

          {searchMetrics.recentEntries.length > 0 ? (
            <div className="grid grid-cols-1 xl:grid-cols-3 divide-y xl:divide-y-0 xl:gap-px bg-[var(--v-border)]">
              {searchMetrics.recentEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="px-5 py-3.5 bg-[var(--v-surface)] flex items-start justify-between gap-3 hover:bg-[var(--v-surface-2)]/50 transition-colors"
                >
                  <div className="min-w-0 space-y-0.5">
                    <div className="font-mono text-xs text-[var(--v-ink)] truncate">
                      {entry.composedQuery}
                    </div>
                    <div className="text-[11px] font-mono text-[var(--v-ink-dim)]">
                      {entry.platform.toUpperCase()} · {entry.executionMode} ·{' '}
                      <span className="tabular-nums">
                        {entry.resultCount} hit(s)
                      </span>{' '}
                      · {new Date(entry.timestamp).toLocaleString()}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onRerunQuery(entry)}
                    className="px-2.5 py-1 text-[11px] font-mono font-medium text-[var(--v-ink)] bg-[var(--v-bg)] border border-[var(--v-border)] rounded-xs hover:border-[#ff4d00] hover:text-[#ff4d00] transition-colors shrink-0 whitespace-nowrap"
                  >
                    Re-run
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center space-y-2">
              <div className="text-xs font-mono font-bold text-[var(--v-ink)]">
                No Recent Searches Recorded
              </div>
              <p className="text-xs text-[var(--v-ink-dim)]">
                Launch a search query from the Query Workbench to populate activity telemetry.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom-Right Light / Dark Mode Toggle for Workspace Telemetry & Audit Dashboard */}
      <div className="fixed bottom-4 right-5 z-40">
        <div
          role="group"
          aria-label="Color theme toggle"
          className="inline-flex items-center p-1 bg-[var(--v-surface)] border border-[var(--v-border)] rounded-xs shadow-sm"
        >
          <button
            type="button"
            onClick={() => onChangeTheme('light')}
            aria-pressed={theme === 'light'}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded-xs transition-colors whitespace-nowrap shrink-0 ${
              theme === 'light'
                ? 'bg-[#ff4d00] text-[#111113] font-bold'
                : 'text-[var(--v-ink-dim)] hover:text-[var(--v-ink)]'
            }`}
          >
            <Sun className="w-3.5 h-3.5" />
            Light
          </button>
          <button
            type="button"
            onClick={() => onChangeTheme('dark')}
            aria-pressed={theme === 'dark'}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded-xs transition-colors whitespace-nowrap shrink-0 ${
              theme === 'dark'
                ? 'bg-[#ff4d00] text-[#111113] font-bold'
                : 'text-[var(--v-ink-dim)] hover:text-[var(--v-ink)]'
            }`}
          >
            <Moon className="w-3.5 h-3.5" />
            Dark
          </button>
        </div>
      </div>
    </div>
  );
}
