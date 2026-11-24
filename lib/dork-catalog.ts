import {
  DatePreset,
  DorkCatalogEntry,
  KeywordGroup,
  PlatformId,
  ResultPositionPreset,
  SearchParameters,
  SensitiveDataFilter,
} from './types';

export const PLATFORM_DEFINITIONS: {
  id: PlatformId;
  label: string;
  shortNote: string;
}[] = [
  { id: 'google', label: 'Google', shortNote: 'Full operator, geo & rank offset' },
  { id: 'bing', label: 'Bing', shortNote: 'Supports site, filetype, inbody, cc' },
  { id: 'duckduckgo', label: 'DuckDuckGo', shortNote: 'Privacy operators, kl & df' },
  { id: 'github', label: 'GitHub', shortNote: 'Code, path, extension & pagination' },
  { id: 'shodan', label: 'Shodan', shortNote: 'Hostname, country & HTTP title' },
  { id: 'wayback', label: 'Wayback', shortNote: 'Archived URL & date snapshot lookup' },
];

export const COMMON_FILE_TYPES = [
  'pdf',
  'xlsx',
  'csv',
  'docx',
  'json',
  'xml',
  'yaml',
  'env',
  'sql',
  'log',
  'conf',
  'bak',
  'txt',
];

export const LANGUAGE_OPTIONS: { code: string; label: string }[] = [
  { code: '', label: 'Any Language' },
  { code: 'en', label: 'English (en)' },
  { code: 'es', label: 'Spanish (es)' },
  { code: 'fr', label: 'French (fr)' },
  { code: 'de', label: 'German (de)' },
  { code: 'pt', label: 'Portuguese (pt)' },
  { code: 'it', label: 'Italian (it)' },
  { code: 'nl', label: 'Dutch (nl)' },
  { code: 'ja', label: 'Japanese (ja)' },
  { code: 'ko', label: 'Korean (ko)' },
  { code: 'zh-CN', label: 'Chinese Simplified (zh-CN)' },
  { code: 'ar', label: 'Arabic (ar)' },
  { code: 'ru', label: 'Russian (ru)' },
];

export const COUNTRY_OPTIONS: {
  code: string;
  label: string;
  cctld: string;
}[] = [
  { code: '', label: 'Global / All Regions', cctld: '' },
  { code: 'us', label: 'United States (US)', cctld: '.us' },
  { code: 'gb', label: 'United Kingdom (GB)', cctld: '.uk' },
  { code: 'ca', label: 'Canada (CA)', cctld: '.ca' },
  { code: 'de', label: 'Germany (DE)', cctld: '.de' },
  { code: 'fr', label: 'France (FR)', cctld: '.fr' },
  { code: 'nl', label: 'Netherlands (NL)', cctld: '.nl' },
  { code: 'ch', label: 'Switzerland (CH)', cctld: '.ch' },
  { code: 'au', label: 'Australia (AU)', cctld: '.au' },
  { code: 'jp', label: 'Japan (JP)', cctld: '.jp' },
  { code: 'sg', label: 'Singapore (SG)', cctld: '.sg' },
  { code: 'in', label: 'India (IN)', cctld: '.in' },
  { code: 'br', label: 'Brazil (BR)', cctld: '.br' },
];

export const DATE_PRESET_OPTIONS: { id: DatePreset; label: string }[] = [
  { id: 'any', label: 'Any Time' },
  { id: '24h', label: 'Past 24h' },
  { id: '7d', label: 'Past 7d' },
  { id: '30d', label: 'Past 30d' },
  { id: '1y', label: 'Past Year' },
  { id: 'custom', label: 'Custom Range' },
];

export const RESULT_POSITION_PRESETS: {
  id: ResultPositionPreset;
  label: string;
  start: number;
  end: number;
}[] = [
  { id: 'all', label: 'All Ranks (1–50)', start: 1, end: 50 },
  { id: 'top10', label: 'Page 1 (Pos 1–10)', start: 1, end: 10 },
  { id: 'pos11_30', label: 'Deep Page 2–3 (Pos 11–30)', start: 11, end: 30 },
  { id: 'pos31_50', label: 'Buried Results (Pos 31–50)', start: 31, end: 50 },
  { id: 'pos51_100', label: 'Long-Tail (Pos 51–100)', start: 51, end: 100 },
  { id: 'custom', label: 'Custom Range', start: 1, end: 25 },
];

export const DEFAULT_KEYWORD_GROUPS: KeywordGroup[] = [
  {
    id: 'kw-docs',
    name: 'Document & Compliance',
    keywords: [
      'confidential',
      'internal use only',
      'audit report',
      'vendor list',
      'budget',
      'policy',
    ],
  },
  {
    id: 'kw-infra',
    name: 'Infrastructure & Config',
    keywords: [
      'staging',
      'dev',
      'swagger',
      'openapi',
      'phpinfo',
      'robots.txt',
      'sitemap',
    ],
  },
  {
    id: 'kw-auth',
    name: 'Auth & Portals',
    keywords: ['login', 'sso', 'oauth', 'admin', 'portal', 'dashboard'],
  },
  {
    id: 'kw-cloud',
    name: 'Cloud & Storage',
    keywords: [
      's3.amazonaws.com',
      'storage.googleapis.com',
      'blob.core.windows.net',
      'cloudfront.net',
    ],
  },
];

