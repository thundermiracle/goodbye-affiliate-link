import { SETTINGS_KEYS, loadSettings } from "@/services/settings";
import { createClickGuard, createLinkRewriter } from "@/services/rewriteLinks";
import { createOpaqueResolver } from "@/services/opaqueResolver";

// Pure, synchronous, network-free rewriting — resolving every link on the page
// triggers no affiliate clicks/conversions.
const { rewriteAnchor, rewriteWithin } = createLinkRewriter();
// Last-moment re-rewrite on click, for sites that swap the href back to the
// affiliate URL on mousedown/click.
const clickGuard = createClickGuard(rewriteAnchor);
// Opt-in: cookieless on-hover resolution of opaque-token links (network).
const opaqueResolver = createOpaqueResolver();
let observer: MutationObserver | null = null;

function observeAnchors() {
  if (!document.body || observer) return;

  observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === "attributes" && mutation.target instanceof HTMLAnchorElement) {
        rewriteAnchor(mutation.target);
        continue;
      }

      mutation.addedNodes.forEach((node) => {
        if (node instanceof HTMLAnchorElement) {
          rewriteAnchor(node);
        } else if (node instanceof HTMLElement) {
          rewriteWithin(node);
        }
      });
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["href"],
  });
}

function startProcessing() {
  rewriteWithin(document);
  observeAnchors();
  clickGuard.start();
}

function stopProcessing() {
  if (observer) {
    observer.disconnect();
    observer = null;
  }
  clickGuard.stop();
}

async function init() {
  const { enabled, resolveOpaque } = await loadSettings();

  if (enabled !== false) {
    startProcessing();
    if (resolveOpaque) opaqueResolver.start();
  }

  chrome.storage.onChanged.addListener((changes) => {
    if (changes[SETTINGS_KEYS.ENABLED]) {
      const isEnabled = changes[SETTINGS_KEYS.ENABLED].newValue === true;
      if (isEnabled) {
        startProcessing();
      } else {
        stopProcessing();
        opaqueResolver.stop();
      }
    }

    if (changes[SETTINGS_KEYS.RESOLVE_OPAQUE]) {
      const on = changes[SETTINGS_KEYS.RESOLVE_OPAQUE].newValue === true;
      if (on) {
        opaqueResolver.start();
      } else {
        opaqueResolver.stop();
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
