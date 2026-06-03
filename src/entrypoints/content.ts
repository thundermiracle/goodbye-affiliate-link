import { ResolveAffiliateLinksMessage, ResolveAffiliateLinksResponse } from "@/core";
import { SETTINGS_KEYS, loadSettings } from "@/services/settings";

// original href -> resolved href (resolved === original means "checked, no change")
const resolvedCache = new Map<string, string>();
// hrefs with an in-flight resolution request, to avoid duplicate messages
const inFlight = new Set<string>();
let listening = false;

// User-intent events that fire *before* navigation. Hover (pointerover) and
// focus pre-resolve the link so the cleaned href is in place by the time the
// user clicks; mousedown/touchstart are last-resort backstops. All bubble, so a
// single delegated listener on document also covers dynamically-added anchors.
const INTENT_EVENTS = ["pointerover", "focusin", "touchstart", "mousedown"] as const;

function applyResolved(anchor: HTMLAnchorElement, originalHref: string, resolved: string) {
  // Only rewrite if the anchor still points at the original affiliate URL.
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
    {
      type: "RESOLVE_AFFILIATE_LINKS",
      links: [href],
    },
    (response) => {
      inFlight.delete(href);
      if (chrome.runtime.lastError || !response) return;

      const resolved = response.resolvedLinks[href] ?? href;
      resolvedCache.set(href, resolved);
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

function startListening() {
  if (listening) return;
  listening = true;
  for (const type of INTENT_EVENTS) {
    document.addEventListener(type, handleIntent, { capture: true, passive: true });
  }
}

function stopListening() {
  if (!listening) return;
  listening = false;
  for (const type of INTENT_EVENTS) {
    document.removeEventListener(type, handleIntent, { capture: true });
  }
}

async function init() {
  const { enabled } = await loadSettings();

  if (enabled !== false) {
    startListening();
  }

  chrome.storage.onChanged.addListener((changes) => {
    if (changes[SETTINGS_KEYS.ENABLED]) {
      const isEnabled = changes[SETTINGS_KEYS.ENABLED].newValue === true;
      if (isEnabled) {
        startListening();
      } else {
        stopListening();
      }
    }
  });
}

// コンテンツスクリプトのエントリーポイント
export default defineContentScript({
  matches: ["*://*/*"],
  runAt: "document_end",
  main() {
    init();
  },
});
