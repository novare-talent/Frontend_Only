import { createClient } from "@supabase/supabase-js";
import { applyRateLimit, limiters } from "@/utils/rateLimit";

export const maxDuration = 300; // Vercel Pro: up to 300s for long-running evaluations

const SUPABASE_URL = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const PROXY_TIMEOUT_MS = 290_000; // 290s — just under maxDuration

async function verifyToken(authHeader: string | null): Promise<{ token: string; userId: string } | null> {
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7);
  const { data, error } = await createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY).auth.getUser(token);
  if (error || !data.user) return null;
  return { token, userId: data.user.id };
}

async function proxyRequest(
  request: Request,
  method: string,
  backendUrl: string,
  token: string
) {
  try {
    const contentType = request.headers.get('content-type');
    let body: BodyInit | undefined;

    if (method !== 'GET' && method !== 'DELETE') {
      if (contentType?.includes('multipart/form-data')) {
        body = await request.arrayBuffer();
      } else if (contentType?.includes('application/json') || contentType?.includes('application/x-www-form-urlencoded')) {
        body = await request.text();
      } else {
        body = await request.text();
      }
    }

    const response = await fetch(backendUrl, {
      method,
      headers: {
        ...(contentType && { 'Content-Type': contentType }),
        Authorization: `Bearer ${token}`,
      },
      body: body || undefined,
      signal: AbortSignal.timeout(PROXY_TIMEOUT_MS),
    });

    const responseData = await response.text();
    return new Response(responseData, {
      status: response.status,
      headers: { 'Content-Type': response.headers.get('content-type') ?? 'application/json' },
    });
  } catch (error) {
    console.error('Evaluate proxy error:', error);
    return new Response(
      JSON.stringify({ error: 'Backend request failed', details: error instanceof Error ? error.message : String(error) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

async function handleRequest(
  request: Request,
  method: string,
  params: Promise<{ path: string[] }>
): Promise<Response> {
  const verified = await verifyToken(request.headers.get("authorization"));
  if (!verified) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
  const { token, userId } = verified;
  const limited = await applyRateLimit(limiters.evaluateProxy, `eval-proxy:${userId}`);
  if (limited) return limited;
  const { path } = await params;
  const { search } = new URL(request.url);
  const backendUrl = `https://evaluate.novaretalent.com/${path.join('/')}${search}`;
  return proxyRequest(request, method, backendUrl, token);
}

export async function POST(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  return handleRequest(request, 'POST', params);
}

export async function GET(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  return handleRequest(request, 'GET', params);
}

export async function DELETE(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  return handleRequest(request, 'DELETE', params);
}

export async function PUT(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  return handleRequest(request, 'PUT', params);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  return handleRequest(request, 'PATCH', params);
}
