import { resolveRedirects } from "../utils";

/**
 * Get the original URL from a Rakuten affiliate link
 * @param url https://hb.afl.rakuten.co.jp/ichiba/00000000.XXXXXXXX.YYYYYYYY.ZZZZZZZZ/...
 */
export async function getRakutenOriginal(url: string): Promise<string> {
  try {
    const urlObj = new URL(url);
    const pc = urlObj.searchParams.get("pc");
    if (pc) return pc;

    const m = urlObj.searchParams.get("m");
    if (m) return m;
  } catch {
    // ignore
  }

  return await resolveRedirects(url);
}
