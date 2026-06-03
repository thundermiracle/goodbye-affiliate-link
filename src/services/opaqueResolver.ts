import type { ResolveAffiliateLinksMessage, ResolveAffiliateLinksResponse } from "@/core";

/**
 * Opt-in resolver for opaque-token affiliate links (destination only known
 * server-side, e.g. A8.net a8mat=). On user intent (hover/focus), it asks the
 * background to resolve the link COOKIELESSLY and rewrites the anchor to the
 * clean destination — so the click lands directly on the merchant with no
 * cookie/click-id attribution (only an IP-residual from the one lookup).
 *
 * Resolution must go through the background: cross-origin fetches from a content
 * script are subject to page CORS, whereas the background has host permissions.
 */
export function createOpaqueResolver() {
  const resolvedCache = new Map<string, string>();
  const inFlight = new Set<string>();
  let listening = false;

  const INTENT_EVENTS = ["pointerover", "focusin", "touchstart", "mousedown"] as const;

  function applyResolved(anchor: HTMLAnchorElement, originalHref: string, resolved: string) {
    if (resolved !== originalHref && anchor.href === originalHref) {
      anchor.href = resolved;
    }
  }

  function resolveAnchor(anchor: HTMLAnchorElement) {
    const href = anchor.href;
    if (!href) return;

    const cached = resolvedCache.get(href);
    if (cached !== undefined) {
      applyResolved(anchor, href, cached);
      return;
    }
    if (inFlight.has(href)) return;
    inFlight.add(href);

    chrome.runtime.sendMessage<ResolveAffiliateLinksMessage, ResolveAffiliateLinksResponse>(
      { type: "RESOLVE_AFFILIATE_LINKS", links: [href] },
      (response) => {
        inFlight.delete(href);
        if (chrome.runtime.lastError || !response) return;

        const resolved = response.resolvedLinks[href] ?? href;
        resolvedCache.set(href, resolved);
        if (resolved !== href) resolvedCache.set(resolved, resolved);
        applyResolved(anchor, href, resolved);
      },
    );
  }

  function handleIntent(event: Event) {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const anchor = target.closest("a");
    if (anchor instanceof HTMLAnchorElement) {
      resolveAnchor(anchor);
    }
  }

  function start() {
    if (listening) return;
    listening = true;
    for (const type of INTENT_EVENTS) {
      document.addEventListener(type, handleIntent, { capture: true, passive: true });
    }
  }

  function stop() {
    if (!listening) return;
    listening = false;
    for (const type of INTENT_EVENTS) {
      document.removeEventListener(type, handleIntent, { capture: true });
    }
  }

  return { start, stop };
}
