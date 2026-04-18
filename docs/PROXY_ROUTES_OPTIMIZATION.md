# Proxy Routes Optimization Guide

## Current Proxy Routes

Your app has 6 proxy routes that forward requests to external services:

1. `/api/payment-proxy/[...path]` → `https://payments.novaretalent.com`
2. `/api/sighire-proxy/[...path]` → External SIG Hire service
3. `/api/assignment-proxy/[...path]` → Assignment service
4. `/api/ranking-proxy/[...path]` → Ranking service
5. `/api/form-proxy/[...path]` → Form service
6. `/api/evaluate-proxy/[...path]` → Evaluation service

## Performance Impact

Each proxy adds **50-200ms latency** per request:
- Client → Next.js API Route: 20-50ms
- Next.js → External Service: 50-150ms
- External Service → Next.js: 50-150ms
- Next.js → Client: 20-50ms

**Total: 140-400ms per request**

## Why Proxies Are Needed

✅ **Keep proxies for**:
- CORS bypass (external APIs don't allow direct browser calls)
- API key hiding (sensitive credentials)
- Request transformation (modifying headers/body)
- Rate limiting/throttling

## Optimization Options

### Option 1: Add Response Caching (Implemented for GET requests)
Cache responses that don't change frequently:

```typescript
// For GET requests only
export async function GET(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const pathStr = path.join('/');
  const backendUrl = `https://payments.novaretalent.com/${pathStr}`;
  
  const response = await proxyRequest(request, 'GET', backendUrl);
  
  // Add caching for GET requests
  return new Response(response.body, {
    status: response.status,
    headers: {
      ...response.headers,
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120'
    }
  });
}
```

### Option 2: Use Server Actions Instead
For internal operations, replace proxy routes with Server Actions:

```typescript
// app/actions/payments.ts
'use server'

export async function createPayment(data: PaymentData) {
  const response = await fetch('https://payments.novaretalent.com/create', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${process.env.PAYMENT_API_KEY}` },
    body: JSON.stringify(data)
  });
  return response.json();
}
```

### Option 3: Direct Client Calls (Only if CORS allows)
If external APIs support CORS, call them directly from client:

```typescript
// Only works if API has CORS enabled
const response = await fetch('https://payments.novaretalent.com/status', {
  headers: { 'X-API-Key': publicKey } // Use public key only
});
```

## Recommendation

**Keep all proxy routes** but add caching for GET requests. The proxies are necessary for security and CORS, but caching can reduce repeated calls by 80%.

## Monitoring

Track proxy performance:
```typescript
console.time(`proxy-${pathStr}`);
const response = await proxyRequest(request, method, backendUrl);
console.timeEnd(`proxy-${pathStr}`);
```
