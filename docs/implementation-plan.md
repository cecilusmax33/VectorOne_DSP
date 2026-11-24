# VectorOne_DSP — Implementation Plan

VectorOne_DSP is an automated multi-platform search operator ("Google Dorking") and OSINT workbench built for authorized security auditing, public exposure discovery, and compliance monitoring. It pairs a high-density Swiss-grid daylight studio interface with live web-grounded search execution, a full operator and dork reference catalog, local searchable findings storage with CSV/JSON export, external API integrations, and Gmail-backed email alert dispatches.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> **Confirmed Phase 1 Decisions & Remaining Integration Gate**
> - **Findings & History Persistence (Confirmed)**: Local browser workspace storage (IndexedDB / localStorage) with full CSV and JSON export/import backup.
> - **Email Notification Alerts (Confirmed)**: Gmail integration via Google Workspace OAuth (`gmail.send` scope), including an explicit confirmation modal before any alert email is transmitted.
> - **Visual Direction (Confirmed)**: High-density daylight studio with a Swiss grid layout (crisp off-white surfaces, 1px hairline grid dividers, tabular monospace telemetry, and restrained accent hierarchy).
> - **Automated Multi-Platform Search (Default Applied)**: Hybrid execution combining server-side Gemini Google Search Grounding for live web results with platform-adapted query launchers (Google, Bing, DuckDuckGo, GitHub, Shodan, Wayback) and configurable external REST/Webhook API endpoints.
> - **Upcoming OAuth Approval Gate**: Once you approve this plan, the first implementation step will present the Google Workspace OAuth consent card so you can authorize Gmail alert sending before the integration code is wired.

---

## 1. Overview & Core Concept

- **What It Does**: VectorOne_DSP lets security analysts, compliance teams, and researchers build, validate, and run structured search operator queries across multiple platforms, filter results by target domain and sensitive-data categories, inspect a full catalog explaining what every dork does, store findings in a searchable local database, export reports to CSV/JSON, log full search history, and send Gmail alert digests.
- **Target Audience**: Authorized security auditors, Data Loss Prevention (DLP) analysts, DevSecOps engineers, and OSINT researchers auditing public exposure on owned or authorized domains.
- **Key Value**: Consolidates ad-hoc search operator syntax, multi-engine query translation, defensive sensitive-data filtering, audit logging, and structured reporting into one deterministic, transparent workspace—framed by explicit ethical use and Catalyst Vector AIA non-liability guardrails.

---

## 2. User Experience & Visual Design

### Key User Flows

1. **Compliance Gate & Ethical Use Acknowledgment**:
   - On initial entry, users review a concise Ethical Use, Privacy Law Compliance, and Catalyst Vector AIA Liability Disclaimer dialog requiring acknowledgment before launching automated queries (always re-accessible from the Compliance view and footer).
2. **Sidebar-Driven Query Composition**:
   - From the persistent left sidebar (`280px`), users pick or edit customizable keyword presets, set target domain constraints (`site:`, subdomain exclusions, path prefixes, date bounds), toggle Sensitive Data Query Filters (e.g., PII indicators, exposed config/env files, credentials/tokens, financial/regulated docs), and select target platforms.
3. **Dork Catalog Exploration & 1-Click Loading**:
   - In the **Dork Reference Catalog** view, users browse and search an exhaustive, categorized library of Google Dorks and search operators. Each entry explains the exact syntax, target platform compatibility, defensive audit purpose, and what the query specifically uncovers, with a 1-click **Load into Workbench** action.
4. **Automated Search Execution & Multi-Platform Launch**:
   - Users execute live web-grounded queries from the **Query Workbench** via the server-side Gemini Search Grounding endpoint, inspect returned findings with source URLs and snippets, save individual or bulk findings to the local database, or open translated queries directly on external engines (Google, Bing, DuckDuckGo, GitHub, Shodan, Wayback).
5. **Searchable Findings Database & CSV/JSON Export**:
   - In the **Findings Database** view, users search, filter (by domain, platform, sensitivity tier, triage status), sort, annotate/triage rows (`New`, `Reviewed`, `Archived`), and export filtered or full datasets as RFC 4180 CSV or JSON backups.
6. **Search History Audit Trail**:
   - Every executed or launched search is automatically logged in **Search History** with timestamp, full query string, active filters, platform, and result count, supporting 1-click re-run, alert rule creation, and CSV export.
7. **Gmail Alert Rules & External API Integrations**:
   - Users configure External Search / Webhook API endpoints (for custom REST search providers or Slack/SIEM webhooks) and define **Alert Rules**. Signing in with Google authorizes Gmail alerts; triggering a digest opens an explicit preview & confirmation dialog before calling the Gmail API.

### Visual Identity & Theme

