import { resolveLinkOffline } from "@/core/resolveLinkOffline";

/**
 * Creates a stateful rewriter that replaces affiliate/redirect anchor hrefs with
 * their offline-resolved destination, in place.
 *
 * Resolution is pure and network-free (see {@link resolveLinkOffline}), so
 * rewriting every link on the page triggers no affiliate clicks/conversions.
 * Results are cached by original href; the resolved URL is also seeded as a
 * no-op so the attribute mutation triggered by rewriting is a cheap cache hit.
 */
export function createLinkRewriter() {
  // original href -> resolved href (resolved === original means "no change")
  const cache = new Map<string, string>();

  function rewriteAnchor(anchor: HTMLAnchorElement): void {
    const href = anchor.href;
    if (!href) return;

    let resolved = cache.get(href);
    if (resolved === undefined) {
      resolved = resolveLinkOffline(href);
      cache.set(href, resolved);
      if (resolved !== href) cache.set(resolved, resolved);
    }

    if (resolved !== href) {
      anchor.href = resolved;
    }
  }

  function rewriteWithin(root: ParentNode): void {
    root.querySelectorAll<HTMLAnchorElement>("a").forEach(rewriteAnchor);
  }

  return { rewriteAnchor, rewriteWithin };
}
