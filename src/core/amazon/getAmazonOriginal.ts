import { resolveRedirects } from "../utils";

/**
 * Get the original URL from an Amazon affiliate link
 * @param url https://www.amazon.co.jp/dp/ASIN/ref=nosim?tag=あなたのID-22 or https://amzn.to/XXXXX
 */
export async function getAmazonOriginal(url: string): Promise<string> {
  // Handle amzn.to short links
  if (url.startsWith("https://amzn.to/")) {
    url = await resolveRedirects(url);
  }

  // Remove the tag parameter
  const urlObj = new URL(url);
  urlObj.searchParams.delete("tag");
  return urlObj.toString();
}
