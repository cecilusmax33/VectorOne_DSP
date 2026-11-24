'use client';

import React, { useState } from 'react';
import {
  CheckCircle2,
  LogOut,
  Mail,
  Plus,
  Send,
  Trash2,
  Webhook,
} from 'lucide-react';
import {
  AlertDispatchLog,
  AlertRule,
  ExternalApiConfig,
  FindingRecord,
} from '@/lib/types';

interface AlertsIntegrationsViewProps {
  gmailUserEmail: string | null;
  needsGmailAuth: boolean;
  isLoggingIn: boolean;
  onGmailSignIn: () => void;
  onGmailLogout: () => void;
  alertRules: AlertRule[];
  onAddAlertRule: (rule: Omit<AlertRule, 'id' | 'lastTriggeredAt'>) => void;
  onToggleAlertRule: (id: string) => void;
  onDeleteAlertRule: (id: string) => void;
  onTriggerAlertDigest: (rule: AlertRule) => void;
  alertLogs: AlertDispatchLog[];
  findingsCount: number;
  defaultQuery: string;
  defaultDomain: string;
  externalApis: ExternalApiConfig[];
  onAddExternalApi: (config: Omit<ExternalApiConfig, 'id' | 'lastTestedAt' | 'lastStatus'>) => void;
  onToggleExternalApi: (id: string) => void;
  onDeleteExternalApi: (id: string) => void;
  onTestExternalApi: (config: ExternalApiConfig) => Promise<void>;
  onSendWebhookFindings: (config: ExternalApiConfig, findings: FindingRecord[]) => Promise<void>;
  findings: FindingRecord[];
}

