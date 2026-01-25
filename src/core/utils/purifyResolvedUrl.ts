const rakutenHostSuffix = ".rakuten.co.jp";

function isRakutenDomain(hostname: string): boolean {
  return hostname === "rakuten.co.jp" || hostname.endsWith(rakutenHostSuffix);
}

function purifyResolvedRakutenUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    if (!isRakutenDomain(urlObj.hostname)) return url;

    const hasScid = urlObj.searchParams.has("scid");
    const hasSc2id = urlObj.searchParams.has("sc2id");
    if (!hasScid && !hasSc2id) return url;

    urlObj.searchParams.delete("scid");
    urlObj.searchParams.delete("sc2id");
    return urlObj.toString();
  } catch {
    return url;
  }
}

export function purifyResolvedUrl(url: string): string {
  return purifyResolvedRakutenUrl(url);
}
