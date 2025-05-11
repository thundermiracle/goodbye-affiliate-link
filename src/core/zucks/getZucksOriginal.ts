import { resolveRedirects } from "../utils";

/**
 * Get the original URL from a Zucks affiliate link
 * @param url https://get.mobu.jp/redirect/<ID>
 */
export async function getZucksOriginal(url: string): Promise<string> {
  return await resolveRedirects(url);
}
