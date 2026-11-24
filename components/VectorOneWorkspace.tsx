'use client';

import React, { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { motion } from 'motion/react';
import { ArrowUp, X } from 'lucide-react';
import {
  composeDorkQuery,
  DEFAULT_SEARCH_PARAMETERS,
  DORK_CATALOG,
  extractDomainFromUrl,
  resolveDateBounds,
  resolvePositionWindow,
  SENSITIVE_DATA_FILTERS,
} from '@/lib/dork-catalog';
import {
  exportFindingsToCsv,
  exportHistoryToCsv,
  loadAlertLogs,
  loadAlertRules,
  loadCompliance,
  loadExternalApis,
  loadFindings,
  loadHideHowToOnStartup,
  loadHistory,
  loadKeywordGroups,
  saveAlertLogs,
  saveAlertRules,
  saveCompliance,
  saveExternalApis,
  saveFindings,
  saveHideHowToOnStartup,
  saveHistory,
  saveKeywordGroups,
  triggerFileDownload,
} from '@/lib/storage';
import {
  getCachedGmailToken,
  googleSignInForGmail,
  initGmailAuth,
  logoutGmail,
  sendGmailAlert,
} from '@/lib/gmail-auth';
import {
  AlertDispatchLog,
  AlertRule,
  ComplianceState,
  DorkCatalogEntry,
  ExternalApiConfig,
  FindingRecord,
  KeywordGroup,
  PlatformId,
  SearchHistoryEntry,
  SearchParameters,
  SensitivityLevel,
  TriageStatus,
  WorkspaceView,
} from '@/lib/types';
import SidebarPanel from './SidebarPanel';
import TopHeader from './TopHeader';
import DashboardView from './DashboardView';
import QueryWorkbench, { LiveSearchResultItem } from './QueryWorkbench';
import DorkCatalogView from './DorkCatalogView';
import FindingsDatabaseView from './FindingsDatabaseView';
import SearchHistoryView from './SearchHistoryView';
import AlertsIntegrationsView from './AlertsIntegrationsView';
import ComplianceView from './ComplianceView';
import HelpView from './HelpView';
import CheatSheetDrawer from './CheatSheetDrawer';
import ComplianceModal from './ComplianceModal';
import GmailConfirmModal from './GmailConfirmModal';
import KeyboardShortcutsModal from './KeyboardShortcutsModal';
import ExportFindingsModal, { ExportFormat } from './ExportFindingsModal';
import HowToUseModal from './HowToUseModal';

interface PendingGmailDispatch {
  ruleId: string | null;
  ruleName: string;
  recipientEmail: string;
  subject: string;
  bodyText: string;
  findingsCount: number;
}

const THEME_STORAGE_KEY = 'vectorone_dsp_theme_v1';
const subscribeNoop = () => () => {};

export default function VectorOneWorkspace() {
  const hydrated = useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false
  );
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') return 'dark';
    try {
      const saved = window.localStorage.getItem(THEME_STORAGE_KEY);
      return saved === 'light' ? 'light' : 'dark';
    } catch {
      return 'dark';
    }
  });
  const [activeView, setActiveView] = useState<WorkspaceView>('workbench');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [cheatSheetOpen, setCheatSheetOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportPreselectedIds, setExportPreselectedIds] = useState<string[]>(
    []
  );
  const [hideHowToOnStartup, setHideHowToOnStartup] = useState<boolean>(() =>
    loadHideHowToOnStartup()
  );
  const [howToDismissedThisSession, setHowToDismissedThisSession] =
    useState(false);
  const [howToManualOpen, setHowToManualOpen] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Storage unavailable
    }
  }, [theme]);

  const [params, setParams] = useState<SearchParameters>(
    DEFAULT_SEARCH_PARAMETERS
  );
  const [keywordGroups, setKeywordGroups] = useState<KeywordGroup[]>(() =>
    loadKeywordGroups()
  );
  const [findings, setFindings] = useState<FindingRecord[]>(() =>
    loadFindings()
  );
  const [history, setHistory] = useState<SearchHistoryEntry[]>(() =>
    loadHistory()
  );
  const [alertRules, setAlertRules] = useState<AlertRule[]>(() =>
    loadAlertRules()
  );
  const [alertLogs, setAlertLogs] = useState<AlertDispatchLog[]>(() =>
    loadAlertLogs()
  );
  const [externalApis, setExternalApis] = useState<ExternalApiConfig[]>(() =>
    loadExternalApis()
  );
  const [compliance, setCompliance] = useState<ComplianceState>(() =>
    loadCompliance()
  );

  // Live search state
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [liveSummary, setLiveSummary] = useState('');
  const [liveResults, setLiveResults] = useState<LiveSearchResultItem[]>([]);
  const [executedQueries, setExecutedQueries] = useState<string[]>([]);

  // External API runtime output
  const [isRunningExternalApi, setIsRunningExternalApi] = useState(false);
  const [externalApiOutput, setExternalApiOutput] = useState<{
    provider: string;
    status: number;
    body: string;
  } | null>(null);

  // Gmail Auth state
  const [gmailUserEmail, setGmailUserEmail] = useState<string | null>(null);
  const [needsGmailAuth, setNeedsGmailAuth] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [pendingGmail, setPendingGmail] = useState<PendingGmailDispatch | null>(
    null
  );
  const [isSendingGmail, setIsSendingGmail] = useState(false);

  // Toast notice
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const mainScrollRef = useRef<HTMLElement | null>(null);
  const queryInputRef = useRef<HTMLTextAreaElement | null>(null);

  const scrollMainToTop = useCallback(() => {
    const el = mainScrollRef.current;
    if (!el) return;
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollTo({
      top: 0,
      behavior: prefersReduced ? 'auto' : 'smooth',
    });
  }, []);

  const handleSelectView = useCallback(
    (view: WorkspaceView) => {
      setActiveView(view);
      requestAnimationFrame(() => scrollMainToTop());
    },
    [scrollMainToTop]
  );

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3200);
  }, []);



  // Initialize Gmail Firebase Auth listener
  useEffect(() => {
    const unsubscribe = initGmailAuth(
      (user) => {
        setGmailUserEmail(user.email || 'Connected Account');
        setNeedsGmailAuth(false);
      },
      () => {
        setGmailUserEmail(null);
        setNeedsGmailAuth(true);
      }
    );
    return () => unsubscribe();
  }, []);

  const createId = () =>
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const inferSensitivity = useCallback((): SensitivityLevel => {
    if (params.activeSensitiveFilterIds.length > 0) {
      const first = SENSITIVE_DATA_FILTERS.find(
        (f) => f.id === params.activeSensitiveFilterIds[0]
      );
      if (first) return first.category;
    }
    if (params.activeDorkId) {
      const dork = DORK_CATALOG.find((d) => d.id === params.activeDorkId);
      if (dork) return dork.sensitivityLevel;
    }
    return 'Standard';
  }, [params.activeSensitiveFilterIds, params.activeDorkId]);

  const appendHistory = useCallback(
    (
      composedQuery: string,
      platform: PlatformId,
      resultCount: number,
      executionMode: SearchHistoryEntry['executionMode']
    ) => {
      const dateBounds = resolveDateBounds(params);
      const posWindow = resolvePositionWindow(params);
      const sensitiveLabels = params.activeSensitiveFilterIds
        .map((id) => SENSITIVE_DATA_FILTERS.find((f) => f.id === id)?.label)
        .filter((v): v is string => Boolean(v));

      const entry: SearchHistoryEntry = {
        id: createId(),
        timestamp: new Date().toISOString(),
        composedQuery,
        platform,
        targetDomain: params.targetDomain.trim(),
        sensitiveFiltersApplied: sensitiveLabels,
        resultCount,
        executionMode,
        language: params.language || undefined,
        country: params.country || undefined,
        dateRangeLabel: dateBounds.label,
        positionRangeLabel: posWindow.label,
      };
      setHistory((prev) => {
        const next = [entry, ...prev].slice(0, 500);
        saveHistory(next);
        return next;
      });
    },
    [params]
  );

  // Run automated Gemini Search Grounding query
  const handleRunAutomatedSearch = async (override?: {
    query?: string;
    platform?: PlatformId;
  }) => {
    const targetPlatform = override?.platform ?? params.selectedPlatform;
    const query = (override?.query ?? composeDorkQuery(params)).trim();
    if (!query) {
      showToast('Enter a target domain, keyword, or raw query first.');
      return;
    }

    setActiveView('workbench');
    setIsSearching(true);
    setSearchError(null);

    const dateBounds = resolveDateBounds(params);
    const posWindow = resolvePositionWindow(params);
    const sensitiveLabels = params.activeSensitiveFilterIds
      .map((id) => SENSITIVE_DATA_FILTERS.find((f) => f.id === id)?.label)
      .filter((v): v is string => Boolean(v));

    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          platform: targetPlatform,
          targetDomain: params.targetDomain.trim(),
          language: params.language,
          country: params.country,
          dateAfter: dateBounds.after,
          dateBefore: dateBounds.before,
          resultStartRank: posWindow.start,
          resultEndRank: posWindow.end,
          sensitiveFilters: sensitiveLabels,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || `Search failed with status ${res.status}`);
      }

      const existingUrls = new Set(findings.map((f) => f.url));
      const mappedResults: LiveSearchResultItem[] = (data.findings || []).map(
        (item: LiveSearchResultItem) => ({
          ...item,
          saved: existingUrls.has(item.url),
        })
      );

      setLiveSummary(data.summary || '');
      setLiveResults(mappedResults);
      setExecutedQueries(data.executedSearchQueries || []);
      appendHistory(
        query,
        targetPlatform,
        mappedResults.length,
        'Gemini Grounded'
      );
      showToast(`Retrieved ${mappedResults.length} grounded result(s).`);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Automated search failed.';
      setSearchError(msg);
      appendHistory(query, targetPlatform, 0, 'Gemini Grounded');
    } finally {
      setIsSearching(false);
    }
  };

  const handleCloseHowTo = useCallback(() => {
    setHowToManualOpen(false);
    setHowToDismissedThisSession(true);
  }, []);

  const handleToggleDontShowHowTo = useCallback((hide: boolean) => {
    setHideHowToOnStartup(hide);
    saveHideHowToOnStartup(hide);
  }, []);

  const handleRunQuickSearchFromPopup = (
    query: string,
    platform: PlatformId
  ) => {
    setParams((prev) => ({
      ...prev,
      selectedPlatform: platform,
      customRawOverride: query,
    }));
    handleCloseHowTo();
    void handleRunAutomatedSearch({ query, platform });
  };

  const handleLoadQuickQueryFromPopup = (
    query: string,
    platform: PlatformId
  ) => {
    setParams((prev) => ({
      ...prev,
      selectedPlatform: platform,
      customRawOverride: query,
    }));
    handleCloseHowTo();
    handleSelectView('workbench');
    requestAnimationFrame(() => {
      setTimeout(() => {
        queryInputRef.current?.focus();
      }, 40);
    });
    showToast('Loaded Quick Search Query into Query Workbench.');
  };

  const handleSaveFinding = (item: LiveSearchResultItem) => {
    const query = composeDorkQuery(params);
    if (findings.some((f) => f.url === item.url && f.queryUsed === query)) {
      showToast('Finding already exists in the database.');
      return;
    }

    const record: FindingRecord = {
      id: createId(),
      title: item.title,
      url: item.url,
      domain: item.domain || extractDomainFromUrl(item.url),
      snippet: item.snippet,
      queryUsed: query,
      dorkId: params.activeDorkId,
      platform: params.selectedPlatform,
      sensitivityCategory: inferSensitivity(),
      triageStatus: 'New',
      notes: '',
      discoveredAt: new Date().toISOString(),
      rankPosition: item.rankPosition,
      language: params.language || undefined,
      country: params.country || undefined,
    };

    setFindings((prev) => {
      const next = [record, ...prev];
      saveFindings(next);
      return next;
    });

    setLiveResults((prev) =>
      prev.map((r) => (r.url === item.url ? { ...r, saved: true } : r))
    );
    showToast('Saved finding to local database.');
  };

  const handleSaveAllFindings = () => {
    const query = composeDorkQuery(params);
    const existingKeys = new Set(
      findings.map((f) => `${f.url}::${f.queryUsed}`)
    );
    const newRecords: FindingRecord[] = [];
    for (const item of liveResults) {
      const key = `${item.url}::${query}`;
      if (!existingKeys.has(key)) {
        existingKeys.add(key);
        newRecords.push({
          id: createId(),
          title: item.title,
          url: item.url,
          domain: item.domain || extractDomainFromUrl(item.url),
          snippet: item.snippet,
          queryUsed: query,
          dorkId: params.activeDorkId,
          platform: params.selectedPlatform,
          sensitivityCategory: inferSensitivity(),
          triageStatus: 'New',
          notes: '',
          discoveredAt: new Date().toISOString(),
          rankPosition: item.rankPosition,
          language: params.language || undefined,
          country: params.country || undefined,
        });
      }
    }

    if (newRecords.length === 0) {
      showToast('All live results are already saved.');
      return;
    }

    setFindings((prev) => {
      const next = [...newRecords, ...prev];
      saveFindings(next);
      return next;
    });
    setLiveResults((prev) => prev.map((r) => ({ ...r, saved: true })));
    showToast(`Saved ${newRecords.length} finding(s) to database.`);
  };

  const handleLoadDork = (dork: DorkCatalogEntry) => {
    setParams((prev) => {
      const domain = prev.targetDomain.trim();
      if (!domain) {
        const domainKw = 'example';
        return {
          ...prev,
          activeDorkId: dork.id,
          selectedPlatform: dork.supportedPlatforms[0] ?? 'google',
          fileTypes: dork.defaultFileTypes ?? [],
          inUrl: dork.defaultInUrl ?? '',
          inTitle: dork.defaultInTitle ?? '',
          inText: dork.defaultInText ?? '',
          activeKeywords: dork.defaultKeywords ?? [],
          customRawOverride: dork.operatorTemplate
            .replace(/\{domain\}/g, 'example.com')
            .replace(/\{domain_keyword\}/g, domainKw),
        };
      }
      const domainKw = domain.split('.')[0] || domain;
      return {
        ...prev,
        activeDorkId: dork.id,
        selectedPlatform: dork.supportedPlatforms[0] ?? 'google',
        fileTypes: dork.defaultFileTypes ?? [],
        inUrl: dork.defaultInUrl ?? '',
        inTitle: dork.defaultInTitle ?? '',
        inText: dork.defaultInText ?? '',
        activeKeywords: dork.defaultKeywords ?? [],
        customRawOverride: dork.operatorTemplate
          .replace(/\{domain\}/g, domain)
          .replace(/\{domain_keyword\}/g, domainKw),
      };
    });
    setActiveView('workbench');
    showToast(`Loaded "${dork.name}" into Query Workbench.`);
  };

  const handleInsertOperatorSnippet = (snippet: string) => {
    setParams((prev) => {
      const current =
        prev.customRawOverride !== ''
          ? prev.customRawOverride
          : composeDorkQuery(prev);
      const nextRaw = current ? `${current} ${snippet}` : snippet;
      return {
        ...prev,
        customRawOverride: nextRaw,
      };
    });
    setActiveView('workbench');
    showToast(`Inserted "${snippet}" into query.`);
  };

  // Keyword group handlers
  const handleAddKeyword = (groupId: string, keyword: string) => {
    setKeywordGroups((prev) => {
      const next = prev.map((g) =>
        g.id === groupId && !g.keywords.includes(keyword)
          ? { ...g, keywords: [...g.keywords, keyword] }
          : g
      );
      saveKeywordGroups(next);
      return next;
    });
  };

  const handleRemoveKeyword = (groupId: string, keyword: string) => {
    setKeywordGroups((prev) => {
      const next = prev.map((g) =>
        g.id === groupId
          ? { ...g, keywords: g.keywords.filter((k) => k !== keyword) }
          : g
      );
      saveKeywordGroups(next);
      return next;
    });
    setParams((prev) => ({
      ...prev,
      activeKeywords: prev.activeKeywords.filter((k) => k !== keyword),
    }));
  };

  const handleCreateKeywordGroup = (name: string) => {
    const newGroup: KeywordGroup = {
      id: createId(),
      name,
      keywords: [],
    };
    setKeywordGroups((prev) => {
      const next = [...prev, newGroup];
      saveKeywordGroups(next);
      return next;
    });
    showToast(`Created keyword group "${name}".`);
  };

  // External API proxy execution
  const handleRunExternalApi = async (
    config: ExternalApiConfig,
    query: string
  ) => {
    setIsRunningExternalApi(true);
    setExternalApiOutput(null);
    try {
      const res = await fetch('/api/integrations/proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpointUrl: config.endpointUrl,
          method: config.method,
          authHeaderName: config.authHeaderName,
          authHeaderValue: config.authHeaderValue,
          queryParamKey: config.queryParamKey,
          queryValue: query,
          payload:
            config.method === 'POST'
              ? {
                  source: 'VectorOne_DSP',
                  query,
                  domain: params.targetDomain,
                  timestamp: new Date().toISOString(),
                }
              : undefined,
        }),
      });
      const data = await res.json();
      const formatted =
        typeof data.data === 'string'
          ? data.data
          : JSON.stringify(data.data ?? data, null, 2);

      setExternalApiOutput({
        provider: config.providerName,
        status: data.status ?? res.status,
        body: formatted,
      });

      setExternalApis((prev) => {
        const next = prev.map((a) =>
          a.id === config.id
            ? {
                ...a,
                lastTestedAt: new Date().toISOString(),
                lastStatus: `HTTP ${data.status ?? res.status}`,
              }
            : a
        );
        saveExternalApis(next);
        return next;
      });

      if (config.providerType === 'Search API') {
        appendHistory(query, params.selectedPlatform, 0, 'External API');
      }
      showToast(`${config.providerName} responded (HTTP ${data.status ?? res.status}).`);
    } catch (err: unknown) {
      showToast(
        err instanceof Error ? err.message : 'External API request failed.'
      );
    } finally {
      setIsRunningExternalApi(false);
    }
  };

  // Gmail OAuth & Explicit Confirmation Dispatch
  const handleGmailSignIn = async () => {
    setIsLoggingIn(true);
    try {
      const res = await googleSignInForGmail();
      if (res) {
        setGmailUserEmail(res.user.email || 'Connected Account');
        setNeedsGmailAuth(false);
        showToast(`Connected Gmail (${res.user.email}).`);
      }
    } catch (err: unknown) {
      showToast(
        err instanceof Error ? err.message : 'Google sign-in failed.'
      );
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleGmailLogout = async () => {
    await logoutGmail();
    setGmailUserEmail(null);
    setNeedsGmailAuth(true);
    showToast('Disconnected Gmail account.');
  };

  const prepareGmailDigest = (opts: {
    ruleId: string | null;
    ruleName: string;
    recipientEmail: string;
    query: string;
    digestFindings: { title: string; url: string; domain: string }[];
  }) => {
    const token = getCachedGmailToken();
    if (!token || needsGmailAuth) {
      setActiveView('alerts');
      showToast('Please sign in with Google in Alerts & APIs to send Gmail notifications.');
      return;
    }

    const recipient = opts.recipientEmail || gmailUserEmail || '';
    if (!recipient) {
      setActiveView('alerts');
      showToast('Specify a recipient email address first.');
      return;
    }

    const lines = [
      `VectorOne_DSP Automated Alert Digest`,
      `Rule: ${opts.ruleName}`,
      `Query: ${opts.query || 'Multiple saved queries'}`,
      `Generated: ${new Date().toISOString()}`,
      `Total Findings Included: ${opts.digestFindings.length}`,
      ``,
      `--- FINDINGS SUMMARY ---`,
      ...opts.digestFindings.slice(0, 25).map(
        (f, idx) =>
          `${idx + 1}. ${f.title}\n   Domain: ${f.domain}\n   URL: ${f.url}`
      ),
      ``,
      `Disclaimer: VectorOne_DSP is for authorized security and compliance auditing only. Catalyst Vector AIA and its developers take no responsibility for user misuse.`,
    ];

    setPendingGmail({
      ruleId: opts.ruleId,
      ruleName: opts.ruleName,
      recipientEmail: recipient,
      subject: `[VectorOne_DSP Alert] ${opts.ruleName} (${opts.digestFindings.length} finding${opts.digestFindings.length === 1 ? '' : 's'})`,
      bodyText: lines.join('\n'),
      findingsCount: opts.digestFindings.length,
    });
  };

  const handleConfirmSendGmail = async () => {
    if (!pendingGmail) return;
    const token = getCachedGmailToken();
    if (!token) {
      setPendingGmail(null);
      setNeedsGmailAuth(true);
      showToast('Gmail session expired. Please sign in with Google again.');
      return;
    }

    setIsSendingGmail(true);
    try {
      const sent = await sendGmailAlert({
        accessToken: token,
        to: pendingGmail.recipientEmail,
        fromEmail: gmailUserEmail,
        subject: pendingGmail.subject,
        bodyText: pendingGmail.bodyText,
      });

      const log: AlertDispatchLog = {
        id: createId(),
        ruleId: pendingGmail.ruleId,
        ruleName: pendingGmail.ruleName,
        recipientEmail: pendingGmail.recipientEmail,
        subject: pendingGmail.subject,
        findingsCount: pendingGmail.findingsCount,
        sentAt: new Date().toISOString(),
        messageId: sent.id,
        status: 'Sent',
      };

      setAlertLogs((prev) => {
        const next = [log, ...prev];
        saveAlertLogs(next);
        return next;
      });

      if (pendingGmail.ruleId) {
        setAlertRules((prev) => {
          const next = prev.map((r) =>
            r.id === pendingGmail.ruleId
              ? { ...r, lastTriggeredAt: new Date().toISOString() }
              : r
          );
          saveAlertRules(next);
          return next;
        });
      }

      setPendingGmail(null);
      showToast(`Email alert sent via Gmail to ${pendingGmail.recipientEmail}.`);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Gmail send failed.';
      const log: AlertDispatchLog = {
        id: createId(),
        ruleId: pendingGmail.ruleId,
        ruleName: pendingGmail.ruleName,
        recipientEmail: pendingGmail.recipientEmail,
        subject: pendingGmail.subject,
        findingsCount: pendingGmail.findingsCount,
        sentAt: new Date().toISOString(),
        messageId: '-',
        status: 'Failed',
        errorDetail: errMsg,
      };
      setAlertLogs((prev) => {
        const next = [log, ...prev];
        saveAlertLogs(next);
        return next;
      });
      setPendingGmail(null);
      showToast(`Gmail dispatch failed: ${errMsg}`);
    } finally {
      setIsSendingGmail(false);
    }
  };

  const openExportModal = useCallback((preselectedIds?: string[]) => {
    setExportPreselectedIds(preselectedIds ?? []);
    setExportModalOpen(true);
  }, []);

  const handleDownloadSelectedFindings = useCallback(
    (
      selectedFindings: FindingRecord[],
      format: ExportFormat,
      filename: string
    ) => {
      if (selectedFindings.length === 0) return;
      if (format === 'csv') {
        const csv = exportFindingsToCsv(selectedFindings);
        triggerFileDownload(csv, filename, 'text/csv;charset=utf-8;');
        showToast(
          `Exported ${selectedFindings.length} finding(s) to CSV (${filename}).`
        );
      } else {
        triggerFileDownload(
          JSON.stringify(selectedFindings, null, 2),
          filename,
          'application/json'
        );
        showToast(
          `Exported ${selectedFindings.length} finding(s) to JSON (${filename}).`
        );
      }
      setExportModalOpen(false);
    },
    [showToast]
  );

  const handleExportCurrentCsv = () => {
    if (activeView === 'history') {
      const csv = exportHistoryToCsv(history);
      triggerFileDownload(
        csv,
        `vectorone_dsp_history_${new Date().toISOString().slice(0, 10)}.csv`,
        'text/csv;charset=utf-8;'
      );
      showToast(`Exported ${history.length} history row(s) to CSV.`);
    } else {
      openExportModal();
    }
  };

  const shortcutActionsRef = useRef<{
    complianceAcknowledged: boolean;
    hasLiveResults: boolean;
    isSearching: boolean;
    isSendingGmail: boolean;
    focusSearch: () => void;
    openDorkCatalog: () => void;
    saveFindingsAction: () => void;
    runAutomatedSearch: () => void;
    exportCsv: () => void;
    selectView: (view: WorkspaceView) => void;
    toggleCheatSheet: () => void;
    toggleShortcuts: () => void;
    closeOverlays: () => void;
  } | null>(null);

  useEffect(() => {
    shortcutActionsRef.current = {
      complianceAcknowledged: compliance.acknowledged,
      hasLiveResults: liveResults.length > 0,
      isSearching,
      isSendingGmail,
      focusSearch: () => {
        handleSelectView('workbench');
        requestAnimationFrame(() => {
          setTimeout(() => {
            queryInputRef.current?.focus();
          }, 40);
        });
      },
      openDorkCatalog: () => {
        handleSelectView('catalog');
        showToast('Opened Dork Reference Catalog (Ctrl+D).');
      },
      saveFindingsAction: () => {
        if (liveResults.length > 0) {
          handleSaveAllFindings();
        } else {
          showToast('No unsaved live results in Query Workbench to save.');
        }
      },
      runAutomatedSearch: () => {
        if (!isSearching) {
          void handleRunAutomatedSearch();
        }
      },
      exportCsv: () => {
        handleExportCurrentCsv();
      },
      selectView: (view) => handleSelectView(view),
      toggleCheatSheet: () => setCheatSheetOpen((v) => !v),
      toggleShortcuts: () => setShortcutsOpen((v) => !v),
      closeOverlays: () => {
        setShortcutsOpen(false);
        setCheatSheetOpen(false);
        setExportModalOpen(false);
        setMobileSidebarOpen(false);
        handleCloseHowTo();
        if (!isSendingGmail) {
          setPendingGmail(null);
        }
      },
    };
  });

  useEffect(() => {
    const isTypingTarget = (target: EventTarget | null): boolean => {
      if (!(target instanceof HTMLElement)) return false;
      const tag = target.tagName;
      return (
        tag === 'INPUT' ||
        tag === 'TEXTAREA' ||
        tag === 'SELECT' ||
        target.isContentEditable
      );
    };

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const actions = shortcutActionsRef.current;
      if (!actions) return;

      if (e.key === 'Escape') {
        actions.closeOverlays();
        return;
      }

      if (!actions.complianceAcknowledged) return;

      const mod = e.ctrlKey || e.metaKey;
      const lower = e.key.toLowerCase();

      if (mod && !e.altKey) {
        if (lower === 'k') {
          e.preventDefault();
          actions.focusSearch();
          return;
        }
        if (lower === 'd') {
          e.preventDefault();
          actions.openDorkCatalog();
          return;
        }
        if (lower === 's') {
          e.preventDefault();
          actions.saveFindingsAction();
          return;
        }
        if (lower === 'e') {
          e.preventDefault();
          actions.exportCsv();
          return;
        }
        if (e.key === 'Enter') {
          e.preventDefault();
          actions.runAutomatedSearch();
          return;
        }
        if (e.key === '/') {
          e.preventDefault();
          actions.toggleCheatSheet();
          return;
        }

        const viewShortcuts: Record<string, WorkspaceView> = {
          '1': 'dashboard',
          '2': 'workbench',
          '3': 'catalog',
          '4': 'database',
          '5': 'history',
          '6': 'alerts',
          '7': 'help',
        };
        if (viewShortcuts[e.key]) {
          e.preventDefault();
          actions.selectView(viewShortcuts[e.key]);
          return;
        }
      }

      if (!mod && !e.altKey && e.key === '?' && !isTypingTarget(e.target)) {
        e.preventDefault();
        actions.toggleShortcuts();
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  if (!hydrated) {
    return <div className="min-h-screen bg-[var(--v-bg)]" />;
  }

  const isHowToOpen =
    howToManualOpen ||
    (hydrated &&
      compliance.acknowledged &&
      !hideHowToOnStartup &&
      !howToDismissedThisSession);

  return (
    <div className="min-h-screen lg:h-screen grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)] bg-[var(--v-bg)] text-[var(--v-ink)] overflow-hidden">
      {/* Desktop Dedicated Sidebar */}
      <div className="hidden lg:block h-full min-w-0">
        <SidebarPanel
          activeView={activeView}
          onSelectView={handleSelectView}
          params={params}
          onUpdateParams={setParams}
          onResetParams={() => {
            setParams(DEFAULT_SEARCH_PARAMETERS);
            showToast('Reset all search parameters.');
          }}
          keywordGroups={keywordGroups}
          onAddKeyword={handleAddKeyword}
          onRemoveKeyword={handleRemoveKeyword}
          onCreateKeywordGroup={handleCreateKeywordGroup}
          findingsCount={findings.length}
          historyCount={history.length}
          alertRulesCount={alertRules.length}
        />
      </div>

      {/* Mobile Sidebar Drawer */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/60"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative z-50 h-full bg-[var(--v-surface)] flex">
            <SidebarPanel
              activeView={activeView}
              onSelectView={(v) => {
                handleSelectView(v);
                setMobileSidebarOpen(false);
              }}
              params={params}
              onUpdateParams={setParams}
              onResetParams={() => setParams(DEFAULT_SEARCH_PARAMETERS)}
              keywordGroups={keywordGroups}
              onAddKeyword={handleAddKeyword}
              onRemoveKeyword={handleRemoveKeyword}
              onCreateKeywordGroup={handleCreateKeywordGroup}
              findingsCount={findings.length}
              historyCount={history.length}
              alertRulesCount={alertRules.length}
            />
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(false)}
              aria-label="Close sidebar"
              className="absolute top-3 right-3 p-1.5 bg-[var(--v-bg)] border border-[var(--v-border)] rounded text-[var(--v-ink-dim)] hover:text-[var(--v-ink)]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Content Shell */}
      <div className="min-w-0 flex flex-col h-screen overflow-hidden">
        <TopHeader
          activeView={activeView}
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
          onOpenCheatSheet={() => setCheatSheetOpen(true)}
          onOpenShortcuts={() => setShortcutsOpen(true)}
          onOpenHowTo={() => setHowToManualOpen(true)}
          onRunPrimarySearch={() => void handleRunAutomatedSearch()}
          onExportCsv={handleExportCurrentCsv}
          isSearching={isSearching}
          gmailConnectedEmail={gmailUserEmail}
          onNavigateAlerts={() => handleSelectView('alerts')}
        />

        <main
          ref={mainScrollRef}
          onScroll={(e) => {
            const top = e.currentTarget.scrollTop;
            setShowBackToTop((prev) => (top > 280 ? true : top < 180 ? false : prev));
          }}
          className="flex-1 overflow-y-auto scroll-smooth p-4 sm:p-6"
        >
          <motion.div
            key={activeView}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-[1600px] mx-auto grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-start"
          >
            {activeView === 'dashboard' && (
              <DashboardView
                findings={findings}
                history={history}
                alertRules={alertRules}
                alertLogs={alertLogs}
                gmailConnectedEmail={gmailUserEmail}
                theme={theme}
                onChangeTheme={setTheme}
                onNavigateView={handleSelectView}
                onRerunQuery={(entry) => {
                  setParams((prev) => ({
                    ...prev,
                    selectedPlatform: entry.platform,
                    targetDomain: entry.targetDomain,
                    customRawOverride: entry.composedQuery,
                  }));
                  handleSelectView('workbench');
                  showToast('Loaded query into Query Workbench.');
                }}
              />
            )}

            {activeView === 'workbench' && (
              <QueryWorkbench
                params={params}
                onUpdateParams={setParams}
                isSearching={isSearching}
                searchError={searchError}
                liveSummary={liveSummary}
                liveResults={liveResults}
                executedQueries={executedQueries}
                onRunAutomatedSearch={() => void handleRunAutomatedSearch()}
                onLogExternalLaunch={(platform, q) =>
                  appendHistory(q, platform, 0, 'Engine Launcher')
                }
                onSaveFinding={handleSaveFinding}
                onSaveAllFindings={handleSaveAllFindings}
                onOpenCheatSheet={() => setCheatSheetOpen(true)}
                onSendResultsAlert={(items) =>
                  prepareGmailDigest({
                    ruleId: null,
                    ruleName: 'Workbench Live Search Findings',
                    recipientEmail: gmailUserEmail || '',
                    query: composeDorkQuery(params),
                    digestFindings: items,
                  })
                }
                externalApis={externalApis}
                onRunExternalApi={handleRunExternalApi}
                externalApiOutput={externalApiOutput}
                isRunningExternalApi={isRunningExternalApi}
                queryInputRef={queryInputRef}
              />
            )}

            {activeView === 'catalog' && (
              <DorkCatalogView
                targetDomain={params.targetDomain}
                onLoadDork={handleLoadDork}
                onInsertOperatorSnippet={handleInsertOperatorSnippet}
              />
            )}

            {activeView === 'database' && (
              <FindingsDatabaseView
                findings={findings}
                onUpdateStatus={(id, status: TriageStatus) => {
                  setFindings((prev) => {
                    const next = prev.map((f) =>
                      f.id === id ? { ...f, triageStatus: status } : f
                    );
                    saveFindings(next);
                    return next;
                  });
                }}
                onUpdateNotes={(id, notes) => {
                  setFindings((prev) => {
                    const next = prev.map((f) =>
                      f.id === id ? { ...f, notes } : f
                    );
                    saveFindings(next);
                    return next;
                  });
                }}
                onDeleteFindings={(ids) => {
                  const idSet = new Set(ids);
                  setFindings((prev) => {
                    const next = prev.filter((f) => !idSet.has(f.id));
                    saveFindings(next);
                    return next;
                  });
                  showToast(`Deleted ${ids.length} finding(s).`);
                }}
                onOpenExportModal={openExportModal}
                onImportJson={(records) => {
                  setFindings((prev) => {
                    const existingIds = new Set(prev.map((p) => p.id));
                    const merged = [
                      ...records.filter((r) => r.url && !existingIds.has(r.id)),
                      ...prev,
                    ];
                    saveFindings(merged);
                    return merged;
                  });
                  showToast(`Imported ${records.length} record(s) from JSON.`);
                }}
                onSendDigest={(selected) =>
                  prepareGmailDigest({
                    ruleId: null,
                    ruleName: 'Selected Findings Database Digest',
                    recipientEmail: gmailUserEmail || '',
                    query: selected[0]?.queryUsed || 'Database Selection',
                    digestFindings: selected,
                  })
                }
              />
            )}

            {activeView === 'history' && (
              <SearchHistoryView
                history={history}
                onRerunEntry={(entry) => {
                  setParams((prev) => ({
                    ...prev,
                    selectedPlatform: entry.platform,
                    targetDomain: entry.targetDomain,
                    customRawOverride: entry.composedQuery,
                  }));
                  setActiveView('workbench');
                  showToast('Loaded historical query into workbench.');
                }}
                onCreateAlertFromEntry={(entry) => {
                  const newRule: AlertRule = {
                    id: createId(),
                    name: `Monitor: ${entry.targetDomain || entry.platform}`,
                    query: entry.composedQuery,
                    domainScope: entry.targetDomain || 'Global',
                    recipientEmail: gmailUserEmail || '',
                    minFindingsThreshold: 1,
                    cadenceLabel: 'On Demand',
                    enabled: true,
                    lastTriggeredAt: null,
                  };
                  setAlertRules((prev) => {
                    const next = [newRule, ...prev];
                    saveAlertRules(next);
                    return next;
                  });
                  setActiveView('alerts');
                  showToast('Created alert rule from history entry.');
                }}
                onClearHistory={() => {
                  setHistory([]);
                  saveHistory([]);
                  showToast('Cleared search history log.');
                }}
                onExportCsv={(filtered) => {
                  const csv = exportHistoryToCsv(filtered);
                  triggerFileDownload(
                    csv,
                    `vectorone_dsp_history_${new Date().toISOString().slice(0, 10)}.csv`,
                    'text/csv;charset=utf-8;'
                  );
                  showToast(`Exported ${filtered.length} history row(s) to CSV.`);
                }}
              />
            )}

            {activeView === 'alerts' && (
              <AlertsIntegrationsView
                gmailUserEmail={gmailUserEmail}
                needsGmailAuth={needsGmailAuth}
                isLoggingIn={isLoggingIn}
                onGmailSignIn={handleGmailSignIn}
                onGmailLogout={handleGmailLogout}
                alertRules={alertRules}
                onAddAlertRule={(rule) => {
                  const created: AlertRule = {
                    ...rule,
                    id: createId(),
                    lastTriggeredAt: null,
                  };
                  setAlertRules((prev) => {
                    const next = [created, ...prev];
                    saveAlertRules(next);
                    return next;
                  });
                  showToast(`Added alert rule "${rule.name}".`);
                }}
                onToggleAlertRule={(id) => {
                  setAlertRules((prev) => {
                    const next = prev.map((r) =>
                      r.id === id ? { ...r, enabled: !r.enabled } : r
                    );
                    saveAlertRules(next);
                    return next;
                  });
                }}
                onDeleteAlertRule={(id) => {
                  setAlertRules((prev) => {
                    const next = prev.filter((r) => r.id !== id);
                    saveAlertRules(next);
                    return next;
                  });
                }}
                onTriggerAlertDigest={(rule) => {
                  const matching = findings.filter(
                    (f) =>
                      !rule.domainScope ||
                      rule.domainScope === 'Global' ||
                      f.domain.includes(rule.domainScope)
                  );
                  const payloadFindings =
                    matching.length > 0 ? matching : findings;
                  prepareGmailDigest({
                    ruleId: rule.id,
                    ruleName: rule.name,
                    recipientEmail: rule.recipientEmail,
                    query: rule.query,
                    digestFindings: payloadFindings,
                  });
                }}
                alertLogs={alertLogs}
                findingsCount={findings.length}
                defaultQuery={composeDorkQuery(params)}
                defaultDomain={params.targetDomain}
                externalApis={externalApis}
                onAddExternalApi={(cfg) => {
                  const created: ExternalApiConfig = {
                    ...cfg,
                    id: createId(),
                    lastTestedAt: null,
                    lastStatus: null,
                  };
                  setExternalApis((prev) => {
                    const next = [created, ...prev];
                    saveExternalApis(next);
                    return next;
                  });
                  showToast(`Added connector "${cfg.providerName}".`);
                }}
                onToggleExternalApi={(id) => {
                  setExternalApis((prev) => {
                    const next = prev.map((a) =>
                      a.id === id ? { ...a, enabled: !a.enabled } : a
                    );
                    saveExternalApis(next);
                    return next;
                  });
                }}
                onDeleteExternalApi={(id) => {
                  setExternalApis((prev) => {
                    const next = prev.filter((a) => a.id !== id);
                    saveExternalApis(next);
                    return next;
                  });
                }}
                onTestExternalApi={(cfg) =>
                  handleRunExternalApi(
                    cfg,
                    composeDorkQuery(params) || 'VectorOne_DSP connectivity test'
                  )
                }
                onSendWebhookFindings={async (cfg, list) => {
                  await fetch('/api/integrations/proxy', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      endpointUrl: cfg.endpointUrl,
                      method: 'POST',
                      authHeaderName: cfg.authHeaderName,
                      authHeaderValue: cfg.authHeaderValue,
                      payload: {
                        source: 'VectorOne_DSP',
                        exportedAt: new Date().toISOString(),
                        findingsCount: list.length,
                        findings: list.slice(0, 20),
                      },
                    }),
                  });
                  showToast(`Pushed ${Math.min(20, list.length)} finding(s) to ${cfg.providerName}.`);
                }}
                findings={findings}
              />
            )}

            {activeView === 'compliance' && (
              <ComplianceView
                compliance={compliance}
                onUpdateScopeNote={(note) => {
                  const next = { ...compliance, authorizedScopeNote: note };
                  setCompliance(next);
                  saveCompliance(next);
                  showToast('Saved authorized audit scope note.');
                }}
              />
            )}

            {activeView === 'help' && (
              <HelpView
                onNavigateView={handleSelectView}
                onOpenHowToPopup={() => setHowToManualOpen(true)}
                onOpenCheatSheet={() => setCheatSheetOpen(true)}
                onOpenShortcuts={() => setShortcutsOpen(true)}
              />
            )}

            {/* Quiet Legal Footer */}
            <footer className="col-span-full pt-5 pb-6 border-t border-[var(--v-border)] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-[var(--v-ink-dim)]">
              <span>
                VectorOne_DSP · Authorized security auditing &amp; compliance use only. Catalyst Vector AIA or its developers in no way takes responsibility for any misuse or illegal activities performed by the user.
              </span>
              <button
                type="button"
                onClick={() => setActiveView('compliance')}
                className="text-[var(--v-ink)] hover:text-[#ff4d00] underline whitespace-nowrap self-start sm:self-auto"
              >
                Ethical Use &amp; Privacy Policy
              </button>
            </footer>
          </motion.div>
        </main>
      </div>

      {/* Drawers & Modals */}
      <CheatSheetDrawer
        open={cheatSheetOpen}
        onClose={() => setCheatSheetOpen(false)}
        onInsertSnippet={handleInsertOperatorSnippet}
      />

      <KeyboardShortcutsModal
        open={shortcutsOpen}
        onClose={() => setShortcutsOpen(false)}
      />

      <ComplianceModal
        open={hydrated && !compliance.acknowledged}
        initialScopeNote={compliance.authorizedScopeNote}
        onAcknowledge={(scopeNote) => {
          const next: ComplianceState = {
            acknowledged: true,
            acknowledgedAt: new Date().toISOString(),
            authorizedScopeNote: scopeNote,
          };
          setCompliance(next);
          saveCompliance(next);
          showToast('Ethical use acknowledgment recorded.');
        }}
      />

      <GmailConfirmModal
        open={Boolean(pendingGmail)}
        recipientEmail={pendingGmail?.recipientEmail || ''}
        subject={pendingGmail?.subject || ''}
        bodyText={pendingGmail?.bodyText || ''}
        findingsCount={pendingGmail?.findingsCount || 0}
        isSending={isSendingGmail}
        onCancel={() => setPendingGmail(null)}
        onConfirm={handleConfirmSendGmail}
      />

      {exportModalOpen && (
        <ExportFindingsModal
          open={exportModalOpen}
          findings={findings}
          initialSelectedIds={exportPreselectedIds}
          onClose={() => setExportModalOpen(false)}
          onDownload={handleDownloadSelectedFindings}
        />
      )}

      {isHowToOpen && (
        <HowToUseModal
          open={isHowToOpen}
          initialQuery={composeDorkQuery(params)}
          initialPlatform={params.selectedPlatform}
          dontShowOnStartup={hideHowToOnStartup}
          onToggleDontShowOnStartup={handleToggleDontShowHowTo}
          onClose={handleCloseHowTo}
          onRunQuickSearch={handleRunQuickSearchFromPopup}
          onLoadIntoWorkbench={handleLoadQuickQueryFromPopup}
          onOpenHelpTab={() => {
            handleCloseHowTo();
            handleSelectView('help');
          }}
        />
      )}

      {/* Back to Top Smooth Scroll Button */}
      {showBackToTop && (
        <button
          type="button"
          onClick={scrollMainToTop}
          aria-label="Scroll back to top"
          className="fixed bottom-4 left-4 lg:left-[304px] z-40 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[var(--v-surface)] text-[var(--v-ink)] border border-[var(--v-border)] rounded shadow-sm hover:border-[#ff4d00] hover:text-[#ff4d00] transition-colors"
        >
          <ArrowUp className="w-3.5 h-3.5" />
          Top
        </button>
      )}

      {/* Ephemeral Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          className={`fixed right-4 z-50 bg-[var(--v-surface)] text-[var(--v-ink)] text-xs font-medium px-4 py-2.5 rounded shadow-md border border-[#ff4d00]/60 ${
            activeView === 'dashboard' ? 'bottom-16' : 'bottom-4'
          }`}
        >
          {toastMessage}
        </div>
      )}
    </div>
  );
}
