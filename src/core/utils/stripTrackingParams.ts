/**
 * Well-known, tracking-only query parameters that carry no functional meaning
 * for the destination page. Removing them is the "query filtering" equivalent of
 * what Brave / ClearURLs / AdGuard do, and is safe across sites. Affiliate
 * commission tags (Amazon `tag`, Rakuten `scid`) are intentionally NOT here —
 * those are handled per-domain in purifyResolvedUrl, since names like `tag` are
 * too generic to strip globally.
 */
const TRACKING_PARAMS = new Set([
  // Google
  "gclid",
  "gclsrc",
  "dclid",
  "gbraid",
  "wbraid",
  // Meta / Instagram
  "fbclid",
  "igshid",
  "igsh",
  // Microsoft / Yandex
  "msclkid",
  "yclid",
  "ysclid",
  // Mailchimp
  "mc_eid",
  "mc_cid",
  // HubSpot
  "_hsenc",
  "_hsmi",
  // X / TikTok / LinkedIn
  "twclid",
  "ttclid",
  "li_fat_id",
  // Affiliate-network click-ids appended to MERCHANT urls for server-side
  // (cookieless) attribution. Names are network-specific, so removing them
  // globally is safe — and it cuts attribution the cookie cleaner can't reach.
  "srsltid", // Google Merchant Center auto-tagging
  "cjevent", // Commission Junction
  "cjdata",
  "irclickid", // Impact
  "sscid", // ShareASale
  "awc", // Awin
  "ranmid", // Rakuten Advertising / LinkShare deep links
  "raneaid",
  "ransiteid",
  // misc analytics click-ids
  "_openstat",
  "vero_id",
  "vero_conv",
  "oly_anon_id",
  "oly_enc_id",
  "wickedid",
  "rb_clickid",
]);

/** Prefix-matched families (every member is campaign/analytics tracking). */
const TRACKING_PREFIXES = ["utm_", "pk_", "piwik_", "matomo_"];

function isTrackingParam(name: string): boolean {
  const n = name.toLowerCase();
  return TRACKING_PARAMS.has(n) || TRACKING_PREFIXES.some((p) => n.startsWith(p));
}

/**
 * Remove well-known tracking query parameters from any URL. Pure and
 * network-free. Returns the original string unchanged when nothing was removed
 * (so URLs without tracking params are not needlessly re-serialized).
 */
export function stripTrackingParams(url: string): string {
  try {
    const urlObj = new URL(url);
    let changed = false;

    for (const key of [...urlObj.searchParams.keys()]) {
      if (isTrackingParam(key)) {
        urlObj.searchParams.delete(key);
        changed = true;
      }
    }

    return changed ? urlObj.toString() : url;
  } catch {
    return url;
  }
}
