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

        // offline: true — never contact an affiliate endpoint during automatic
        // resolution, so no phantom clicks/conversions are triggered. Only links
        // whose destination is embedded in the URL are restored; opaque redirect
        // links are left untouched until the user actually clicks them.
        resolveLinksWithChunks(message.links, 5, { offline: true })
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
