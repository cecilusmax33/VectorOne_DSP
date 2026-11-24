export type WorkspaceView =
  | 'dashboard'
  | 'workbench'
  | 'catalog'
  | 'database'
  | 'history'
  | 'alerts'
  | 'compliance'
  | 'help';

export type PlatformId =
  | 'google'
  | 'bing'
  | 'duckduckgo'
  | 'github'
  | 'shodan'
  | 'wayback';

export type SensitivityLevel =
  | 'Standard'
  | 'Sensitive-PII'
  | 'Config-Exposure'
  | 'Credential-Risk'
  | 'Regulated';

export type TriageStatus = 'New' | 'Reviewed' | 'Archived';

export type ExecutionMode =
  | 'Gemini Grounded'
  | 'External API'
  | 'Engine Launcher';

export type DatePreset =
  | 'any'
  | '24h'
  | '7d'
  | '30d'
  | '1y'
  | 'custom';

export type ResultPositionPreset =
  | 'all'
  | 'top10'
  | 'pos11_30'
  | 'pos31_50'
  | 'pos51_100'
  | 'custom';

export interface DorkCatalogEntry {
  id: string;
  name: string;
  category:
    | 'Public Document Audit'
    | 'Configuration & Environment'
    | 'Cloud & Storage Exposure'
    | 'Admin & Auth Surfaces'
    | 'API & Schema Discovery'
    | 'Error & Diagnostic Logs'
    | 'Subdomain & Staging'
    | 'Sensitive Data & DLP Compliance';
  operatorTemplate: string;
  whatItDoes: string;
  auditRationale: string;
  supportedPlatforms: PlatformId[];
  sensitivityLevel: SensitivityLevel;
  defaultFileTypes?: string[];
  defaultInUrl?: string;
  defaultInTitle?: string;
  defaultInText?: string;
  defaultKeywords?: string[];
  exampleQuery: string;
}

export interface KeywordGroup {
  id: string;
  name: string;
  keywords: string[];
}

export interface SensitiveDataFilter {
  id: string;
  label: string;
  category: SensitivityLevel;
  description: string;
  queryClause: string;
}

export interface SearchParameters {
  targetDomain: string;
  excludeSubdomains: boolean;
  excludeWww: boolean;
  pathPrefix: string;
  fileTypes: string[];
  inTitle: string;
  inUrl: string;
  inText: string;
  exactPhrase: string;
  excludeTerms: string;
  datePreset: DatePreset;
  dateAfter: string;
  dateBefore: string;
  resultPositionPreset: ResultPositionPreset;
  resultStartRank: number;
  resultEndRank: number;
  language: string;
  country: string;
  countryTldBoost: boolean;
  booleanMode: 'AND' | 'OR';
  activeKeywords: string[];
  activeSensitiveFilterIds: string[];
  customRawOverride: string;
  selectedPlatform: PlatformId;
  activeDorkId: string | null;
}

export interface FindingRecord {
  id: string;
  title: string;
  url: string;
  domain: string;
  snippet: string;
  queryUsed: string;
  dorkId: string | null;
  platform: PlatformId;
  sensitivityCategory: SensitivityLevel;
  triageStatus: TriageStatus;
  notes: string;
  discoveredAt: string;
  rankPosition?: number;
  language?: string;
  country?: string;
}

export interface SearchHistoryEntry {
  id: string;
  timestamp: string;
  composedQuery: string;
  platform: PlatformId;
  targetDomain: string;
  sensitiveFiltersApplied: string[];
  resultCount: number;
  executionMode: ExecutionMode;
  language?: string;
  country?: string;
  dateRangeLabel?: string;
  positionRangeLabel?: string;
  notes?: string;
}

export interface AlertRule {
  id: string;
  name: string;
  query: string;
  domainScope: string;
  recipientEmail: string;
  minFindingsThreshold: number;
  cadenceLabel: 'On Demand' | 'Daily Digest' | 'Weekly Audit';
  enabled: boolean;
  lastTriggeredAt: string | null;
}

export interface AlertDispatchLog {
  id: string;
  ruleId: string | null;
  ruleName: string;
  recipientEmail: string;
  subject: string;
  findingsCount: number;
  sentAt: string;
  messageId: string;
  status: 'Sent' | 'Failed';
  errorDetail?: string;
}

export interface ExternalApiConfig {
  id: string;
  providerName: string;
  providerType: 'Search API' | 'Alert Webhook';
  endpointUrl: string;
  method: 'GET' | 'POST';
  authHeaderName: string;
  authHeaderValue: string;
  queryParamKey: string;
  enabled: boolean;
  lastTestedAt: string | null;
  lastStatus: string | null;
}

export interface ComplianceState {
  acknowledged: boolean;
  acknowledgedAt: string | null;
  authorizedScopeNote: string;
}