export const SENSITIVE_DATA_FILTERS: SensitiveDataFilter[] = [
  {
    id: 'sdf-pii',
    label: 'PII & Identity Indicators',
    category: 'Sensitive-PII',
    description:
      'Locates publicly indexed spreadsheets or exports containing employee directories, SSN/national ID headers, or contact lists for DLP remediation.',
    queryClause:
      '(inurl:directory OR intext:"date of birth" OR intext:"employee id" OR intext:"ssn")',
  },
  {
    id: 'sdf-creds',
    label: 'API Keys & Token Patterns',
    category: 'Credential-Risk',
    description:
      'Audits public repositories, config pastes, and indexed text for accidental token, private key, or secret variable definitions.',
    queryClause:
      '(intext:"API_KEY" OR intext:"SECRET_KEY" OR intext:"Authorization: Bearer" OR intext:"BEGIN RSA PRIVATE KEY")',
  },
  {
    id: 'sdf-config',
    label: 'Configuration & Env Artifacts',
    category: 'Config-Exposure',
    description:
      'Detects accidentally exposed environment files, Docker Compose manifests, YAML settings, or database connection strings.',
    queryClause:
      '(filetype:env OR filetype:yaml OR filetype:conf OR intext:"DB_PASSWORD" OR intext:"DATABASE_URL")',
  },
  {
    id: 'sdf-financial',
    label: 'Financial & Tax Records',
    category: 'Regulated',
    description:
      'Identifies publicly indexed invoices, purchase orders, payroll sheets, or tax filings requiring access control review.',
    queryClause:
      '(filetype:xlsx OR filetype:pdf) (intext:"invoice" OR intext:"payroll" OR intext:"routing number" OR intext:"tax id")',
  },
  {
    id: 'sdf-healthcare',
    label: 'Healthcare & Regulated Data',
    category: 'Regulated',
    description:
      'Screens authorized organizational domains for unintended public indexing of HIPAA/patient intake forms or clinical records.',
    queryClause:
      '(intext:"patient" OR intext:"medical record" OR intext:"HIPAA") (filetype:pdf OR filetype:xlsx OR filetype:csv)',
  },
  {
    id: 'sdf-confidential',
    label: 'Internal / Confidential Markings',
    category: 'Sensitive-PII',
    description:
      'Surfaces documents labeled as internal, proprietary, or restricted that were unintentionally crawled by search engines.',
    queryClause:
      '("internal use only" OR "strictly confidential" OR "do not distribute" OR "proprietary")',
  },
];

