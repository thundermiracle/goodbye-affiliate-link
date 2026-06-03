import { affiliateMap } from "./affiliateMap";
import { getRakutenOriginalOffline } from "./rakuten/getRakutenOriginalOffline";
import { extractEmbeddedUrl } from "./utils/extractEmbeddedUrl";
import { purifyResolvedUrl } from "./utils";

export interface ResolveLinksOptions {
  /**
   * When true, only network-free (offline) resolvers run: no affiliate endpoint
   * is ever contacted, so no affiliate click/conversion is triggered. Opaque
   * redirect links whose destination only exists server-side are left untouched.
   */
  offline?: boolean;
}

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
  options: ResolveLinksOptions = {},
): Promise<Record<string, string>> {
  const { offline = false } = options;
  const resolved: Record<string, string> = {};
  const chunks = chunkArray(links, chunkSize);

  for (const chunk of chunks) {
    const promises = chunk.map(async (initialLink) => {
      let currentLink = initialLink;

      for (let i = 0; i < 3; i++) {
        let changed = false;

        // Known providers may contact the network (follow redirects), so they
        // only run when offline mode is off.
        if (!offline) {
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
        }

        // Network-free extractors. In offline mode these are the ONLY resolvers,
        // so no affiliate endpoint is ever contacted and no click is triggered;
        // opaque links (destination only known server-side) are left untouched.
        // In online mode they act as a fallback for unknown wrappers after the
        // known providers above (the common `?url=`/`?dest=` convention).
        if (!changed) {
          const embedded = extractEmbeddedUrl(currentLink);
          if (embedded && embedded !== currentLink) {
            console.log(`[${i + 1}] generic: ${currentLink} -> ${embedded}`);
            currentLink = embedded;
            changed = true;
          }
        }

        // Rakuten embeds the destination in pc/m params; cover it offline since
        // the generic decoder intentionally excludes such short, ambiguous names.
        if (!changed && offline) {
          const rakuten = getRakutenOriginalOffline(currentLink);
          if (rakuten && rakuten !== currentLink) {
            console.log(`[${i + 1}] rakuten(offline): ${currentLink} -> ${rakuten}`);
            currentLink = rakuten;
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
