async function proxyRequest(
  request: Request,
  method: string,
  backendUrl: string
) {
  try {
    const contentType = request.headers.get('content-type');
    
    let body: BodyInit | undefined;
    
    if (method !== 'GET' && method !== 'DELETE') {
      // For methods with body (POST, PUT, PATCH)
      if (contentType?.includes('multipart/form-data')) {
        // For FormData, pass the body as binary buffer
        const buffer = await request.arrayBuffer();
        body = buffer;
      } else if (contentType?.includes('application/json') || contentType?.includes('application/x-www-form-urlencoded')) {
        // For JSON and form data, pass as text
        body = await request.text();
      } else {
        // For other content types, read as text
        body = await request.text();
      }
    }

    const response = await fetch(backendUrl, {
      method,
      headers: {
        // Forward original content-type if present
        ...(contentType && { 'Content-Type': contentType }),
      },
      body: body || undefined,
    });

    const responseData = await response.text();
    return new Response(responseData, {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Form Proxy error:', error);
    return new Response(
      JSON.stringify({ error: 'Backend request failed', details: error instanceof Error ? error.message : String(error) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const pathStr = path.join('/');
  const backendUrl = `https://form.novaretalent.com/${pathStr}`;
  return proxyRequest(request, 'POST', backendUrl);
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const pathStr = path.join('/');
  const backendUrl = `https://form.novaretalent.com/${pathStr}`;
  return proxyRequest(request, 'GET', backendUrl);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const pathStr = path.join('/');
  const backendUrl = `https://form.novaretalent.com/${pathStr}`;
  return proxyRequest(request, 'DELETE', backendUrl);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const pathStr = path.join('/');
  const backendUrl = `https://form.novaretalent.com/${pathStr}`;
  return proxyRequest(request, 'PUT', backendUrl);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const pathStr = path.join('/');
  const backendUrl = `https://form.novaretalent.com/${pathStr}`;
  return proxyRequest(request, 'PATCH', backendUrl);
}
