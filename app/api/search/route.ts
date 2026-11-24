import { GoogleGenAI } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

interface GroundedSearchRequest {
  query: string;
  platform?: string;
  targetDomain?: string;
  language?: string;
  country?: string;
  dateAfter?: string;
  dateBefore?: string;
  resultStartRank?: number;
  resultEndRank?: number;
  sensitiveFilters?: string[];
}

interface ParsedFinding {
  rankPosition: number;
  title: string;
  url: string;
  domain: string;
  snippet: string;
  sensitivityHint?: string;
}

function getHostname(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return 'unknown';
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        {
          error:
            'GEMINI_API_KEY is not configured on the server. Add it in Settings > Secrets.',
        },
        { status: 500 }
      );
    }

    const body = (await req.json()) as GroundedSearchRequest;
    const rawQuery = (body.query || '').trim();
    if (!rawQuery) {
      return NextResponse.json(
        { error: 'Search query is required.' },
        { status: 400 }
      );
    }

    const startRank = Math.max(1, Number(body.resultStartRank) || 1);
    const endRank = Math.max(startRank, Number(body.resultEndRank) || 20);

    const constraints: string[] = [];
    if (body.targetDomain) constraints.push(`Target domain scope: ${body.targetDomain}`);
    if (body.language) constraints.push(`Preferred content language code: ${body.language}`);
    if (body.country) constraints.push(`Preferred country/region code: ${body.country.toUpperCase()}`);
    if (body.dateAfter || body.dateBefore) {
      constraints.push(
        `Date window: ${body.dateAfter || 'any'} to ${body.dateBefore || 'present'}`
      );
    }
    constraints.push(`Requested rank window: positions ${startRank} through ${endRank}`);
    if (body.sensitiveFilters?.length) {
      constraints.push(`DLP audit focus: ${body.sensitiveFilters.join(', ')}`);
    }

    const prompt = [
      `Execute a live web search for the following search operator query and summarize the publicly indexed pages found.`,
      `Query: ${rawQuery}`,
      constraints.length ? `Refinement constraints:\n- ${constraints.join('\n- ')}` : '',
      `Provide a concise analytical summary of the publicly visible results, citing their titles, URLs, and observed context for authorized defensive auditing. Do not fabricate URLs—only reference pages verified through Google Search grounding.`,
    ]
      .filter(Boolean)
      .join('\n\n');

    const response = await ai.models.generateContent({
      model: 'gemini-4-hydrogen',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const summaryText = response.text ?? '';
    const candidate = response.candidates?.[0];
    const groundingChunks = candidate?.groundingMetadata?.groundingChunks ?? [];
    const webSearchQueries =
      candidate?.groundingMetadata?.webSearchQueries ?? [];

    const seenUrls = new Set<string>();
    const allGroundedFindings: ParsedFinding[] = [];

    for (const chunk of groundingChunks) {
      const web = chunk.web;
      if (web?.uri && !seenUrls.has(web.uri)) {
        seenUrls.add(web.uri);
        const rank = allGroundedFindings.length + 1;
        allGroundedFindings.push({
          rankPosition: rank,
          title: web.title || getHostname(web.uri),
          url: web.uri,
          domain: getHostname(web.uri),
          snippet:
            `Grounded web result #${rank} returned for query "${rawQuery}".`,
        });
      }
    }

    // Apply requested position window when results exceed startRank, otherwise return available ranked results clearly
    const windowedFindings =
      startRank > 1 && allGroundedFindings.length >= startRank
        ? allGroundedFindings.slice(startRank - 1, endRank)
        : allGroundedFindings.slice(0, Math.max(1, endRank - startRank + 1));

    return NextResponse.json({
      query: rawQuery,
      executedSearchQueries: webSearchQueries,
      summary: summaryText,
      totalGroundedCount: allGroundedFindings.length,
      findings: windowedFindings,
      appliedConstraints: {
        language: body.language || null,
        country: body.country || null,
        dateAfter: body.dateAfter || null,
        dateBefore: body.dateBefore || null,
        startRank,
        endRank,
      },
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'Unexpected server error during grounded search.';
    const status = message.includes('403')
      ? 403
      : message.includes('429')
        ? 429
        : message.includes('400')
          ? 400
          : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