export const DORK_CATALOG: DorkCatalogEntry[] = [
  {
    id: 'dork-doc-pdf-confidential',
    name: 'Indexed Internal PDF Audit',
    category: 'Public Document Audit',
    operatorTemplate:
      'site:{domain} filetype:pdf ("confidential" OR "internal use only" OR "do not distribute")',
    whatItDoes:
      'Restricts search results to PDF documents hosted on the target domain that contain internal distribution warnings or confidentiality footers.',
    auditRationale:
      'Helps compliance and DLP teams discover PDFs intended for internal circulation that were inadvertently indexed publicly.',
    supportedPlatforms: ['google', 'bing', 'duckduckgo'],
    sensitivityLevel: 'Sensitive-PII',
    defaultFileTypes: ['pdf'],
    defaultKeywords: ['confidential', 'internal use only'],
    exampleQuery:
      'site:example.com filetype:pdf ("confidential" OR "internal use only")',
  },
  {
    id: 'dork-doc-spreadsheets',
    name: 'Public Spreadsheet & CSV Discovery',
    category: 'Public Document Audit',
    operatorTemplate:
      'site:{domain} (filetype:xlsx OR filetype:xls OR filetype:csv)',
    whatItDoes:
      'Finds all Microsoft Excel workbooks and CSV exports indexed under the target domain regardless of directory location.',
    auditRationale:
      'Spreadsheets frequently store operational lists, asset inventories, or contact exports that should sit behind authentication.',
    supportedPlatforms: ['google', 'bing', 'duckduckgo'],
    sensitivityLevel: 'Standard',
    defaultFileTypes: ['xlsx', 'csv'],
    exampleQuery: 'site:example.com (filetype:xlsx OR filetype:csv)',
  },
  {
    id: 'dork-doc-word-reports',
    name: 'Audit & Policy Word Documents',
    category: 'Public Document Audit',
    operatorTemplate:
      'site:{domain} (filetype:docx OR filetype:doc) (intext:"audit" OR intext:"assessment" OR intext:"policy")',
    whatItDoes:
      'Locates Word documents containing audit, security assessment, or internal policy language across public web roots.',
    auditRationale:
      'Prevents draft governance policies or vendor assessments from remaining discoverable on public marketing domains.',
    supportedPlatforms: ['google', 'bing', 'duckduckgo'],
    sensitivityLevel: 'Standard',
    defaultFileTypes: ['docx'],
    defaultKeywords: ['audit report', 'policy'],
    exampleQuery:
      'site:example.com filetype:docx (intext:"audit" OR intext:"policy")',
  },
  {
    id: 'dork-doc-presentations',
    name: 'Indexed Architecture Slide Decks',
    category: 'Public Document Audit',
    operatorTemplate:
      'site:{domain} (filetype:pptx OR filetype:ppt) (intext:"architecture" OR intext:"roadmap" OR intext:"network")',
    whatItDoes:
      'Identifies PowerPoint presentations mentioning system architecture, network topology, or internal product roadmaps.',
    auditRationale:
      'Slide decks uploaded for webinars or partner briefings sometimes retain internal architecture diagrams.',
    supportedPlatforms: ['google', 'bing', 'duckduckgo'],
    sensitivityLevel: 'Standard',
    defaultFileTypes: ['pptx'],
    defaultKeywords: ['architecture', 'roadmap'],
    exampleQuery:
      'site:example.com filetype:pptx (intext:"architecture" OR intext:"roadmap")',
  },
  {
    id: 'dork-cfg-env-files',
    name: 'Exposed Environment Configuration (.env)',
    category: 'Configuration & Environment',
    operatorTemplate:
      'site:{domain} (inurl:".env" OR filetype:env) (intext:"DB_HOST" OR intext:"APP_KEY" OR intext:"SECRET")',
    whatItDoes:
      'Searches for publicly readable `.env` runtime configuration files containing environment variable keys like `DB_HOST` or `APP_KEY`.',
    auditRationale:
      'Misconfigured web servers occasionally serve `.env` dotfiles; identifying them allows immediate access blocking and secret rotation.',
    supportedPlatforms: ['google', 'bing', 'github'],
    sensitivityLevel: 'Credential-Risk',
    defaultFileTypes: ['env'],
    defaultInUrl: '.env',
    defaultKeywords: ['DB_HOST', 'APP_KEY'],
    exampleQuery:
      'site:example.com inurl:".env" (intext:"DB_HOST" OR intext:"APP_KEY")',
  },
  {
    id: 'dork-cfg-git-exposure',
    name: 'Exposed Git Metadata Directory',
    category: 'Configuration & Environment',
    operatorTemplate:
      'site:{domain} inurl:"/.git/" (intitle:"Index of /.git" OR intext:"HEAD" OR intext:"refs/heads")',
    whatItDoes:
      'Checks whether search engines have crawled an exposed `.git` repository metadata folder or directory listing on a web server.',
    auditRationale:
      'An accessible `.git` directory can expose source history and commit metadata; servers must explicitly deny `/.git` paths.',
    supportedPlatforms: ['google', 'bing', 'duckduckgo'],
    sensitivityLevel: 'Config-Exposure',
    defaultInUrl: '/.git/',
    defaultInTitle: 'Index of /.git',
    exampleQuery: 'site:example.com inurl:"/.git/" intitle:"Index of"',
  },
  {
    id: 'dork-cfg-yaml-docker',
    name: 'Container & CI/CD Manifest Exposure',
    category: 'Configuration & Environment',
    operatorTemplate:
      'site:{domain} (inurl:"docker-compose" OR inurl:".github/workflows" OR filetype:yaml) intext:"services:"',
    whatItDoes:
      'Finds indexed Docker Compose, Kubernetes, or CI/CD YAML pipeline files that describe internal service names and ports.',
    auditRationale:
      'Ensures build manifests and container orchestration definitions are excluded from public web directories.',
    supportedPlatforms: ['google', 'github', 'bing'],
    sensitivityLevel: 'Config-Exposure',
    defaultFileTypes: ['yaml'],
    defaultInUrl: 'docker-compose',
    exampleQuery: 'site:example.com filetype:yaml intext:"services:"',
  },
  {
    id: 'dork-cfg-sql-dumps',
    name: 'Database Dump & Backup Artifact Audit',
    category: 'Configuration & Environment',
    operatorTemplate:
      'site:{domain} (filetype:sql OR filetype:bak OR filetype:dump) (intext:"CREATE TABLE" OR intext:"INSERT INTO")',
    whatItDoes:
      'Detects indexed SQL schema files, backup archives, or database export scripts containing DDL/DML statements.',
    auditRationale:
      'Verifies that automated backup scripts do not write `.sql` or `.bak` archives into publicly served web directories.',
    supportedPlatforms: ['google', 'bing', 'github'],
    sensitivityLevel: 'Config-Exposure',
    defaultFileTypes: ['sql', 'bak'],
    defaultInText: 'CREATE TABLE',
    exampleQuery: 'site:example.com filetype:sql intext:"CREATE TABLE"',
  },
  {
    id: 'dork-cfg-wp-config',
    name: 'CMS Config & Backup File Check',
    category: 'Configuration & Environment',
    operatorTemplate:
      'site:{domain} (inurl:"wp-config" OR inurl:"configuration.php") (filetype:bak OR filetype:txt OR filetype:old)',
    whatItDoes:
      'Searches for leftover CMS backup config files (e.g., `.bak`, `.old`, `.txt`) that web servers serve as plain text instead of executing.',
    auditRationale:
      'Prevents plain-text exposure of CMS database credentials left behind after site migrations or manual edits.',
    supportedPlatforms: ['google', 'bing', 'duckduckgo'],
    sensitivityLevel: 'Credential-Risk',
    defaultInUrl: 'wp-config',
    defaultFileTypes: ['bak', 'txt'],
    exampleQuery: 'site:example.com inurl:"wp-config" (filetype:bak OR filetype:txt)',
  },
  {
    id: 'dork-cloud-s3-buckets',
    name: 'Amazon S3 Bucket Reference Audit',
    category: 'Cloud & Storage Exposure',
    operatorTemplate:
      'site:s3.amazonaws.com "{domain_keyword}" OR intext:"{domain_keyword}.s3.amazonaws.com"',
    whatItDoes:
      'Finds indexed AWS S3 bucket URLs or directory listings referencing your organization name or domain identifier.',
    auditRationale:
      'Identifies public S3 buckets that may have overly permissive ACLs or legacy public read policies.',
    supportedPlatforms: ['google', 'bing', 'duckduckgo'],
    sensitivityLevel: 'Config-Exposure',
    defaultKeywords: ['s3.amazonaws.com'],
    exampleQuery: 'site:s3.amazonaws.com "example"',
  },
  {
    id: 'dork-cloud-gcs-azure',
    name: 'GCP Storage & Azure Blob References',
    category: 'Cloud & Storage Exposure',
    operatorTemplate:
      '(site:storage.googleapis.com OR site:blob.core.windows.net) "{domain_keyword}"',
    whatItDoes:
      'Queries Google Cloud Storage and Azure Blob Storage public endpoints for indexed containers matching a target brand or domain.',
    auditRationale:
      'Allows cloud security teams to audit unintended public object storage across multi-cloud environments.',
    supportedPlatforms: ['google', 'bing', 'duckduckgo'],
    sensitivityLevel: 'Config-Exposure',
    defaultKeywords: ['storage.googleapis.com', 'blob.core.windows.net'],
    exampleQuery:
      '(site:storage.googleapis.com OR site:blob.core.windows.net) "example"',
  },
  {
    id: 'dork-cloud-open-dir',
    name: 'Open Web Directory Listing Audit',
    category: 'Cloud & Storage Exposure',
    operatorTemplate:
      'site:{domain} intitle:"Index of /" ("Parent Directory" OR "Last modified")',
    whatItDoes:
      'Detects Apache/Nginx auto-indexing pages (`Index of /`) where directory browsing is enabled and files are browsable.',
    auditRationale:
      'Disabling `Options +Indexes` / `autoindex` prevents search engines from enumerating unlinked directory contents.',
    supportedPlatforms: ['google', 'bing', 'duckduckgo', 'shodan'],
    sensitivityLevel: 'Standard',
    defaultInTitle: 'Index of /',
    defaultInText: 'Parent Directory',
    exampleQuery: 'site:example.com intitle:"Index of /" "Parent Directory"',
  },
  {
    id: 'dork-admin-login-portals',
    name: 'Authentication & Admin Portal Inventory',
    category: 'Admin & Auth Surfaces',
    operatorTemplate:
      'site:{domain} (inurl:admin OR inurl:login OR inurl:portal OR inurl:sso) (intitle:"Login" OR intitle:"Sign In" OR intitle:"Admin")',
    whatItDoes:
      'Maps all publicly reachable login, SSO, and administrative console URLs indexed across a domain and its subdomains.',
    auditRationale:
      'Establishes a complete external attack-surface inventory so teams can verify MFA enforcement and IP allowlisting.',
    supportedPlatforms: ['google', 'bing', 'duckduckgo', 'shodan'],
    sensitivityLevel: 'Standard',
    defaultInUrl: 'admin',
    defaultInTitle: 'Login',
    exampleQuery:
      'site:example.com (inurl:admin OR inurl:login) intitle:"Sign In"',
  },
  {
    id: 'dork-admin-dashboard-panels',
    name: 'Exposed Monitoring & BI Dashboards',
    category: 'Admin & Auth Surfaces',
    operatorTemplate:
      'site:{domain} (intitle:"Grafana" OR intitle:"Kibana" OR intitle:"Prometheus" OR intitle:"Jenkins" OR inurl:":9090" OR inurl:":5601")',
    whatItDoes:
      'Finds indexed observability, CI/CD, or telemetry consoles such as Grafana, Kibana, Jenkins, or Prometheus.',
    auditRationale:
      'Internal observability dashboards should sit behind VPN/Zero-Trust proxies rather than being publicly indexed.',
    supportedPlatforms: ['google', 'shodan', 'bing'],
    sensitivityLevel: 'Config-Exposure',
    defaultKeywords: ['Grafana', 'Kibana', 'Jenkins'],
    exampleQuery:
      'site:example.com (intitle:"Grafana" OR intitle:"Kibana" OR intitle:"Jenkins")',
  },
  {
    id: 'dork-admin-phpmyadmin',
    name: 'Database Management UI Exposure',
    category: 'Admin & Auth Surfaces',
    operatorTemplate:
      'site:{domain} (inurl:phpmyadmin OR inurl:adminer OR intitle:"phpMyAdmin")',
    whatItDoes:
      'Checks whether web-based database administration interfaces like phpMyAdmin or Adminer are exposed on public hosts.',
    auditRationale:
      'Database management panels should never be reachable from the open internet.',
    supportedPlatforms: ['google', 'bing', 'shodan'],
    sensitivityLevel: 'Config-Exposure',
    defaultInUrl: 'phpmyadmin',
    defaultInTitle: 'phpMyAdmin',
    exampleQuery: 'site:example.com (inurl:phpmyadmin OR intitle:"phpMyAdmin")',
  },
  {
    id: 'dork-api-swagger-openapi',
    name: 'Swagger & OpenAPI Specification Discovery',
    category: 'API & Schema Discovery',
    operatorTemplate:
      'site:{domain} (inurl:swagger OR inurl:openapi OR inurl:"api-docs" OR intitle:"Swagger UI")',
    whatItDoes:
      'Locates interactive Swagger UI portals and raw OpenAPI JSON/YAML schema endpoints indexed on the target domain.',
    auditRationale:
      'Confirms whether internal or staging API documentation is unintentionally public and reviews exposed endpoint schemas.',
    supportedPlatforms: ['google', 'bing', 'duckduckgo', 'github'],
    sensitivityLevel: 'Standard',
    defaultInUrl: 'swagger',
    defaultInTitle: 'Swagger UI',
    exampleQuery:
      'site:example.com (inurl:swagger OR inurl:"api-docs" OR intitle:"Swagger UI")',
  },
  {
    id: 'dork-api-graphql-endpoints',
    name: 'GraphQL Playground & Introspection Audit',
    category: 'API & Schema Discovery',
    operatorTemplate:
      'site:{domain} (inurl:graphql OR inurl:graphiql OR intitle:"GraphQL Playground")',
    whatItDoes:
      'Searches for indexed GraphQL interactive playgrounds and endpoint documentation URLs.',
    auditRationale:
      'Helps teams ensure GraphQL introspection and interactive playgrounds are disabled in production.',
    supportedPlatforms: ['google', 'bing', 'github'],
    sensitivityLevel: 'Standard',
    defaultInUrl: 'graphql',
    defaultInTitle: 'GraphQL Playground',
    exampleQuery: 'site:example.com (inurl:graphql OR intitle:"GraphQL Playground")',
  },
  {
    id: 'dork-api-wsdl-soap',
    name: 'Legacy SOAP / WSDL & XML Endpoints',
    category: 'API & Schema Discovery',
    operatorTemplate:
      'site:{domain} (filetype:wsdl OR inurl:"?wsdl" OR inurl:"service.asmx")',
    whatItDoes:
      'Identifies legacy SOAP service descriptors and `.asmx` endpoints still indexed on organizational domains.',
    auditRationale:
      'Discovers forgotten legacy service integrations that may lack modern gateway controls or deprecation.',
    supportedPlatforms: ['google', 'bing', 'wayback'],
    sensitivityLevel: 'Standard',
    defaultInUrl: '?wsdl',
    exampleQuery: 'site:example.com (filetype:wsdl OR inurl:"?wsdl")',
  },
  {
    id: 'dork-err-stack-traces',
    name: 'Application Stack Trace & Exception Audit',
    category: 'Error & Diagnostic Logs',
    operatorTemplate:
      'site:{domain} ("Fatal error:" OR "Uncaught Exception" OR "Traceback (most recent call last)" OR "at java.lang.")',
    whatItDoes:
      'Finds pages cached by search engines that contain verbose runtime stack traces, file paths, or unhandled exception dumps.',
    auditRationale:
      'Verbose stack traces reveal framework versions and internal file paths; teams should enforce custom generic error pages.',
    supportedPlatforms: ['google', 'bing', 'duckduckgo'],
    sensitivityLevel: 'Config-Exposure',
    defaultKeywords: ['Fatal error', 'Uncaught Exception', 'Traceback'],
    exampleQuery:
      'site:example.com ("Fatal error:" OR "Traceback (most recent call last)")',
  },
  {
    id: 'dork-err-log-files',
    name: 'Public Server & Application Log Files',
    category: 'Error & Diagnostic Logs',
    operatorTemplate:
      'site:{domain} (filetype:log OR inurl:"error_log" OR inurl:"access.log" OR inurl:"debug.log")',
    whatItDoes:
      'Detects `.log` files indexed under web roots including Apache/Nginx error logs, application debug logs, or audit trails.',
    auditRationale:
      'Debug logs can contain session tokens, IP addresses, and request parameters that must remain private.',
    supportedPlatforms: ['google', 'bing', 'duckduckgo'],
    sensitivityLevel: 'Config-Exposure',
    defaultFileTypes: ['log'],
    defaultInUrl: 'debug.log',
    exampleQuery: 'site:example.com (filetype:log OR inurl:"debug.log")',
  },
  {
    id: 'dork-err-phpinfo-diagnostics',
    name: 'PHPInfo & Server Diagnostics Exposure',
    category: 'Error & Diagnostic Logs',
    operatorTemplate:
      'site:{domain} (inurl:"phpinfo.php" OR intitle:"phpinfo()" OR inurl:"server-status")',
    whatItDoes:
      'Locates left-behind `phpinfo()` diagnostic pages or Apache `mod_status` endpoints indexed by search engines.',
    auditRationale:
      'Diagnostic endpoints expose loaded modules, environment variables, and PHP build details.',
    supportedPlatforms: ['google', 'bing', 'shodan'],
    sensitivityLevel: 'Config-Exposure',
    defaultInUrl: 'phpinfo.php',
    defaultInTitle: 'phpinfo()',
    exampleQuery: 'site:example.com (inurl:"phpinfo.php" OR intitle:"phpinfo()")',
  },
  {
    id: 'dork-sub-staging-dev',
    name: 'Staging, Dev & UAT Subdomain Discovery',
    category: 'Subdomain & Staging',
    operatorTemplate:
      'site:*.{domain} -site:www.{domain} (inurl:staging OR inurl:dev OR inurl:uat OR inurl:qa OR inurl:sandbox)',
    whatItDoes:
      'Enumerates non-production subdomains (`staging.`, `dev.`, `uat.`, `qa.`, `sandbox.`) that were indexed externally.',
    auditRationale:
      'Pre-production hosts often lack WAF rules or carry stale test data and should be blocked via `robots.txt` and IP access control.',
    supportedPlatforms: ['google', 'bing', 'duckduckgo', 'wayback'],
    sensitivityLevel: 'Standard',
    defaultInUrl: 'staging',
    exampleQuery:
      'site:example.com -site:www.example.com (inurl:staging OR inurl:dev OR inurl:uat)',
  },
  {
    id: 'dork-sub-subdomain-enum',
    name: 'Wildcard Subdomain Surface Mapping',
    category: 'Subdomain & Staging',
    operatorTemplate: 'site:{domain} -site:www.{domain}',
    whatItDoes:
      'Excludes the primary `www.` subdomain to surface all secondary subdomains and microsites indexed under a parent domain.',
    auditRationale:
      'Provides a rapid inventory of forgotten marketing microsites, partner portals, and regional subdomains.',
    supportedPlatforms: ['google', 'bing', 'duckduckgo', 'wayback'],
    sensitivityLevel: 'Standard',
    exampleQuery: 'site:example.com -site:www.example.com',
  },
  {
    id: 'dork-sub-wayback-legacy',
    name: 'Historical Endpoint & Legacy Path Audit',
    category: 'Subdomain & Staging',
    operatorTemplate:
      'site:{domain} (inurl:old OR inurl:backup OR inurl:archive OR inurl:v1 OR inurl:legacy)',
    whatItDoes:
      'Finds deprecated API versions, archived directories, and legacy paths that may still respond on production origins.',
    auditRationale:
      'Pairs naturally with Wayback Machine lookups to verify old endpoints have been properly decommissioned.',
    supportedPlatforms: ['google', 'bing', 'wayback'],
    sensitivityLevel: 'Standard',
    defaultInUrl: 'legacy',
    exampleQuery:
      'site:example.com (inurl:old OR inurl:archive OR inurl:legacy)',
  },
  {
    id: 'dork-dlp-api-secrets-github',
    name: 'GitHub Code & Secret Pattern Audit',
    category: 'Sensitive Data & DLP Compliance',
    operatorTemplate:
      '"{domain}" ("API_KEY" OR "SECRET_KEY" OR "AWS_ACCESS_KEY_ID" OR "PRIVATE KEY")',
    whatItDoes:
      'Constructs a code-search query targeting public repositories referencing your domain alongside credential variable names.',
    auditRationale:
      'Enables engineering security teams to detect accidental credential commits referencing corporate domains.',
    supportedPlatforms: ['github', 'google'],
    sensitivityLevel: 'Credential-Risk',
    defaultKeywords: ['API_KEY', 'SECRET_KEY'],
    exampleQuery: '"example.com" ("API_KEY" OR "SECRET_KEY")',
  },
  {
    id: 'dork-dlp-pii-exports',
    name: 'PII & Employee Directory DLP Check',
    category: 'Sensitive Data & DLP Compliance',
    operatorTemplate:
      'site:{domain} (filetype:csv OR filetype:xlsx OR filetype:pdf) ("employee" OR "directory" OR "phone" OR "email")',
    whatItDoes:
      'Audits indexed spreadsheets and PDFs on an authorized domain for employee contact rosters or personal identifiers.',
    auditRationale:
      'Supports GDPR/CCPA data minimization reviews by verifying internal rosters are not publicly crawlable.',
    supportedPlatforms: ['google', 'bing', 'duckduckgo'],
    sensitivityLevel: 'Sensitive-PII',
    defaultFileTypes: ['csv', 'xlsx'],
    defaultKeywords: ['directory', 'employee'],
    exampleQuery:
      'site:example.com (filetype:csv OR filetype:xlsx) ("employee" OR "directory")',
  },
  {
    id: 'dork-dlp-financial-invoices',
    name: 'Indexed Invoices & Financial Exports',
    category: 'Sensitive Data & DLP Compliance',
    operatorTemplate:
      'site:{domain} (filetype:pdf OR filetype:xlsx) ("invoice" OR "purchase order" OR "wire transfer" OR "iban")',
    whatItDoes:
      'Surfaces billing statements, purchase orders, or payment forms indexed under public URLs.',
    auditRationale:
      'Prevents financial metadata and vendor banking instructions from leaking via unauthenticated document URLs.',
    supportedPlatforms: ['google', 'bing', 'duckduckgo'],
    sensitivityLevel: 'Regulated',
    defaultFileTypes: ['pdf', 'xlsx'],
    defaultKeywords: ['invoice', 'purchase order'],
    exampleQuery:
      'site:example.com (filetype:pdf OR filetype:xlsx) ("invoice" OR "purchase order")',
  },
  {
    id: 'dork-dlp-robots-disallow',
    name: 'Robots.txt & Sitemap Exposure Review',
    category: 'Sensitive Data & DLP Compliance',
    operatorTemplate:
      'site:{domain} (inurl:"robots.txt" OR inurl:"sitemap.xml")',
    whatItDoes:
      'Retrieves indexed `robots.txt` and `sitemap.xml` manifests to audit which sensitive paths are explicitly listed or disallowed.',
    auditRationale:
      'Listing private admin URLs in `robots.txt` acts as a public directory; sensitive routes should enforce authentication instead.',
    supportedPlatforms: ['google', 'bing', 'wayback'],
    sensitivityLevel: 'Standard',
    defaultInUrl: 'robots.txt',
    exampleQuery: 'site:example.com (inurl:"robots.txt" OR inurl:"sitemap.xml")',
  },
];

