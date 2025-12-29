import { affiliateMap } from "./affiliateMap";

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
    const promises = chunk.map(async (link) => {
      for (const [siteName, { isAffiliateLink, getOriginalLink }] of Object.entries(affiliateMap)) {
        if (isAffiliateLink(link)) {
          try {
            const original = await getOriginalLink(link);
            console.log(`${siteName}: ${link} -> ${original}`);
            return { link, original };
          } catch (e) {
            console.error(`Failed to resolve ${link} for ${siteName}`, e);
            return { link, original: link };
          }
        }
      }
      return { link, original: link };
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
