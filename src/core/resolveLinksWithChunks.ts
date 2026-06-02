import { affiliateMap } from "./affiliateMap";
import { extractEmbeddedUrl } from "./utils/extractEmbeddedUrl";
import { purifyResolvedUrl } from "./utils";

/**
 * break array into chunks
 */
function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

/**
 * break links into chunks and resolve them
 */
export async function resolveLinksWithChunks(
  links: string[],
  chunkSize: number = 5,
): Promise<Record<string, string>> {
  const resolved: Record<string, string> = {};
  const chunks = chunkArray(links, chunkSize);

  for (const chunk of chunks) {
    const promises = chunk.map(async (initialLink) => {
      let currentLink = initialLink;

      for (let i = 0; i < 3; i++) {
        let changed = false;
        for (const [siteName, { isAffiliateLink, getOriginalLink }] of Object.entries(
          affiliateMap,
        )) {
          if (isAffiliateLink(currentLink)) {
            try {
              const nextLink = await getOriginalLink(currentLink);
              if (nextLink !== currentLink) {
                console.log(`[${i + 1}] ${siteName}: ${currentLink} -> ${nextLink}`);
                currentLink = nextLink;
                changed = true;
                break; // Move to next iteration of depth loop with new link
              }
            } catch (e) {
              console.error(`Failed to resolve ${currentLink} for ${siteName}`, e);
              // If error, stop resolving this chain
              return { link: initialLink, original: currentLink };
            }
          }
        }

        // Fallback for unknown/unmapped networks: if no known provider changed
        // the link, try to recover a destination URL embedded directly in the
        // query string. This is offline (no network request, so no phantom
        // clicks) and handles the long tail of redirect wrappers that follow
        // the common `?url=`/`?dest=` convention.
        if (!changed) {
          const embedded = extractEmbeddedUrl(currentLink);
          if (embedded && embedded !== currentLink) {
            console.log(`[${i + 1}] generic: ${currentLink} -> ${embedded}`);
            currentLink = embedded;
            changed = true;
          }
        }

        if (!changed) break; // If no affiliate matched or no change, stop
      }

      const purified = purifyResolvedUrl(currentLink);
      return { link: initialLink, original: purified };
    });

    const results = await Promise.all(promises);
    for (const { link, original } of results) {
      if (link !== original) {
        // console.log(`[resolveLinksWithChunks] DIFF: ${link} !== ${original}`);
        resolved[link] = original;
      } else {
        // console.log(`[resolveLinksWithChunks] SAME: ${link} === ${original}`);
      }
    }
  }

  return resolved;
}