export const DEFAULT_SEARCH_PARAMETERS: SearchParameters = {
  targetDomain: '',
  excludeSubdomains: false,
  excludeWww: false,
  pathPrefix: '',
  fileTypes: [],
  inTitle: '',
  inUrl: '',
  inText: '',
  exactPhrase: '',
  excludeTerms: '',
  datePreset: 'any',
  dateAfter: '',
  dateBefore: '',
  resultPositionPreset: 'all',
  resultStartRank: 1,
  resultEndRank: 50,
  language: '',
  country: '',
  countryTldBoost: false,
  booleanMode: 'OR',
  activeKeywords: [],
  activeSensitiveFilterIds: [],
  customRawOverride: '',
  selectedPlatform: 'google',
  activeDorkId: null,
};

export function resolveDateBounds(params: SearchParameters): {
  after: string;
  before: string;
  label: string;
} {
  if (params.datePreset === 'custom') {
    const labelParts: string[] = [];
    if (params.dateAfter) labelParts.push(`From ${params.dateAfter}`);
    if (params.dateBefore) labelParts.push(`To ${params.dateBefore}`);
    return {
      after: params.dateAfter.trim(),
      before: params.dateBefore.trim(),
      label: labelParts.length ? labelParts.join(' · ') : 'Custom',
    };
  }
  if (params.datePreset === 'any') {
    return { after: '', before: '', label: 'Any Time' };
  }
  const now = new Date();
  const daysMap: Record<Exclude<DatePreset, 'any' | 'custom'>, number> = {
    '24h': 1,
    '7d': 7,
    '30d': 30,
    '1y': 365,
  };
  const deltaDays = daysMap[params.datePreset];
  const past = new Date(now.getTime() - deltaDays * 24 * 60 * 60 * 1000);
  const isoAfter = past.toISOString().slice(0, 10);
  const presetLabel =
    DATE_PRESET_OPTIONS.find((d) => d.id === params.datePreset)?.label ||
    params.datePreset;
  return { after: isoAfter, before: '', label: presetLabel };
}