- **Aesthetic Direction**: High-density daylight Swiss-grid studio—precision-ruled, architectural, zero ornamental clutter, no card-within-card nesting, no pill-badge clutter on static metadata, and strict single-elevation hairline grids.
- **Color Palette & Mood (60-30-10)**:
  - *Dominant Neutral Canvas (60%)*: Crisp paper white (`#FFFFFF`) and cool studio alabaster (`#F8FAFC`).
  - *Structural Surfaces & Hairlines (30%)*: Subtle surface contrast (`#F1F5F9`) and razor-sharp `1px` Swiss grid borders (`#E2E8F0`, `#CBD5E1`) with deep charcoal ink (`#0F172A`) and muted slate secondary text (`#475569`).
  - *Focused Accent Budget (10%)*: Precision Signal Cobalt (`#0284C7` / `#0369A1`) for primary actions and active navigation states; semantic status pairs (`#16A34A` nominal, `#D97706` caution, `#DC2626` sensitive/critical) always paired with explicit text labels.
- **Typography & Hierarchy (2+1 Font Rule)**:
  - *Display & Structural Headings*: `Outfit` (crisp Swiss geometric weight, `text-wrap: balance`, natural title-case numbering without code-comment prefixes).
  - *UI Controls & Body Prose*: `DM Sans` (`13px`–`15px` high-legibility proportions).
  - *Queries, Timestamps & Numeric Grids*: `JetBrains Mono` with `font-variant-numeric: tabular-nums` for vertical column alignment.
- **Component Styling & Layout**:
  - Fixed `280px` left sidebar (workspace navigation + customizable keyword manager + active search parameter controls) paired with a clean 1-row top bar (active view breadcrumb + primary action CTA) and full-bleed Swiss-grid main viewport (`36px`–`44px` high-density table rows).
- **Interactive Feedback & Motion**:
  - Snappy `150ms`–`200ms` transitions on hover, drawer expansions, and tab switches; skeleton rows during live search grounding; inline validation for malformed domains or operators; and clear toast confirmations on database saves, CSV exports, and Gmail dispatches.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Hybrid Search Execution (Gemini Search Grounding + Multi-Engine Translator)**
  - *Chosen Approach*: Use server-side `@google/genai` (`gemini-4-hydrogen`) with the `googleSearch` tool for live automated web-grounded discovery, paired with deterministic query translators for Google, Bing, DuckDuckGo, GitHub, Shodan, and Wayback plus user-configurable external REST/Webhook APIs.
  - *Why*: Direct headless scraping of Google SERPs triggers CAPTCHAs and IP blocks. Gemini Search Grounding provides reliable, structured, live web results server-side without requiring users to supply a Gemini key, while multi-platform launchers and external API hooks satisfy power-user cross-platform workflows.
  - *Alternatives Considered*: Browser-only CORS scraping (fails due to browser security and anti-bot blocks) or requiring mandatory paid third-party SERP keys before first use (creates onboarding friction).

- **Decision 2: Local Workspace Persistence with IndexedDB/localStorage + CSV/JSON Export**
  - *Chosen Approach*: Persist findings, search history, custom keyword lists, alert rules, and external API configurations locally in browser storage with deterministic JSON backup/restore and RFC 4180 CSV export.
  - *Why*: Matches user preference for zero-backend-database friction, instant query/filter latency across thousands of rows, and full portability of audit data.
  - *Alternatives Considered*: Cloud Firestore or Cloud SQL (unnecessary latency and provisioning overhead given local workspace preference).

- **Decision 3: Client-Side Gmail OAuth with In-Memory Token Caching & Explicit Send Confirmation**
  - *Chosen Approach*: Authenticate with Google via Firebase Auth popup (`https://www.googleapis.com/auth/gmail.send`), cache the OAuth access token strictly in memory (never in `localStorage`), and require explicit user review/confirmation in a preview modal before sending alert digests through the Gmail API.
  - *Why*: Adheres to least-privilege security rules, prevents accidental or unauthorized automated email broadcasts, and avoids server-side OAuth redirect URI mismatches in dynamic preview environments.
  - *Alternatives Considered*: Server-side SMTP credentials or automated silent background emails (violates credential safety and user consent standards).

---

## 4. Technical Architecture & Data Strategy

### Architecture & Component Diagram

