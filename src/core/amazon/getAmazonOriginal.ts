import { resolveRedirects } from "../utils";
import { purifyResolvedUrl } from "../utils/purifyResolvedUrl";

/**
 * Get the original URL from an Amazon affiliate link
 * @param url https://www.amazon.co.jp/dp/ASIN/ref=nosim?tag=あなたのID-22,
 *            https://amzn.to/XXXXX or https://amzn.asia/d/XXXXX
 */
export async function getAmazonOriginal(url: string): Promise<string> {
  // Short links (amzn.to / amzn.asia) only reveal the destination via redirect
  if (/^https?:\/\/amzn\.(?:to|asia)\//.test(url)) {
    url = await resolveRedirects(url);
  }

  // Strip the associate tag & friends (full list lives in purifyResolvedUrl)
  return purifyResolvedUrl(url);
}
