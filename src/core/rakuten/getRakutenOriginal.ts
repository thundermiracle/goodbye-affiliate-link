import { resolveRedirects } from "../utils";

/**
 * Get the original URL from a Rakuten affiliate link
 * @param url https://hb.afl.rakuten.co.jp/ichiba/00000000.XXXXXXXX.YYYYYYYY.ZZZZZZZZ/...
 */
export async function getRakutenOriginal(url: string): Promise<string> {
  return await resolveRedirects(url);
}
