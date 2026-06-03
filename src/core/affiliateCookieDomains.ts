/**
 * Domains belonging to affiliate NETWORKS (not merchants). Cookies set on these
 * are used purely to attribute affiliate commissions, so deleting them is safe —
 * it does not touch a merchant's functional cookies.
 *
 * IMPORTANT: entries must be affiliate-only infrastructure. Rakuten is listed as
 * `afl.rakuten.co.jp` (the affiliate subdomain) and NOT `rakuten.co.jp`, so we
 * never delete cookies for the Rakuten shopping site itself. Likewise we never
 * list merchant domains (amazon.co.jp, etc.).
 */
export const AFFILIATE_COOKIE_DOMAINS = [
  // Japan
  "a8.net",
  "valuecommerce.com",
  "valuecommerce.ne.jp",
  "accesstrade.net",
  "moshimo.com",
  "afl.rakuten.co.jp", // affiliate subdomain ONLY — never rakuten.co.jp
  "link-a.net",
  "link-ag.net",
  "afi-b.com",
  "felmat.net",
  // Global
  "linksynergy.com", // Rakuten Advertising / LinkShare
  "dpbolvw.net", // Commission Junction
  "anrdoezrs.net",
  "tkqlhce.com",
  "kqzyfj.com",
  "jdoqocy.com",
  "awin1.com", // Awin
  "prf.hn", // Impact / Partnerize
  "shareasale.com",
  "skimresources.com", // Skimlinks
  "go.redirectingat.com",
] as const;

/**
 * True if a cookie's domain belongs to an affiliate network (exact match or a
 * subdomain of a listed domain). Parent/sibling domains do NOT match, so e.g.
 * `rakuten.co.jp` is never matched by `afl.rakuten.co.jp`.
 */
export function isAffiliateCookieDomain(domain: string): boolean {
  const d = domain.replace(/^\./, "").toLowerCase();
  return AFFILIATE_COOKIE_DOMAINS.some((t) => d === t || d.endsWith("." + t));
}
