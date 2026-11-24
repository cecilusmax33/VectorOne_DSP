import { NextRequest, NextResponse } from 'next/server';

interface ProxyRequest {
  endpointUrl: string;
  method: 'GET' | 'POST';
  authHeaderName?: string;
  authHeaderValue?: string;
  queryParamKey?: string;
  queryValue?: string;
  payload?: Record<string, unknown>;
}

function isBlockedHostname(hostname: string): boolean {
  const lower = hostname.toLowerCase();
  if (
    lower === 'localhost' ||
    lower === '127.0.0.1' ||
    lower === '0.0.0.0' ||
    lower === '::1' ||
    lower.endsWith('.local') ||
    lower.endsWith('.internal')
  ) {
    return true;
  }
  // Block common private IPv4 ranges and cloud metadata IP
  const ipv4Match = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(lower);
  if (ipv4Match) {
    const a = Number(ipv4Match[1]);
    const b = Number(ipv4Match[2]);
    if (a === 10) return true;
    if (a === 127) return true;
    if (a === 169 && b === 254) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
  }
  return false;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ProxyRequest;
    const rawUrl = (body.endpointUrl || '').trim();
    if (!rawUrl) {
      return NextResponse.json(
        { error: 'Endpoint URL is required.' },
        { status: 400 }
      );
    }

    let targetUrl: URL;
    try {
      targetUrl = new URL(rawUrl);
    } catch {
      return NextResponse.json(
        { error: 'Invalid endpoint URL format.' },
        { status: 400 }
      );
    }

    if (targetUrl.protocol !== 'https:' && targetUrl.protocol !== 'http:') {
      return NextResponse.json(
        { error: 'Only HTTP and HTTPS endpoints are supported.' },
        { status: 400 }
      );
    }

    if (isBlockedHostname(targetUrl.hostname)) {
      return NextResponse.json(
        { error: 'Requests to private or loopback addresses are blocked.' },
        { status: 403 }
      );
    }

    const method = body.method === 'POST' ? 'POST' : 'GET';
    const headers: Record<string, string> = {
      Accept: 'application/json, text/plain, */*',
    };

    if (body.authHeaderName && body.authHeaderValue) {
      headers[body.authHeaderName.trim()] = body.authHeaderValue.trim();
    }

    if (method === 'GET' && body.queryParamKey && body.queryValue) {
      targetUrl.searchParams.set(body.queryParamKey, body.queryValue);
    }

    let fetchInit: RequestInit = {
      method,
      headers,
    };

    if (method === 'POST') {
      headers['Content-Type'] = 'application/json';
      fetchInit = {
        method,
        headers,
        body: JSON.stringify(
          body.payload ?? {
            source: 'VectorOne_DSP',
            query: body.queryValue ?? '',
            timestamp: new Date().toISOString(),
          }
        ),
      };
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    try {
      const upstreamRes = await fetch(targetUrl.toString(), {
        ...fetchInit,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const contentType = upstreamRes.headers.get('content-type') || '';
      const rawText = await upstreamRes.text();
      let parsedJson: unknown = null;
      if (contentType.includes('application/json')) {
        try {
          parsedJson = JSON.parse(rawText);
        } catch {
          parsedJson = null;
        }
      }

      return NextResponse.json({
        ok: upstreamRes.ok,
        status: upstreamRes.status,
        statusText: upstreamRes.statusText,
        contentType,
        data: parsedJson ?? rawText.slice(0, 8000),
      });
    } catch (fetchErr: unknown) {
      clearTimeout(timeoutId);
      const msg =
        fetchErr instanceof Error
          ? fetchErr.message
          : 'Failed to connect to external endpoint.';
      return NextResponse.json({ error: msg }, { status: 502 });
    }
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'Invalid integration proxy request.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
