/**
 * Check if the url is AccessTrade affiliate link
 * @param url https://h.accesstrade.net/sp/cc?rk=XXXXXXXXXXXXXX
 */
export function isAccessTrade(url: string): boolean {
  const accessTradeRegex = /^https?:\/\/h\.accesstrade\.net\/sp\/cc\?.*rk=[A-Za-z0-9]+/;
  return accessTradeRegex.test(url);
}
