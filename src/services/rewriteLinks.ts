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

/**
 * Final safety net for sites that keep a clean href and swap in the affiliate
 * URL only at interaction time (onmousedown / click handlers), defeating
 * one-shot rewriting. Re-running the cached, synchronous offline rewrite during
 * click/auxclick dispatch wins that race: it runs after their swap but before
 * the browser follows the link.
 *
 * Registered in BOTH phases: capture (fires even if a handler later stops
 * propagation) and bubble at the document root (fires after the target's own
 * click handlers, catching swaps done inside them).
 */
export function createClickGuard(rewriteAnchor: (anchor: HTMLAnchorElement) => void) {
  const CLICK_EVENTS = ["click", "auxclick"] as const;
  let listening = false;

  function handleClick(event: Event) {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const anchor = target.closest("a");
    if (anchor instanceof HTMLAnchorElement) {
      rewriteAnchor(anchor);
    }
  }

  function start() {
    if (listening) return;
    listening = true;
    for (const type of CLICK_EVENTS) {
      document.addEventListener(type, handleClick, { capture: true });
      document.addEventListener(type, handleClick, { capture: false });
    }
  }

  function stop() {
    if (!listening) return;
    listening = false;
    for (const type of CLICK_EVENTS) {
      document.removeEventListener(type, handleClick, { capture: true });
      document.removeEventListener(type, handleClick, { capture: false });
    }
  }

  return { start, stop };
}
