import { ResolveAffiliateLinksMessage, ResolveAffiliateLinksResponse } from "@/core";
import { loadSettings } from "@/services/settings";

const resolvedCache = new Map<string, string>();
const pendingLinks = new Set<string>();
let resolveTimer: number | null = null;

function applyResolvedLinks(anchors: HTMLAnchorElement[]) {
  for (const anchor of anchors) {
    const resolved = resolvedCache.get(anchor.href);
    if (resolved && resolved !== anchor.href) {
      anchor.href = resolved;
    } else if (resolved) {
    }
  }
}

function scheduleResolveLinks() {
  if (resolveTimer !== null) return;
  resolveTimer = window.setTimeout(() => {
    resolveTimer = null;
    const links = Array.from(pendingLinks);
    pendingLinks.clear();

    if (links.length === 0) return;

    chrome.runtime.sendMessage<ResolveAffiliateLinksMessage, ResolveAffiliateLinksResponse>(
      {
        type: "RESOLVE_AFFILIATE_LINKS",
        links,
      },
      (response) => {
        if (!response) return;
        for (const link of links) {
          const resolved = response.resolvedLinks[link] ?? link;
          resolvedCache.set(link, resolved);
        }

        applyResolvedLinks(Array.from(document.querySelectorAll<HTMLAnchorElement>("a")));
      },
    );
  }, 150);
}

function enqueueAnchors(anchors: HTMLAnchorElement[]) {
  let hasNewLinks = false;

  for (const anchor of anchors) {
    const link = anchor.href;
    if (!link) continue;

    const resolved = resolvedCache.get(link);
    if (resolved) {
      if (resolved !== link) {
        anchor.href = resolved;
      }
      continue;
    }

    pendingLinks.add(link);
    hasNewLinks = true;
  }

  if (hasNewLinks) {
    scheduleResolveLinks();
  }
}

function observeAnchors() {
  if (!document.body) return;

  const observer = new MutationObserver((mutations) => {
    const anchors: HTMLAnchorElement[] = [];

    for (const mutation of mutations) {
      if (mutation.type === "attributes" && mutation.target instanceof HTMLAnchorElement) {
        anchors.push(mutation.target);
        continue;
      }

      mutation.addedNodes.forEach((node) => {
        if (node instanceof HTMLAnchorElement) {
          anchors.push(node);
          return;
        }

        if (node instanceof HTMLElement) {
          anchors.push(...node.querySelectorAll<HTMLAnchorElement>("a"));
        }
      });
    }

    if (anchors.length > 0) {
      enqueueAnchors(anchors);
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["href"],
  });
}

async function init() {
  const { enabled } = await loadSettings();

  if (enabled === false) {
    return;
  }

  // get all links from document
  const anchorElements = Array.from(document.querySelectorAll<HTMLAnchorElement>("a"));
  enqueueAnchors(anchorElements);
  observeAnchors();
}

// コンテンツスクリプトのエントリーポイント
export default defineContentScript({
  matches: ["*://*/*"],
  runAt: "document_end",
  main() {
    init();
  },
});
