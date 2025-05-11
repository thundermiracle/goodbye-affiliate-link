import { resolveRedirects } from "../utils";

/**
 * Get the original URL from an AccessTrade affiliate link
 * @param url https://h.accesstrade.net/sp/cc?rk=XXXXXXXXXXXXXX
 */
export async function getAccessTradeOriginal(url: string): Promise<string> {
  const urlParams = new URL(url);
  const encodedUrl = urlParams.searchParams.get("url");

  if (encodedUrl) {
    return decodeURIComponent(encodedUrl);
  }

  return await resolveRedirects(url);
}