export default function AlertsIntegrationsView({
  gmailUserEmail,
  needsGmailAuth,
  isLoggingIn,
  onGmailSignIn,
  onGmailLogout,
  alertRules,
  onAddAlertRule,
  onToggleAlertRule,
  onDeleteAlertRule,
  onTriggerAlertDigest,
  alertLogs,
  findingsCount,
  defaultQuery,
  defaultDomain,
  externalApis,
  onAddExternalApi,
  onToggleExternalApi,
  onDeleteExternalApi,
  onTestExternalApi,
  onSendWebhookFindings,
  findings,
}: AlertsIntegrationsViewProps) {
  const [ruleName, setRuleName] = useState('');
  const [ruleQuery, setRuleQuery] = useState(defaultQuery);
  const [ruleDomain, setRuleDomain] = useState(defaultDomain);
  const [ruleRecipient, setRuleRecipient] = useState(gmailUserEmail || '');
  const [ruleThreshold, setRuleThreshold] = useState(1);
  const [ruleCadence, setRuleCadence] =
    useState<AlertRule['cadenceLabel']>('On Demand');

  const [apiName, setApiName] = useState('');
  const [apiType, setApiType] =
    useState<ExternalApiConfig['providerType']>('Search API');
  const [apiUrl, setApiUrl] = useState('');
  const [apiMethod, setApiMethod] = useState<'GET' | 'POST'>('GET');
  const [apiAuthHeader, setApiAuthHeader] = useState('Authorization');
  const [apiAuthValue, setApiAuthValue] = useState('');
  const [apiQueryParam, setApiQueryParam] = useState('q');
  const [testingId, setTestingId] = useState<string | null>(null);

  const handleCreateRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ruleName.trim() || !ruleRecipient.trim()) return;
    onAddAlertRule({
      name: ruleName.trim(),
      query: ruleQuery.trim() || defaultQuery || 'site:example.com',
      domainScope: ruleDomain.trim() || defaultDomain || 'Global',
      recipientEmail: ruleRecipient.trim(),
      minFindingsThreshold: Math.max(1, Number(ruleThreshold) || 1),
      cadenceLabel: ruleCadence,
      enabled: true,
    });
    setRuleName('');
  };

  const handleCreateExternalApi = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiName.trim() || !apiUrl.trim()) return;
    onAddExternalApi({
      providerName: apiName.trim(),
      providerType: apiType,
      endpointUrl: apiUrl.trim(),
      method: apiMethod,
      authHeaderName: apiAuthHeader.trim(),
      authHeaderValue: apiAuthValue.trim(),
      queryParamKey: apiQueryParam.trim() || 'q',
      enabled: true,
    });
    setApiName('');
    setApiUrl('');
    setApiAuthValue('');
  };

  return (
    <div className="col-span-full space-y-6">
      {/* Panel 1: Gmail OAuth Notification Alerts */}
      <div className="bg-[var(--v-surface)] border border-[var(--v-border)] border-t-[3px] border-t-[#ff4d00] divide-y divide-[var(--v-border)]">
        <div className="p-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-xl sm:text-2xl font-extrabold uppercase tracking-tight text-[var(--v-ink)]">
              Gmail Email Notification Alerts
            </h1>
            <p className="text-xs text-[var(--v-ink-dim)] mt-1">
              Connect your Google Workspace Gmail account to dispatch structured alert digests. Every outbound email requires your explicit confirmation.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {needsGmailAuth || !gmailUserEmail ? (
              <button
                type="button"
                onClick={onGmailSignIn}
                disabled={isLoggingIn}
                className="gsi-material-button"
              >
                <div className="gsi-material-button-state" />
                <div className="gsi-material-button-content-wrapper">
                  <div className="gsi-material-button-icon">
                    <svg
                      version="1.1"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 48 48"
                      style={{ display: 'block' }}
                    >
                      <path
                        fill="#EA4335"
                        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                      />
                      <path
                        fill="#4285F4"
                        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                      />
                      <path
                        fill="#34A853"
                        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                      />
                      <path fill="none" d="M0 0h48v48H0z" />
                    </svg>
                  </div>
                  <span className="gsi-material-button-contents">
                    {isLoggingIn ? 'Connecting...' : 'Sign in with Google'}
                  </span>
                </div>
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  Connected: {gmailUserEmail}
                </span>
                <button
                  type="button"
                  onClick={onGmailLogout}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-mono font-medium text-[var(--v-ink)] bg-[var(--v-bg)] border border-[var(--v-border)] rounded-xs hover:border-[#ff4d00] hover:text-[#ff4d00] transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Disconnect
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Create Alert Rule Form */}
        <form
          onSubmit={handleCreateRule}
          className="p-5 bg-[var(--v-bg)] grid grid-cols-1 md:grid-cols-12 gap-3 items-end"
        >
          <div className="md:col-span-3">
            <label className="block text-[11px] font-mono uppercase tracking-wider text-[var(--v-ink-dim)] mb-1">
              Alert Rule Name
            </label>
            <input
              type="text"
              required
              value={ruleName}
              onChange={(e) => setRuleName(e.target.value)}
              placeholder="e.g. Exposed PDF DLP Watch"
              className="w-full px-2.5 py-1.5 text-xs bg-[var(--v-surface)] border border-[var(--v-border)] rounded-xs text-[var(--v-ink)] placeholder:text-[var(--v-ink-dim)] focus:outline-none focus:border-[#ff4d00]"
            />
          </div>

          <div className="md:col-span-3">
            <label className="block text-[11px] font-mono uppercase tracking-wider text-[var(--v-ink-dim)] mb-1">
              Monitored Dork Query
            </label>
            <input
              type="text"
              value={ruleQuery}
              onChange={(e) => setRuleQuery(e.target.value)}
              placeholder="site:example.com filetype:pdf"
              className="w-full px-2.5 py-1.5 text-xs font-mono bg-[var(--v-surface)] border border-[var(--v-border)] rounded-xs text-[var(--v-ink)] placeholder:text-[var(--v-ink-dim)] focus:outline-none focus:border-[#ff4d00]"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-[11px] font-mono uppercase tracking-wider text-[var(--v-ink-dim)] mb-1">
              Recipient Email
            </label>
            <input
              type="email"
              required
              value={ruleRecipient}
              onChange={(e) => setRuleRecipient(e.target.value)}
              placeholder="security@example.com"
              className="w-full px-2.5 py-1.5 text-xs bg-[var(--v-surface)] border border-[var(--v-border)] rounded-xs text-[var(--v-ink)] placeholder:text-[var(--v-ink-dim)] focus:outline-none focus:border-[#ff4d00]"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-[11px] font-mono uppercase tracking-wider text-[var(--v-ink-dim)] mb-1">
              Cadence
            </label>
            <select
              value={ruleCadence}
              onChange={(e) =>
                setRuleCadence(e.target.value as AlertRule['cadenceLabel'])
              }
              className="w-full px-2 py-1.5 text-xs font-mono bg-[var(--v-surface)] border border-[var(--v-border)] rounded-xs text-[var(--v-ink)] focus:outline-none focus:border-[#ff4d00]"
            >
              <option value="On Demand">On Demand</option>
              <option value="Daily Digest">Daily Digest</option>
              <option value="Weekly Audit">Weekly Audit</option>
            </select>
          </div>

          <div className="md:col-span-2 flex items-end gap-2">
            <div className="w-16">
              <label className="block text-[11px] font-mono uppercase tracking-wider text-[var(--v-ink-dim)] mb-1">
                Min Hits
              </label>
              <input
                type="number"
                min={1}
                value={ruleThreshold}
                onChange={(e) => setRuleThreshold(Number(e.target.value) || 1)}
                className="w-full px-2 py-1.5 text-xs font-mono tabular-nums bg-[var(--v-surface)] border border-[var(--v-border)] rounded-xs text-[var(--v-ink)] focus:outline-none focus:border-[#ff4d00]"
              />
            </div>
            <button
              type="submit"
              className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-display font-extrabold uppercase tracking-tight bg-[#ff4d00] text-[#111113] rounded-xs hover:bg-[#ff621f] transition-colors whitespace-nowrap h-[30px]"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Rule
            </button>
          </div>
        </form>

        {/* Alert Rules Responsive 1/2/3-Column Grid */}
        <div className="p-5 bg-[var(--v-bg)]/40">
          {alertRules.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 items-stretch">
              {alertRules.map((rule) => (
                <article
                  key={rule.id}
                  className="min-w-0 bg-[var(--v-surface)] border border-[var(--v-border)] p-4 flex flex-col justify-between gap-3.5 hover:border-[#ff4d00]/70 transition-colors"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-semibold text-[var(--v-ink)] leading-snug">
                        {rule.name}
                      </h3>
                      <button
                        type="button"
                        onClick={() => onToggleAlertRule(rule.id)}
                        className={`text-[11px] font-mono font-semibold shrink-0 ${
                          rule.enabled
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-[var(--v-ink-dim)]'
                        }`}
                      >
                        {rule.enabled ? 'Active' : 'Paused'}
                      </button>
                    </div>

                    <div className="p-2.5 bg-[var(--v-bg)] border border-[var(--v-border)] rounded-xs font-mono text-[11px] text-[var(--v-ink-dim)] break-all">
                      {rule.query}
                    </div>

                    <div className="text-[11px] font-mono text-[var(--v-ink-dim)] space-y-0.5">
                      <div className="truncate text-[var(--v-ink)]">
                        To: {rule.recipientEmail}
                      </div>
                      <div>
                        {rule.cadenceLabel} (≥{rule.minFindingsThreshold} hit)
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-3 border-t border-[var(--v-border)]">
                    <button
                      type="button"
                      onClick={() => onTriggerAlertDigest(rule)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-mono font-bold bg-[#ff4d00] text-[#111113] rounded-xs hover:bg-[#ff621f] transition-colors whitespace-nowrap"
                    >
                      <Mail className="w-3 h-3" />
                      Send Digest ({findingsCount})
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteAlertRule(rule.id)}
                      aria-label={`Delete alert rule ${rule.name}`}
                      className="p-1.5 text-[var(--v-ink-dim)] hover:text-red-600 dark:hover:text-red-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-xs font-mono text-[var(--v-ink-dim)]">
              No email alert rules configured yet. Create a rule above to send findings digests via Gmail.
            </div>
          )}
        </div>

        {/* Alert Dispatch Log */}
        {alertLogs.length > 0 && (
          <div className="p-5 bg-[var(--v-bg)] space-y-3">
            <h3 className="text-[11px] font-mono uppercase tracking-wider font-bold text-[var(--v-ink)]">
              Gmail Dispatch History
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {alertLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 border border-[var(--v-border)] bg-[var(--v-surface)] flex flex-col justify-between gap-1.5 text-xs min-w-0"
                >
                  <div>
                    <div className="font-medium text-[var(--v-ink)] truncate">
                      {log.ruleName}
                    </div>
                    <div className="font-mono text-[11px] text-[var(--v-ink-dim)] truncate">
                      → {log.recipientEmail} ({log.findingsCount} findings)
                    </div>
                  </div>
                  <div className="font-mono text-[11px] tabular-nums text-[var(--v-ink-dim)] flex items-center justify-between gap-2">
                    <span
                      className={
                        log.status === 'Sent'
                          ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                          : 'text-red-700 dark:text-red-400 font-semibold'
                      }
                    >
                      {log.status}
                    </span>
                    <span>{new Date(log.sentAt).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Panel 2: External Service API & Webhook Integrations */}
      <div className="bg-[var(--v-surface)] border border-[var(--v-border)] divide-y divide-[var(--v-border)]">
        <div className="p-6">
          <h2 className="font-display text-lg font-extrabold uppercase tracking-tight text-[var(--v-ink)] flex items-center gap-2">
            <Webhook className="w-4 h-4 text-[#ff4d00]" />
            External Search APIs &amp; Outbound Webhook Connectors
          </h2>
          <p className="text-xs text-[var(--v-ink-dim)] mt-1">
            Integrate external REST search services (e.g., Google Custom Search JSON API, Bing Web Search API) or outbound SIEM/Slack webhooks via the server-side proxy.
          </p>
        </div>

        <form
          onSubmit={handleCreateExternalApi}
          className="p-5 bg-[var(--v-bg)] grid grid-cols-1 md:grid-cols-12 gap-3 items-end"
        >
          <div className="md:col-span-3">
            <label className="block text-[11px] font-mono uppercase tracking-wider text-[var(--v-ink-dim)] mb-1">
              Provider Name
            </label>
            <input
              type="text"
              required
              value={apiName}
              onChange={(e) => setApiName(e.target.value)}
              placeholder="e.g. SerpAPI / Slack SIEM"
              className="w-full px-2.5 py-1.5 text-xs bg-[var(--v-surface)] border border-[var(--v-border)] rounded-xs text-[var(--v-ink)] placeholder:text-[var(--v-ink-dim)] focus:outline-none focus:border-[#ff4d00]"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-[11px] font-mono uppercase tracking-wider text-[var(--v-ink-dim)] mb-1">
              Type &amp; Method
            </label>
            <div className="flex gap-1">
              <select
                value={apiType}
                onChange={(e) =>
                  setApiType(e.target.value as ExternalApiConfig['providerType'])
                }
                className="flex-1 px-2 py-1.5 text-xs font-mono bg-[var(--v-surface)] border border-[var(--v-border)] rounded-xs text-[var(--v-ink)] focus:outline-none focus:border-[#ff4d00]"
              >
                <option value="Search API">Search API</option>
                <option value="Alert Webhook">Webhook</option>
              </select>
              <select
                value={apiMethod}
                onChange={(e) => setApiMethod(e.target.value as 'GET' | 'POST')}
                className="w-16 px-1.5 py-1.5 text-xs font-mono bg-[var(--v-surface)] border border-[var(--v-border)] rounded-xs text-[var(--v-ink)] focus:outline-none focus:border-[#ff4d00]"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
              </select>
            </div>
          </div>

          <div className="md:col-span-3">
            <label className="block text-[11px] font-mono uppercase tracking-wider text-[var(--v-ink-dim)] mb-1">
              Endpoint URL (HTTPS)
            </label>
            <input
              type="url"
              required
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              placeholder="https://api.example.com/search"
              className="w-full px-2.5 py-1.5 text-xs font-mono bg-[var(--v-surface)] border border-[var(--v-border)] rounded-xs text-[var(--v-ink)] placeholder:text-[var(--v-ink-dim)] focus:outline-none focus:border-[#ff4d00]"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-[11px] font-mono uppercase tracking-wider text-[var(--v-ink-dim)] mb-1">
              Header Name / Query Key
            </label>
            <div className="flex gap-1">
              <input
                type="text"
                value={apiAuthHeader}
                onChange={(e) => setApiAuthHeader(e.target.value)}
                placeholder="Authorization"
                className="w-2/3 px-2 py-1.5 text-xs font-mono bg-[var(--v-surface)] border border-[var(--v-border)] rounded-xs text-[var(--v-ink)] placeholder:text-[var(--v-ink-dim)] focus:outline-none focus:border-[#ff4d00]"
              />
              <input
                type="text"
                value={apiQueryParam}
                onChange={(e) => setApiQueryParam(e.target.value)}
                placeholder="q"
                className="w-1/3 px-2 py-1.5 text-xs font-mono bg-[var(--v-surface)] border border-[var(--v-border)] rounded-xs text-[var(--v-ink)] placeholder:text-[var(--v-ink-dim)] focus:outline-none focus:border-[#ff4d00]"
              />
            </div>
          </div>

          <div className="md:col-span-2 flex gap-1.5">
            <input
              type="password"
              value={apiAuthValue}
              onChange={(e) => setApiAuthValue(e.target.value)}
              placeholder="Bearer / Token"
              className="flex-1 min-w-0 px-2 py-1.5 text-xs font-mono bg-[var(--v-surface)] border border-[var(--v-border)] rounded-xs text-[var(--v-ink)] placeholder:text-[var(--v-ink-dim)] focus:outline-none focus:border-[#ff4d00]"
            />
            <button
              type="submit"
              className="px-3 py-1.5 text-xs font-display font-extrabold uppercase tracking-tight bg-[#ff4d00] text-[#111113] rounded-xs hover:bg-[#ff621f] transition-colors whitespace-nowrap"
            >
              Add
            </button>
          </div>
        </form>

        <div className="p-5 bg-[var(--v-bg)]/40">
          {externalApis.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 items-stretch">
              {externalApis.map((api) => (
                <article
                  key={api.id}
                  className="min-w-0 bg-[var(--v-surface)] border border-[var(--v-border)] p-4 flex flex-col justify-between gap-3.5 hover:border-[#ff4d00]/70 transition-colors"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2 text-xs">
                      <span className="font-semibold text-[var(--v-ink)]">
                        {api.providerName}
                      </span>
                      <button
                        type="button"
                        onClick={() => onToggleExternalApi(api.id)}
                        className={`px-2 py-0.5 text-[10px] font-mono font-medium border rounded-xs shrink-0 ${
                          api.enabled
                            ? 'border-emerald-500/40 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10'
                            : 'border-[var(--v-border)] text-[var(--v-ink-dim)] bg-[var(--v-bg)]'
                        }`}
                      >
                        {api.enabled ? 'Enabled' : 'Disabled'}
                      </button>
                    </div>

                    <div className="text-[11px] font-mono text-[var(--v-ink-dim)]">
                      {api.providerType} · {api.method}
                      {api.lastStatus ? (
                        <span className="text-[#ff4d00] ml-1.5">
                          · Last: {api.lastStatus}
                        </span>
                      ) : null}
                    </div>

                    <div className="p-2 bg-[var(--v-bg)] border border-[var(--v-border)] rounded-xs text-[11px] font-mono text-[var(--v-ink-dim)] break-all">
                      {api.endpointUrl}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-[var(--v-border)]">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <button
                        type="button"
                        disabled={testingId === api.id}
                        onClick={async () => {
                          setTestingId(api.id);
                          try {
                            await onTestExternalApi(api);
                          } finally {
                            setTestingId(null);
                          }
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-mono font-medium text-[var(--v-ink)] bg-[var(--v-bg)] border border-[var(--v-border)] rounded-xs hover:border-[#ff4d00] hover:text-[#ff4d00] transition-colors"
                      >
                        <Send className="w-3 h-3" />
                        {testingId === api.id ? 'Testing...' : 'Test Endpoint'}
                      </button>
                      {api.providerType === 'Alert Webhook' && findings.length > 0 && (
                        <button
                          type="button"
                          onClick={() => onSendWebhookFindings(api, findings)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-mono font-bold text-[#111113] bg-[#ff4d00] rounded-xs hover:bg-[#ff621f] transition-colors"
                        >
                          Push ({findings.length})
                        </button>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => onDeleteExternalApi(api.id)}
                      aria-label={`Delete connector ${api.providerName}`}
                      className="p-1 text-[var(--v-ink-dim)] hover:text-red-600 dark:hover:text-red-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-xs font-mono text-[var(--v-ink-dim)]">
              No external search APIs or outbound webhooks configured yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
