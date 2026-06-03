import { getRakutenOriginalOffline } from "./rakuten/getRakutenOriginalOffline";
import { extractEmbeddedUrl } from "./utils/extractEmbeddedUrl";
import { purifyResolvedUrl } from "./utils/purifyResolvedUrl";

const MAX_DEPTH = 3;

/**
 * Resolve an affiliate/redirect link to its destination using ONLY network-free
 * (pure) extractors — generic embedded-URL decoding and Rakuten pc/m extraction
 * — followed by tracking-param purification.
 *
 * It never contacts the network, so it never triggers an affiliate
 * click/conversion. This makes it safe to run synchronously and eagerly on
 * every link in the page. Opaque links whose destination only exists
 * server-side (e.g. A8.net a8mat=, Zucks, Link-A) are returned unchanged.
 */
export function resolveLinkOffline(url: string): string {
  let current = url;

  for (let i = 0; i < MAX_DEPTH; i++) {
    const next = extractEmbeddedUrl(current) ?? getRakutenOriginalOffline(current);
    if (!next || next === current) break;
    current = next;
  }

  return purifyResolvedUrl(current);
}
