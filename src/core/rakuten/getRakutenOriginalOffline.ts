import { isRakuten } from "./isRakuten";

/**
 * Rakuten affiliate links (hb.afl.rakuten.co.jp/...) carry the destination URL
 * in the `pc` (PC) / `m` (mobile) query params. This is the pure, offline
 * branch of {@link getRakutenOriginal} — it never touches the network, so it is
 * safe to run during automatic (non-user-initiated) resolution.
 *
 * Returns the destination URL, or null if this is not a Rakuten affiliate link
 * or the destination is not embedded (i.e. it would require a network redirect).
 */
export function getRakutenOriginalOffline(url: string): string | null {
  if (!isRakuten(url)) return null;

  try {
    const urlObj = new URL(url);
    const pc = urlObj.searchParams.get("pc");
    if (pc && /^https?:\/\//i.test(pc)) return pc;

    const m = urlObj.searchParams.get("m");
    if (m && /^https?:\/\//i.test(m)) return m;
  } catch {
    // ignore invalid URL
  }

  return null;
}
