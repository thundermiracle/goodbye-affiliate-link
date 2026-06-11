import { stripTrackingParams } from "./stripTrackingParams";

const rakutenHostSuffix = ".rakuten.co.jp";

function isRakutenDomain(hostname: string): boolean {
  return hostname === "rakuten.co.jp" || hostname.endsWith(rakutenHostSuffix);
}

/** Every Amazon retail TLD (amazon.co.jp, amazon.com, amazon.de, ...). */
const amazonHostRegex =
  /(^|\.)amazon\.(com|co\.jp|co\.uk|de|fr|it|es|ca|cn|in|nl|se|pl|sg|ae|sa|eg|com\.au|com\.br|com\.mx|com\.tr|com\.be)$/;

function isAmazonDomain(hostname: string): boolean {
  return amazonHostRegex.test(hostname);
}

/**
 * Amazon Associates attribution params. All are commission/campaign metadata —
 * none affect which product page is shown, so removing them is lossless.
 */
const AMAZON_AFFILIATE_PARAMS = [
  "tag",
  "linkCode",
  "linkId",
  "creative",
  "creativeASIN",
  "camp",
  "ascsubtag",
  "asc_campaign",
  "asc_refurl",
  "asc_source",
];

function purifyResolvedRakutenUrl(url: string, urlObj: URL): string {
  if (!isRakutenDomain(urlObj.hostname)) return url;

  const hasScid = urlObj.searchParams.has("scid");
  const hasSc2id = urlObj.searchParams.has("sc2id");
  if (!hasScid && !hasSc2id) return url;

  urlObj.searchParams.delete("scid");
  urlObj.searchParams.delete("sc2id");
  return urlObj.toString();
}

function purifyResolvedAmazonUrl(url: string, urlObj: URL): string {
  if (!isAmazonDomain(urlObj.hostname)) return url;

  let changed = false;
  for (const param of AMAZON_AFFILIATE_PARAMS) {
    if (urlObj.searchParams.has(param)) {
      urlObj.searchParams.delete(param);
      changed = true;
    }
  }

  // SiteStripe/associate links carry an attribution breadcrumb as the final
  // path segment (/dp/ASIN/ref=nosim, .../ref=as_li_ss_tl). Product pages work
  // identically without it.
  const refMatch = /^(.*)\/ref=[^/]*\/?$/.exec(urlObj.pathname);
  if (refMatch) {
    urlObj.pathname = refMatch[1] || "/";
    changed = true;
  }

  return changed ? urlObj.toString() : url;
}

export function purifyResolvedUrl(url: string): string {
  try {
    // 1. Domain-agnostic: strip well-known tracking query params (utm_*, gclid,
    //    fbclid, ...). 2. Domain-specific affiliate tags (Rakuten, Amazon).
    let result = stripTrackingParams(url);
    result = purifyResolvedRakutenUrl(result, new URL(result));
    result = purifyResolvedAmazonUrl(result, new URL(result));
    return result;
  } catch {
    return url;
  }
}
