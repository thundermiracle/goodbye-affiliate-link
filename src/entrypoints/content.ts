import { SETTINGS_KEYS, loadSettings } from "@/services/settings";
import { createLinkRewriter } from "@/services/rewriteLinks";

// Pure, synchronous, network-free rewriting — resolving every link on the page
// triggers no affiliate clicks/conversions.
const { rewriteAnchor, rewriteWithin } = createLinkRewriter();
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
}

function stopProcessing() {
  if (observer) {
    observer.disconnect();
    observer = null;
  }
}

async function init() {
  const { enabled } = await loadSettings();

  if (enabled !== false) {
    startProcessing();
  }

  chrome.storage.onChanged.addListener((changes) => {
    if (changes[SETTINGS_KEYS.ENABLED]) {
      const isEnabled = changes[SETTINGS_KEYS.ENABLED].newValue === true;
      if (isEnabled) {
        startProcessing();
      } else {
        stopProcessing();
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
