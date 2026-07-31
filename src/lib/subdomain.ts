const ROOT_DOMAIN = (process.env.ROOT_DOMAIN || "localhost").toLowerCase();

/**
 * Pure string parsing, no I/O - safe to call from Edge Middleware.
 * Returns null when the request is for the bare root domain itself
 * (e.g. the marketing/landing page), not a tenant subdomain.
 */
export function getSubdomainFromHost(hostHeader: string | null): string | null {
  if (!hostHeader) return null;
  const host = hostHeader.split(":")[0].toLowerCase();

  if (host === ROOT_DOMAIN) return null;
  if (host.endsWith(`.${ROOT_DOMAIN}`)) {
    const prefix = host.slice(0, -(ROOT_DOMAIN.length + 1));
    return prefix.split(".")[0] || null;
  }
  return null;
}
