const ROOT_DOMAIN = (process.env.ROOT_DOMAIN || "localhost").toLowerCase();

/**
 * Pure string parsing, no I/O - safe to call from Edge Middleware.
 * Returns null when the request is for the bare root domain itself
 * (e.g. the marketing/landing page), not a tenant subdomain.
 */
export function getSubdomainFromHost(hostHeader: string | null): string | null {
  if (!hostHeader) return null;
  const host = hostHeader.split(":")[0].toLowerCase();

  // "www" is conventionally just an alias for the bare root domain, not a
  // tenant name - without this, www.yourdomain.com resolves as an
  // (unknown) organization called "www" and hits the "not found" page
  // instead of the marketing site every bare-domain visitor expects.
  if (host === ROOT_DOMAIN || host === `www.${ROOT_DOMAIN}`) return null;
  if (host.endsWith(`.${ROOT_DOMAIN}`)) {
    const prefix = host.slice(0, -(ROOT_DOMAIN.length + 1));
    return prefix.split(".")[0] || null;
  }
  return null;
}
