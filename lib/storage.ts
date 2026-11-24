import {
  AlertDispatchLog,
  AlertRule,
  ComplianceState,
  ExternalApiConfig,
  FindingRecord,
  KeywordGroup,
  SearchHistoryEntry,
} from './types';
import { DEFAULT_KEYWORD_GROUPS } from './dork-catalog';

const STORAGE_KEYS = {
  findings: 'vectorone_dsp_findings_v1',
  history: 'vectorone_dsp_history_v1',
  keywordGroups: 'vectorone_dsp_keyword_groups_v1',
  alertRules: 'vectorone_dsp_alert_rules_v1',
  alertLogs: 'vectorone_dsp_alert_logs_v1',
  externalApis: 'vectorone_dsp_external_apis_v1',
  compliance: 'vectorone_dsp_compliance_v1',
  hideHowToStartup: 'vectorone_dsp_howto_hide_v1',
};

function safeRead<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function safeWrite<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Failed to persist ${key}:`, err);
  }
}

export const INITIAL_EXTERNAL_APIS: ExternalApiConfig[] = [
  {
    id: 'ext-google-cse',
    providerName: 'Google Custom Search JSON API',
    providerType: 'Search API',
    endpointUrl: 'https://www.googleapis.com/customsearch/v1',
    method: 'GET',
    authHeaderName: 'X-Api-Key',
    authHeaderValue: '',
    queryParamKey: 'q',
    enabled: false,
    lastTestedAt: null,
    lastStatus: null,
  },
  {
    id: 'ext-webhook-siem',
    providerName: 'Outbound Security Webhook (SIEM / Slack)',
    providerType: 'Alert Webhook',
    endpointUrl: 'https://httpbin.org/post',
    method: 'POST',
    authHeaderName: 'Authorization',
    authHeaderValue: '',
    queryParamKey: 'payload',
    enabled: true,
    lastTestedAt: null,
    lastStatus: null,
  },
];

export function loadFindings(): FindingRecord[] {
  return safeRead<FindingRecord[]>(STORAGE_KEYS.findings, []);
}

export function saveFindings(records: FindingRecord[]): void {
  safeWrite(STORAGE_KEYS.findings, records);
}

export function loadHistory(): SearchHistoryEntry[] {
  return safeRead<SearchHistoryEntry[]>(STORAGE_KEYS.history, []);
}

export function saveHistory(entries: SearchHistoryEntry[]): void {
  safeWrite(STORAGE_KEYS.history, entries);
}

export function loadKeywordGroups(): KeywordGroup[] {
  return safeRead<KeywordGroup[]>(STORAGE_KEYS.keywordGroups, DEFAULT_KEYWORD_GROUPS);
}

export function saveKeywordGroups(groups: KeywordGroup[]): void {
  safeWrite(STORAGE_KEYS.keywordGroups, groups);
}

export function loadAlertRules(): AlertRule[] {
  return safeRead<AlertRule[]>(STORAGE_KEYS.alertRules, []);
}

export function saveAlertRules(rules: AlertRule[]): void {
  safeWrite(STORAGE_KEYS.alertRules, rules);
}

export function loadAlertLogs(): AlertDispatchLog[] {
  return safeRead<AlertDispatchLog[]>(STORAGE_KEYS.alertLogs, []);
}

export function saveAlertLogs(logs: AlertDispatchLog[]): void {
  safeWrite(STORAGE_KEYS.alertLogs, logs);
}

export function loadExternalApis(): ExternalApiConfig[] {
  return safeRead<ExternalApiConfig[]>(STORAGE_KEYS.externalApis, INITIAL_EXTERNAL_APIS);
}

export function saveExternalApis(configs: ExternalApiConfig[]): void {
  safeWrite(STORAGE_KEYS.externalApis, configs);
}

export function loadCompliance(): ComplianceState {
  return safeRead<ComplianceState>(STORAGE_KEYS.compliance, {
    acknowledged: false,
    acknowledgedAt: null,
    authorizedScopeNote: '',
  });
}

export function saveCompliance(state: ComplianceState): void {
  safeWrite(STORAGE_KEYS.compliance, state);
}

export function loadHideHowToOnStartup(): boolean {
  return safeRead<boolean>(STORAGE_KEYS.hideHowToStartup, false);
}

export function saveHideHowToOnStartup(hide: boolean): void {
  safeWrite(STORAGE_KEYS.hideHowToStartup, hide);
}

function escapeCsvCell(value: string | number | null | undefined): string {
  const str = String(value ?? '');
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function exportFindingsToCsv(findings: FindingRecord[]): string {
  const headers = [
    'ID',
    'Discovered At',
    'Rank Position',
    'Title',
    'URL',
    'Domain',
    'Platform',
    'Language',
    'Country',
    'Sensitivity Category',
    'Triage Status',
    'Query Used',
    'Dork ID',
    'Snippet',
    'Notes',
  ];
  const rows = findings.map((f) =>
    [
      f.id,
      f.discoveredAt,
      f.rankPosition ?? '',
      f.title,
      f.url,
      f.domain,
      f.platform,
      f.language ?? '',
      f.country ?? '',
      f.sensitivityCategory,
      f.triageStatus,
      f.queryUsed,
      f.dorkId ?? '',
      f.snippet,
      f.notes,
    ]
      .map(escapeCsvCell)
      .join(',')
  );
  return [headers.join(','), ...rows].join('\r\n');
}

export function exportHistoryToCsv(entries: SearchHistoryEntry[]): string {
  const headers = [
    'ID',
    'Timestamp',
    'Composed Query',
    'Platform',
    'Target Domain',
    'Language',
    'Country',
    'Date Range',
    'Result Position Range',
    'Sensitive Filters',
    'Result Count',
    'Execution Mode',
  ];
  const rows = entries.map((e) =>
    [
      e.id,
      e.timestamp,
      e.composedQuery,
      e.platform,
      e.targetDomain,
      e.language ?? 'Any',
      e.country ?? 'Global',
      e.dateRangeLabel ?? 'Any Time',
      e.positionRangeLabel ?? 'All Ranks',
      e.sensitiveFiltersApplied.join('; '),
      e.resultCount,
      e.executionMode,
    ]
      .map(escapeCsvCell)
      .join(',')
  );
  return [headers.join(','), ...rows].join('\r\n');
}

export function triggerFileDownload(
  content: string,
  filename: string,
  mimeType: string
): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
