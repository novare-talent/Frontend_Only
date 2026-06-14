import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

async function verifyToken(authHeader: string | null): Promise<{ userId: string; token: string } | null> {
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7);
  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data.user) return null;
  return { userId: data.user.id, token };
}

async function proxyRequest(
  request: Request,
  method: string,
  backendUrl: string,
  userId: string,
  token: string
) {
  try {
    const contentType = request.headers.get("content-type") ?? "";
    let body: BodyInit | undefined;
    let forwardContentType = contentType || undefined;

    if (method !== "GET" && method !== "DELETE") {
      if (contentType.includes("multipart/form-data")) {
        body = await request.arrayBuffer();
      } else if (
        contentType.includes("application/json") ||
        contentType.includes("application/x-www-form-urlencoded")
      ) {
        let text = await request.text();
        // Inject profile_id from the verified token, overriding any caller-supplied value.
        // This prevents a user from crediting a different account.
        try {
          const parsed = JSON.parse(text);
          parsed.profile_id = userId;
          text = JSON.stringify(parsed);
          forwardContentType = "application/json";
        } catch {
          // Not valid JSON — forward as-is
        }
        body = text;
      } else {
        body = await request.text();
      }
    }

    const response = await fetch(backendUrl, {
      method,
      headers: {
        ...(forwardContentType && { "Content-Type": forwardContentType }),
        // Forward the verified JWT so the Python service can independently validate
        Authorization: `Bearer ${token}`,
        // Also send profile_id as a header for backends that read it from there
        "X-Profile-Id": userId,
      },
      body: body || undefined,
    });

    const responseData = await response.text();
    return new Response(responseData, {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("content-type") ?? "application/json",
      },
    });
  } catch (error) {
    console.error("Payment proxy error:", error);
    return new Response(
      JSON.stringify({ error: "Backend request failed", details: error instanceof Error ? error.message : String(error) }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

function buildBackendUrl(request: Request, pathStr: string): string {
  const { search } = new URL(request.url);
  return `https://payments.novaretalent.com/${pathStr}${search}`;
}

async function handleRequest(
  request: Request,
  method: string,
  params: Promise<{ path: string[] }>
): Promise<Response> {
  const auth = await verifyToken(request.headers.get("authorization"));
  if (!auth) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
  const { path } = await params;
  const backendUrl = buildBackendUrl(request, path.join("/"));
  return proxyRequest(request, method, backendUrl, auth.userId, auth.token);
}

export async function POST(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  return handleRequest(request, "POST", params);
}

export async function GET(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  return handleRequest(request, "GET", params);
}

export async function DELETE(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  return handleRequest(request, "DELETE", params);
}

export async function PUT(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  return handleRequest(request, "PUT", params);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  return handleRequest(request, "PATCH", params);
}