export function resolvePositionWindow(params: SearchParameters): {
  start: number;
  end: number;
  label: string;
} {
  const start = Math.max(1, Number(params.resultStartRank) || 1);
  const end = Math.max(start, Number(params.resultEndRank) || start + 9);
  if (params.resultPositionPreset === 'all') {
    return { start: 1, end: 50, label: 'All Ranks (1–50)' };
  }
  return { start, end, label: `Positions ${start}–${end}` };
}

export function composeDorkQuery(
  params: SearchParameters,
  platformOverride?: PlatformId
): string {
  const platform = platformOverride ?? params.selectedPlatform;

  if (params.customRawOverride.trim()) {
    return params.customRawOverride.trim();
  }

  const parts: string[] = [];
  const cleanDomain = params.targetDomain
    .trim()
    .replace(/^https?:\/\//i, '')
    .replace(/\/.*$/, '');

  // Platform-specific domain operator
  if (cleanDomain) {
    if (platform === 'shodan') {
      parts.push(`hostname:"${cleanDomain}"`);
    } else if (platform === 'github') {
      parts.push(`"${cleanDomain}"`);
    } else if (platform === 'wayback') {
      parts.push(cleanDomain);
    } else {
      parts.push(`site:${cleanDomain}`);
      if (params.excludeWww) {
        parts.push(`-site:www.${cleanDomain}`);
      }
      if (params.excludeSubdomains && !cleanDomain.startsWith('www.')) {
        parts.push(`-inurl:dev -inurl:staging`);
      }
    }
  } else if (params.country && params.countryTldBoost) {
    const matchedCountry = COUNTRY_OPTIONS.find((c) => c.code === params.country);
    if (matchedCountry?.cctld && platform !== 'shodan' && platform !== 'wayback') {
      parts.push(`site:${matchedCountry.cctld}`);
    }
  }

  if (params.country && platform === 'shodan') {
    parts.push(`country:"${params.country.toUpperCase()}"`);
  }

  if (params.pathPrefix.trim()) {
    const cleanPath = params.pathPrefix.trim();
    if (platform === 'github') {
      parts.push(`path:${cleanPath}`);
    } else if (platform === 'shodan') {
      parts.push(`http.html:"${cleanPath}"`);
    } else if (platform !== 'wayback') {
      parts.push(`inurl:"${cleanPath}"`);
    }
  }

  if (params.fileTypes.length > 0 && platform !== 'shodan' && platform !== 'wayback') {
    if (platform === 'github') {
      const extClause = params.fileTypes.map((ft) => `extension:${ft}`).join(' OR ');
      parts.push(params.fileTypes.length > 1 ? `(${extClause})` : extClause);
    } else {
      const ftClause = params.fileTypes.map((ft) => `filetype:${ft}`).join(' OR ');
      parts.push(params.fileTypes.length > 1 ? `(${ftClause})` : ftClause);
    }
  }

  if (params.inTitle.trim()) {
    if (platform === 'shodan') {
      parts.push(`http.title:"${params.inTitle.trim()}"`);
    } else if (platform !== 'github' && platform !== 'wayback') {
      parts.push(`intitle:"${params.inTitle.trim()}"`);
    }
  }

  if (params.inUrl.trim() && platform !== 'shodan' && platform !== 'wayback') {
    if (platform === 'github') {
      parts.push(`path:${params.inUrl.trim()}`);
    } else {
      parts.push(`inurl:"${params.inUrl.trim()}"`);
    }
  }

  if (params.inText.trim()) {
    if (platform === 'bing') {
      parts.push(`inbody:"${params.inText.trim()}"`);
    } else if (platform === 'github' || platform === 'duckduckgo') {
      parts.push(`"${params.inText.trim()}"`);
    } else if (platform === 'shodan') {
      parts.push(`http.html:"${params.inText.trim()}"`);
    } else if (platform !== 'wayback') {
      parts.push(`intext:"${params.inText.trim()}"`);
    }
  }

  if (params.exactPhrase.trim()) {
    parts.push(`"${params.exactPhrase.trim()}"`);
  }

  if (params.activeKeywords.length > 0) {
    const formatted = params.activeKeywords.map((kw) =>
      kw.includes(' ') ? `"${kw}"` : kw
    );
    if (formatted.length === 1) {
      parts.push(formatted[0]);
    } else {
      parts.push(`(${formatted.join(` ${params.booleanMode} `)})`);
    }
  }

  if (params.activeSensitiveFilterIds.length > 0 && platform !== 'wayback') {
    const clauses = params.activeSensitiveFilterIds
      .map((id) => SENSITIVE_DATA_FILTERS.find((f) => f.id === id)?.queryClause)
      .filter((c): c is string => Boolean(c));
    if (clauses.length > 0) {
      parts.push(clauses.join(' '));
    }
  }

  if (params.excludeTerms.trim()) {
    const terms = params.excludeTerms
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    for (const term of terms) {
      parts.push(term.includes(' ') ? `-"${term}"` : `-${term}`);
    }
  }

  const { after, before } = resolveDateBounds(params);
  if (after && (platform === 'google' || platform === 'github')) {
    if (platform === 'github') {
      parts.push(`created:>=${after}`);
    } else {
      parts.push(`after:${after}`);
    }
  }
  if (before && (platform === 'google' || platform === 'github')) {
    if (platform === 'github') {
      parts.push(`created:<=${before}`);
    } else {
      parts.push(`before:${before}`);
    }
  }

  return parts.join(' ').trim();
}

export function buildPlatformSearchUrl(
  query: string,
  platform: PlatformId,
  params?: SearchParameters
): string {
  const q = encodeURIComponent(query || params?.targetDomain || 'security audit');
  const pos = params ? resolvePositionWindow(params) : { start: 1, end: 50 };
  const lang = params?.language || '';
  const country = params?.country || '';
  const datePreset = params?.datePreset || 'any';

  switch (platform) {
    case 'google': {
      const url = new URL('https://www.google.com/search');
      url.searchParams.set('q', query || params?.targetDomain || 'security audit');
      if (pos.start > 1) {
        url.searchParams.set('start', String(pos.start - 1));
      }
      const span = Math.min(100, Math.max(10, pos.end - pos.start + 1));
      if (params && params.resultPositionPreset !== 'all') {
        url.searchParams.set('num', String(span));
      }
      if (lang) {
        url.searchParams.set('lr', `lang_${lang}`);
        url.searchParams.set('hl', lang);
      }
      if (country) {
        url.searchParams.set('cr', `country${country.toUpperCase()}`);
        url.searchParams.set('gl', country);
      }
      if (datePreset === '24h') url.searchParams.set('tbs', 'qdr:d');
      if (datePreset === '7d') url.searchParams.set('tbs', 'qdr:w');
      if (datePreset === '30d') url.searchParams.set('tbs', 'qdr:m');
      if (datePreset === '1y') url.searchParams.set('tbs', 'qdr:y');
      return url.toString();
    }
    case 'bing': {
      const url = new URL('https://www.bing.com/search');
      url.searchParams.set('q', query || params?.targetDomain || 'security audit');
      if (pos.start > 1) {
        url.searchParams.set('first', String(pos.start));
      }
      if (lang) {
        url.searchParams.set('setlang', lang);
      }
      if (country) {
        url.searchParams.set('cc', country.toUpperCase());
      }
      return url.toString();
    }
    case 'duckduckgo': {
      const url = new URL('https://duckduckgo.com/');
      url.searchParams.set('q', query || params?.targetDomain || 'security audit');
      if (country) {
        const ddgLang = lang || 'en';
        url.searchParams.set('kl', `${country}-${ddgLang}`);
      }
      if (datePreset === '24h') url.searchParams.set('df', 'd');
      if (datePreset === '7d') url.searchParams.set('df', 'w');
      if (datePreset === '30d') url.searchParams.set('df', 'm');
      if (datePreset === '1y') url.searchParams.set('df', 'y');
      return url.toString();
    }
    case 'github': {
      const pageNum = Math.max(1, Math.ceil(pos.start / 10));
      return `https://github.com/search?q=${q}&type=code&p=${pageNum}`;
    }
    case 'shodan':
      return `https://www.shodan.io/search?query=${q}`;
    case 'wayback': {
      const target = (params?.targetDomain || query || 'example.com')
        .replace(/^site:/i, '')
        .split(/\s+/)[0];
      return `https://web.archive.org/web/*/${encodeURIComponent(target)}/*`;
    }
  }
}

export function extractDomainFromUrl(urlStr: string): string {
  try {
    const parsed = new URL(urlStr);
    return parsed.hostname;
  } catch {
    return urlStr.replace(/^https?:\/\//i, '').split('/')[0] || 'unknown';
  }
}
