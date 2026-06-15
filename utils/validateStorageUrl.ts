const SUPABASE_STORAGE_HOST = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : null

const BLOCKED_IP_PATTERNS = [
  /^169\.254\./,         // AWS/GCP/Azure metadata
  /^10\./,               // Private class A
  /^172\.(1[6-9]|2\d|3[01])\./,  // Private class B
  /^192\.168\./,         // Private class C
  /^127\./,              // Loopback IPv4
  /^::1$/,               // Loopback IPv6
  /^fc00:/i,             // Unique local IPv6
  /^fe80:/i,             // Link-local IPv6
]

/**
 * Validates that a URL points to Supabase storage and is not a private/metadata address.
 * Throws with a safe message on any violation — call this before any server-side fetch
 * of a caller-supplied URL to prevent SSRF attacks.
 */
export function validateStorageUrl(rawUrl: string): void {
  let parsed: URL
  try {
    parsed = new URL(rawUrl)
  } catch {
    throw new Error('Invalid URL format')
  }

  if (!['https:', 'http:'].includes(parsed.protocol)) {
    throw new Error('Invalid URL protocol')
  }

  const hostname = parsed.hostname.toLowerCase()

  for (const pattern of BLOCKED_IP_PATTERNS) {
    if (pattern.test(hostname)) {
      throw new Error('Invalid URL host')
    }
  }

  if (hostname === 'localhost' || hostname === '0.0.0.0' || hostname === '[::]') {
    throw new Error('Invalid URL host')
  }

  if (SUPABASE_STORAGE_HOST && hostname !== SUPABASE_STORAGE_HOST) {
    throw new Error('URL must point to Supabase storage')
  }
}
