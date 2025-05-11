/**
 * Get the original URL from a Moshimo affiliate link
 * @param url https://af.moshimo.com/af/c/click?a_id=1234&p_id=5678&pc_id=90&pl_id=12&url=https%3A%2F%2F…
 */
export async function getMoshimoOriginal(url: string): Promise<string> {
  const urlParams = new URL(url);
  const encodedUrl = urlParams.searchParams.get("url");
  if (!encodedUrl) {
    throw new Error("No url parameter found in Moshimo affiliate link");
  }
  return decodeURIComponent(encodedUrl);
}