```text
┌────────────────────────────────────────────────────────────────────────────┐
│                        VectorOne_DSP Daylight Studio                       │
├──────────────────────────┬─────────────────────────────────────────────────┤
│  Dedicated Left Sidebar  │  Top Header Bar (Breadcrumb + Primary CTA)      │
│  ──────────────────────  ├─────────────────────────────────────────────────┤
│  • Workspace Nav Views   │  Main Swiss-Grid Viewport                       │
│  • Custom Keyword Lists  │  ┌───────────────────────────────────────────┐  │
│  • Domain & Path Filters │  │ 1. Query Workbench & Automated Search     │  │
│  • Operator Parameters   │  │ 2. Full Dork Catalog (Syntax & Purpose)   │  │
│  • Sensitive Data (DLP)  │  │ 3. Searchable Findings Database + CSV     │  │
│    Query Toggles         │  │ 4. Search History Audit Log               │  │
│                          │  │ 5. Gmail Alerts & External API Connectors │  │
│                          │  │ 6. Ethical Use & Compliance Disclaimer    │  │
└────────────┬─────────────┴──────────────────────────┬──────────────────────┘
             │                                        │
             ▼                                        ▼
┌──────────────────────────┐             ┌───────────────────────────────────┐
│  Local Workspace Store   │             │  Server-Side Next.js API Routes   │
│  ──────────────────────  │             │  ───────────────────────────────  │
│  • Findings Database     │             │  • POST /api/search               │
│  • Search History Log    │◄───────────►│    (@google/genai googleSearch)   │
│  • Custom Keyword Sets   │             │  • POST /api/integrations/proxy   │
│  • Alert Rules & Log     │             │    (External Search / Webhook)    │
│  • Compliance Consent    │             └────────────────┬──────────────────┘
└────────────┬─────────────┘                              │
             │                                            ▼
             │                           ┌───────────────────────────────────┐
             └──────────────────────────►│  Client-Side Google Workspace API │
               (Explicit Confirmation)   │  • Firebase Auth (In-Memory Token)│
                                         │  • Gmail users.messages.send      │
                                         └───────────────────────────────────┘
```

### Data Model & State

- **Finding Record**: `id`, `title`, `url`, `domain`, `snippet`, `queryUsed`, `dorkId`, `platform`, `sensitivityCategory` (`Standard`, `Sensitive-PII`, `Config-Exposure`, `Credential-Risk`, `Regulated`), `triageStatus` (`New`, `Reviewed`, `Archived`), `notes`, `discoveredAt`.
- **Dork Catalog Entry**: `id`, `name`, `category`, `operatorTemplate`, `description` (what the dork specifically targets and uncovers), `auditRationale`, `platforms` (supported engines), `sensitivityLevel`, `exampleQuery`.
- **Search History Entry**: `id`, `timestamp`, `composedQuery`, `platform`, `targetDomain`, `sensitiveFiltersApplied`, `resultCount`, `executionMode` (`Gemini Grounded`, `External API`, `Engine Launcher`).
- **Keyword Preset & Parameter State**: `targetDomain`, `excludeSubdomains`, `pathPrefix`, `fileTypes[]`, `inTitle`, `inUrl`, `inText`, `exactPhrase`, `excludeTerms[]`, `dateAfter`, `dateBefore`, `customKeywordGroups[]`, `activeSensitiveFilters[]`.
- **Alert Rule & Dispatch Log**: `id`, `name`, `query`, `domainScope`, `recipientEmail`, `minFindingsThreshold`, `frequencyLabel`, `lastTriggeredAt`, `enabled`, plus an immutable dispatch log of sent Gmail notifications.
- **External API Integration Config**: `id`, `providerName`, `endpointUrl`, `method`, `authHeaderName`, `queryParamKey`, `enabled`, `lastTestedAt` (with optional server-side proxy execution for custom REST endpoints and webhooks).

### Interactive Component & State Mapping

- **Sidebar Parameter & Keyword Controls** $\rightarrow$ Live reactive `composeDorkQuery()` builder updates the Query Workbench string in real time, validates domain/operator syntax, and updates multi-engine URL previews simultaneously.
- **Automated Search Trigger (`Run Automated Query`)** $\rightarrow$ Checks compliance acknowledgment; calls `POST /api/search` (Gemini `gemini-4-hydrogen` with `googleSearch` tool); parses `groundingMetadata.groundingChunks` and structured findings; appends a record to Search History; renders live results with 1-click **Save to Database** or **Save All Findings**.
- **External API Connector (`Run via External API` / `Dispatch Webhook`)** $\rightarrow$ Routes configured external search API or notification webhook payloads through `POST /api/integrations/proxy` with error surfacing and response inspection.
- **Findings Database Grid** $\rightarrow$ Client-side reactive search/filter/sort across all stored findings, inline triage status selector, bulk selection checkboxes, and deterministic CSV/JSON file downloaders.
- **Gmail Alert Flow** $\rightarrow$ User clicks **Sign in with Google** (Firebase Auth popup storing access token only in memory). Clicking **Send Alert Digest** opens an explicit confirmation modal displaying recipient, subject, and finding summary before invoking `https://gmail.googleapis.com/gmail/v1/users/me/messages/send`.
