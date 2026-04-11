const rakutenHostSuffix = ".rakuten.co.jp";

function isRakutenDomain(hostname: string): boolean {
  return hostname === "rakuten.co.jp" || hostname.endsWith(rakutenHostSuffix);
}

function isAmazonDomain(hostname: string): boolean {
  return hostname === "amazon.co.jp" || hostname.endsWith(".amazon.co.jp");
}

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

  const hasTag = urlObj.searchParams.has("tag");
  const hasLinkCode = urlObj.searchParams.has("linkCode");
  if (!hasTag && !hasLinkCode) return url;

  urlObj.searchParams.delete("tag");
  urlObj.searchParams.delete("linkCode");
  return urlObj.toString();
}

export function purifyResolvedUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    let result = purifyResolvedRakutenUrl(url, urlObj);
    result = purifyResolvedAmazonUrl(result, new URL(result));
    return result;
  } catch {
    return url;
  }
}
