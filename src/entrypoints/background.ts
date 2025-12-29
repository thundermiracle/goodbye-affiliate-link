import {
  ResolveAffiliateLinksMessage,
  ResolveAffiliateLinksResponse,
  resolveLinksWithChunks,
} from "@/core";

export default defineBackground(() => {
  console.log("Goodbye Affiliate Link: Background script loaded!", {
    id: browser.runtime.id,
  });

  chrome.runtime.onMessage.addListener(
    (
      message: ResolveAffiliateLinksMessage,
      _sender,
      sendResponse: (response: ResolveAffiliateLinksResponse) => void,
    ) => {
      if (message.type === "RESOLVE_AFFILIATE_LINKS") {
        console.log("Goodbye Affiliate Link: Resolving affiliate links!", {
          links: message.links,
        });

        resolveLinksWithChunks(message.links)
          .then((resolvedLinks) => {
            sendResponse({ resolvedLinks });
          })
          .catch((error) => {
            console.error("Goodbye Affiliate Link: Failed to resolve links", error);
            sendResponse({ resolvedLinks: {} }); // Send empty response to avoid hanging
          });
      }

      return true;
    },
  );
});
