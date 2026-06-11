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

/** Yahoo!ショッピング系ホスト（store.shopping.yahoo.co.jp 等のサブドメイン含む）。 */
function isYahooShoppingDomain(hostname: string): boolean {
  return (
    hostname === "shopping.yahoo.co.jp" ||
    hostname.endsWith(".shopping.yahoo.co.jp") ||
    hostname === "paypaymall.yahoo.co.jp" ||
    hostname.endsWith(".paypaymall.yahoo.co.jp")
  );
}

/** eBay retail TLDs (for EPN attribution params). */
const ebayHostRegex =
  /(^|\.)ebay\.(com|co\.uk|de|fr|it|es|ca|nl|at|ch|ie|pl|be|com\.au|com\.hk|com\.sg|com\.my|co\.jp|ph)$/;

/** eBay Partner Network / campaign attribution params — not functional. */
const EBAY_AFFILIATE_PARAMS = [
  "mkcid",
  "mkevt",
  "mkrid",
  "mkpid",
  "campid",
  "customid",
  "toolid",
  "ssspo",
  "sssrc",
  "ssuid",
];

/** Delete the given params; returns the original string when nothing matched. */
function deleteParams(url: string, urlObj: URL, params: readonly string[]): string {
  let changed = false;
  for (const param of params) {
    if (urlObj.searchParams.has(param)) {
      urlObj.searchParams.delete(param);
      changed = true;
    }
  }
  return changed ? urlObj.toString() : url;
}

function purifyResolvedRakutenUrl(url: string, urlObj: URL): string {
  if (!isRakutenDomain(urlObj.hostname)) return url;
  return deleteParams(url, urlObj, ["scid", "sc2id"]);
}

function purifyResolvedYahooShoppingUrl(url: string, urlObj: URL): string {
  if (!isYahooShoppingDomain(urlObj.hostname)) return url;
  // sc_e: ValueCommerce経由の帰属タグ (afvc_...) / sc_i: Yahoo内部クリック計測
  return deleteParams(url, urlObj, ["sc_e", "sc_i"]);
}

function purifyResolvedEbayUrl(url: string, urlObj: URL): string {
  if (!ebayHostRegex.test(urlObj.hostname)) return url;
  return deleteParams(url, urlObj, EBAY_AFFILIATE_PARAMS);
}

function purifyResolvedAmazonUrl(url: string, urlObj: URL): string {
  if (!isAmazonDomain(urlObj.hostname)) return url;

  // SiteStripe/associate links carry an attribution breadcrumb as the final
  // path segment (/dp/ASIN/ref=nosim, .../ref=as_li_ss_tl). Product pages work
  // identically without it.
  const refMatch = /^(.*)\/ref=[^/]*\/?$/.exec(urlObj.pathname);
  if (refMatch) {
    urlObj.pathname = refMatch[1] || "/";
    return deleteParams(urlObj.toString(), urlObj, AMAZON_AFFILIATE_PARAMS);
  }

  return deleteParams(url, urlObj, AMAZON_AFFILIATE_PARAMS);
}

export function purifyResolvedUrl(url: string): string {
  try {
    // 1. Domain-agnostic: strip well-known tracking query params (utm_*, gclid,
    //    fbclid, ...). 2. Domain-specific affiliate tags (Rakuten, Amazon,
    //    Yahoo!ショッピング, eBay).
    let result = stripTrackingParams(url);
    result = purifyResolvedRakutenUrl(result, new URL(result));
    result = purifyResolvedAmazonUrl(result, new URL(result));
    result = purifyResolvedYahooShoppingUrl(result, new URL(result));
    result = purifyResolvedEbayUrl(result, new URL(result));
    return result;
  } catch {
    return url;
  }
}
