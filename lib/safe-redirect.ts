/**
 * Returns `target` only if it is a same-origin relative path, otherwise
 * `fallback`. Blocks open redirects such as `//evil.com`, `/\evil.com` and
 * absolute URLs.
 */
export function safeRedirectPath(
  target: string | null | undefined,
  fallback = "/"
): string {
  if (!target) return fallback;
  if (!target.startsWith("/")) return fallback;
  if (target.startsWith("//") || target.includes("\\")) return fallback;
  for (let i = 0; i < target.length; i++) {
    if (target.charCodeAt(i) < 0x20) return fallback; // control chars / CRLF
  }
  return target;
}
