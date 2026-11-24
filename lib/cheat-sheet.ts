import { PlatformId } from './types';

export interface OperatorCheatSheetItem {
  id: string;
  operator: string;
  category:
    | 'Domain & Scope'
    | 'URL & Title'
    | 'Content & File Type'
    | 'Temporal & Rank'
    | 'Boolean & Precision'
    | 'Diagnostic & Cache';
  summary: string;
  whatItDoes: string;
  example: string;
  exampleExplanation: string;
  platforms: PlatformId[];
  insertSnippet: string;
}

export const OPERATOR_CHEAT_SHEET: OperatorCheatSheetItem[] = [
  {
    id: 'op-site',
    operator: 'site:',
    category: 'Domain & Scope',
    summary: 'Restrict results to a domain, subdomain, or TLD',
    whatItDoes:
      'Limits all search results exclusively to pages, subdomains, or documents hosted under the specified domain or top-level domain.',
    example: 'site:example.com filetype:pdf',
    exampleExplanation:
      'Returns only PDF files indexed anywhere under example.com and its subdomains.',
    platforms: ['google', 'bing', 'duckduckgo'],
    insertSnippet: 'site:example.com',
  },
  {
    id: 'op-exclude-site',
    operator: '-site:',
    category: 'Domain & Scope',
    summary: 'Exclude a primary host or noisy subdomain',
    whatItDoes:
      'Combined with site:, removes a specific subdomain (such as www.) so secondary subdomains and staging hosts surface immediately.',
    example: 'site:example.com -site:www.example.com',
    exampleExplanation:
      'Displays indexed subdomains under example.com while hiding the main www.example.com site.',
    platforms: ['google', 'bing', 'duckduckgo'],
    insertSnippet: '-site:www.example.com',
  },
  {
    id: 'op-filetype',
    operator: 'filetype:',
    category: 'Content & File Type',
    summary: 'Filter results by specific file extension',
    whatItDoes:
      'Narrows results to indexed documents matching a target file format (e.g., pdf, xlsx, csv, docx, sql, log, yaml, env).',
    example: 'site:example.com filetype:xlsx',
    exampleExplanation:
      'Finds publicly indexed Excel spreadsheets hosted on example.com.',
    platforms: ['google', 'bing', 'duckduckgo'],
    insertSnippet: 'filetype:pdf',
  },
  {
    id: 'op-ext',
    operator: 'ext:',
    category: 'Content & File Type',
    summary: 'Alias for filetype: matching file extensions',
    whatItDoes:
      'Behaves identically to filetype: on Google for locating non-HTML files such as configuration, backup, or log artifacts.',
    example: 'site:example.com ext:log OR ext:bak',
    exampleExplanation:
      'Searches example.com for indexed .log or .bak files.',
    platforms: ['google'],
    insertSnippet: 'ext:log',
  },
  {
    id: 'op-inurl',
    operator: 'inurl:',
    category: 'URL & Title',
    summary: 'Match a substring inside the page URL path',
    whatItDoes:
      'Requires the specified keyword or path segment to appear somewhere inside the indexed URL (protocol, host, path, or query string).',
    example: 'site:example.com inurl:swagger',
    exampleExplanation:
      'Locates indexed API documentation pages containing "swagger" in the URL.',
    platforms: ['google', 'bing', 'duckduckgo'],
    insertSnippet: 'inurl:admin',
  },
  {
    id: 'op-allinurl',
    operator: 'allinurl:',
    category: 'URL & Title',
    summary: 'Require multiple keywords inside the URL',
    whatItDoes:
      'Requires every following term in the query to appear in the URL. Best used standalone rather than mixed with other operators.',
    example: 'allinurl:example admin portal',
    exampleExplanation:
      'Finds URLs containing all three tokens: "example", "admin", and "portal".',
    platforms: ['google'],
    insertSnippet: 'allinurl:admin login',
  },
  {
    id: 'op-intitle',
    operator: 'intitle:',
    category: 'URL & Title',
    summary: 'Match a word or phrase inside the HTML <title>',
    whatItDoes:
      'Searches the document <title> tag, ideal for finding directory listings, login screens, or specific dashboard software.',
    example: 'site:example.com intitle:"Index of /"',
    exampleExplanation:
      'Identifies open web directory listings whose page title begins with "Index of /".',
    platforms: ['google', 'bing', 'duckduckgo'],
    insertSnippet: 'intitle:"Index of /"',
  },
  {
    id: 'op-allintitle',
    operator: 'allintitle:',
    category: 'URL & Title',
    summary: 'Require all terms to appear in the page title',
    whatItDoes:
      'Forces every word after the colon to exist within the HTML title element.',
    example: 'allintitle:"Swagger UI" example',
    exampleExplanation:
      'Returns pages whose title contains both "Swagger UI" and "example".',
    platforms: ['google'],
    insertSnippet: 'allintitle:"Admin" "Login"',
  },
  {
    id: 'op-intext',
    operator: 'intext:',
    category: 'Content & File Type',
    summary: 'Match terms within the visible body text',
    whatItDoes:
      'Restricts matching to the body copy of the page or indexed document, ignoring matches that only appear in URLs or titles.',
    example: 'site:example.com intext:"internal use only"',
    exampleExplanation:
      'Locates pages or indexed documents containing the exact phrase "internal use only" inside their body text.',
    platforms: ['google', 'duckduckgo'],
    insertSnippet: 'intext:"confidential"',
  },
  {
    id: 'op-allintext',
    operator: 'allintext:',
    category: 'Content & File Type',
    summary: 'Require all specified keywords in body text',
    whatItDoes:
      'Requires every subsequent keyword to appear in the document body text.',
    example: 'allintext:DB_HOST DB_PASSWORD',
    exampleExplanation:
      'Finds indexed documents containing both DB_HOST and DB_PASSWORD in body content.',
    platforms: ['google'],
    insertSnippet: 'allintext:API_KEY SECRET_KEY',
  },
  {
    id: 'op-exact',
    operator: '"..."',
    category: 'Boolean & Precision',
    summary: 'Exact phrase match without synonym expansion',
    whatItDoes:
      'Forces the search engine to match the exact sequence of words inside quotation marks without stemming or word reordering.',
    example: 'site:example.com "Fatal error:" "on line"',
    exampleExplanation:
      'Pinpoints cached pages displaying literal PHP fatal error strings.',
    platforms: ['google', 'bing', 'duckduckgo', 'github', 'shodan'],
    insertSnippet: '"strictly confidential"',
  },
  {
    id: 'op-or',
    operator: 'OR',
    category: 'Boolean & Precision',
    summary: 'Logical union between alternative terms or operators',
    whatItDoes:
      'Matches results containing either the left or right expression. Must be uppercase OR (or pipe | on Google).',
    example: 'site:example.com (inurl:staging OR inurl:uat)',
    exampleExplanation:
      'Surfaces pages on example.com whose URL contains either "staging" or "uat".',
    platforms: ['google', 'bing', 'duckduckgo', 'github'],
    insertSnippet: '(inurl:staging OR inurl:dev)',
  },
  {
    id: 'op-minus',
    operator: '-term',
    category: 'Boolean & Precision',
    summary: 'Exclude unwanted keywords, hosts, or filetypes',
    whatItDoes:
      'Removes any result containing the prefixed keyword or operator value, reducing false positives in high-volume queries.',
    example: 'site:example.com filetype:pdf -inurl:marketing -brochure',
    exampleExplanation:
      'Lists PDFs on example.com while filtering out marketing brochures.',
    platforms: ['google', 'bing', 'duckduckgo', 'github', 'shodan'],
    insertSnippet: '-marketing',
  },
  {
    id: 'op-wildcard',
    operator: '*',
    category: 'Boolean & Precision',
    summary: 'Single-or-multi-word placeholder wildcard',
    whatItDoes:
      'Acts as a stand-in for unknown words inside an exact phrase or subdomain prefix.',
    example: 'site:*.example.com "powered by *"',
    exampleExplanation:
      'Finds subdomains of example.com containing any software attribution phrase.',
    platforms: ['google', 'bing'],
    insertSnippet: 'site:*.example.com',
  },
  {
    id: 'op-parens',
    operator: '( ... )',
    category: 'Boolean & Precision',
    summary: 'Group complex boolean expressions',
    whatItDoes:
      'Controls operator precedence when combining multiple OR clauses with AND conditions like site: or filetype:.',
    example: 'site:example.com (filetype:pdf OR filetype:xlsx) (invoice OR payroll)',
    exampleExplanation:
      'Matches PDF or Excel files on example.com that also mention invoice or payroll.',
    platforms: ['google', 'bing', 'duckduckgo', 'github'],
    insertSnippet: '(filetype:pdf OR filetype:xlsx)',
  },
  {
    id: 'op-after',
    operator: 'after:',
    category: 'Temporal & Rank',
    summary: 'Filter pages indexed or published after a date',
    whatItDoes:
      'Restricts search results to content indexed or dated after the specified YYYY-MM-DD (or YYYY) timestamp.',
    example: 'site:example.com filetype:pdf after:2026-01-01',
    exampleExplanation:
      'Returns PDFs on example.com indexed or published since January 1, 2026.',
    platforms: ['google'],
    insertSnippet: 'after:2026-01-01',
  },
  {
    id: 'op-before',
    operator: 'before:',
    category: 'Temporal & Rank',
    summary: 'Filter pages indexed or published before a date',
    whatItDoes:
      'Restricts search results to content indexed or dated prior to YYYY-MM-DD, useful for auditing legacy artifacts.',
    example: 'site:example.com inurl:legacy before:2023-01-01',
    exampleExplanation:
      'Finds legacy URLs on example.com dated before 2023.',
    platforms: ['google'],
    insertSnippet: 'before:2025-01-01',
  },
  {
    id: 'op-inbody',
    operator: 'inbody:',
    category: 'Content & File Type',
    summary: 'Bing equivalent of intext: for body content',
    whatItDoes:
      'Matches words specifically inside the page body on Bing search queries.',
    example: 'site:example.com inbody:"API Documentation"',
    exampleExplanation:
      'Finds pages on example.com mentioning "API Documentation" in Bing body text.',
    platforms: ['bing'],
    insertSnippet: 'inbody:"confidential"',
  },
  {
    id: 'op-github-path-ext',
    operator: 'path: / extension:',
    category: 'Domain & Scope',
    summary: 'GitHub code search file path & extension filters',
    whatItDoes:
      'Targets specific repository paths or file extensions when auditing public code references on GitHub.',
    example: '"example.com" extension:env OR path:.github/workflows',
    exampleExplanation:
      'Searches public GitHub code mentioning example.com inside .env or GitHub Actions workflow files.',
    platforms: ['github'],
    insertSnippet: 'extension:env',
  },
  {
    id: 'op-shodan-country',
    operator: 'hostname: / country:',
    category: 'Diagnostic & Cache',
    summary: 'Shodan host and ISO country asset filters',
    whatItDoes:
      'Scans Shodan host records by DNS hostname, HTTP title, or two-letter ISO country code.',
    example: 'hostname:"example.com" country:"US"',
    exampleExplanation:
      'Lists Shodan-indexed services matching example.com hosted in the United States.',
    platforms: ['shodan'],
    insertSnippet: 'country:"US"',
  },
];
