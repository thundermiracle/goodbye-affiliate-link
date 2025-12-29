/**
 * Check if the url is a8net affiliate link
 * @param url https://px.a8.net/svt/ejp?a8mat=XXXXXXXX+YYYYYY+ZZZZ+AAAAAA
 */
export function isA8Net(url: string): boolean {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname;
    const isA8Host = hostname.endsWith(".a8.net");

    if (!isA8Host) return false;
    if (!parsed.pathname.startsWith("/svt/ejp")) return false;

    const a8mat = parsed.searchParams.get("a8mat");
    return Boolean(a8mat);
  } catch {
    return false;
  }
}
