export const SUBDOMAIN_PATTERN = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;

export const RESERVED_SUBDOMAINS = new Set([
  "www",
  "demo",
  "admin",
  "api",
  "app",
  "platform",
  "mail",
  "ftp",
  "blog",
  "support",
  "help",
  "status",
  "dashboard",
  "staging",
  "test",
]);

export function normalizeSubdomain(raw: string): string {
  return raw.toLowerCase().trim();
}

export function isValidSubdomainFormat(subdomain: string): boolean {
  return SUBDOMAIN_PATTERN.test(subdomain);
}

export function isReservedSubdomain(subdomain: string): boolean {
  return RESERVED_SUBDOMAINS.has(subdomain);
}

/**
 * Slugifies free text (an organization name, a rejected subdomain) into a
 * candidate subdomain base - lowercase, alphanumeric-and-hyphen only, no
 * leading/trailing/doubled hyphens, capped to a sane length.
 */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}
