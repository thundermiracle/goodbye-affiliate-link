import { AFFILIATE_COOKIE_DOMAINS, isAffiliateCookieDomain } from "@/core/affiliateCookieDomains";

type CookiesApi = typeof chrome.cookies;

/**
 * Deletes affiliate-network cookies so a later conversion cannot be attributed
 * via a last-click cookie. Only touches domains in AFFILIATE_COOKIE_DOMAINS
 * (network infrastructure), never a merchant's functional cookies. It cannot
 * defeat server-side click-id attribution — that is a known, documented limit.
 *
 * Pure wiring around the injected `cookies` API so it is unit-testable.
 */
export function createCookieCleaner(cookies: CookiesApi) {
  function urlForCookie(cookie: chrome.cookies.Cookie): string {
    const domain = cookie.domain.replace(/^\./, "");
    const scheme = cookie.secure ? "https" : "http";
    return `${scheme}://${domain}${cookie.path || "/"}`;
  }

  function removeCookie(cookie: chrome.cookies.Cookie): void {
    void cookies.remove({
      url: urlForCookie(cookie),
      name: cookie.name,
      storeId: cookie.storeId,
    });
  }

  /** React to a single cookie change (the onChanged event payload). */
  function handleChange(change: chrome.cookies.CookieChangeInfo): void {
    if (change.removed) return; // ignore deletions (including our own)
    if (isAffiliateCookieDomain(change.cookie.domain)) {
      removeCookie(change.cookie);
    }
  }

  /** Sweep any pre-existing affiliate cookies (on startup / on enable). */
  async function clearAll(): Promise<void> {
    for (const domain of AFFILIATE_COOKIE_DOMAINS) {
      try {
        const found = await cookies.getAll({ domain });
        for (const cookie of found) {
          if (isAffiliateCookieDomain(cookie.domain)) {
            removeCookie(cookie);
          }
        }
      } catch {
        // ignore: domain may have no cookies, or a transient API error
      }
    }
  }

  return { handleChange, clearAll, removeCookie, urlForCookie };
}
