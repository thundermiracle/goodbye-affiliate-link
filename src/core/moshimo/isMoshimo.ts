/**
 * Check if the url is Moshimo affiliate link
 * @param url https://af.moshimo.com/af/c/click?a_id=1234&p_id=5678&pc_id=90&pl_id=12&url=https%3A%2F%2F…
 */
export function isMoshimo(url: string): boolean {
  const moshimoRegex = /^https?:\/\/af\.moshimo\.com\/af\/c\/click\?.*?url=([^&]+)/;
  return moshimoRegex.test(url);
}
