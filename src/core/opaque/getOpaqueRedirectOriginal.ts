import { resolveRedirects } from "../utils";

/**
 * Get the original URL from a known opaque affiliate redirect by following it
 * cookielessly. Only ever called from the opt-in (resolveOpaque) online path —
 * the offline pipeline never touches these links.
 * @param url https://t.afi-b.com/visit.php?guid=ON&a=XXXXX&p=YYYYY etc.
 */
export async function getOpaqueRedirectOriginal(url: string): Promise<string> {
  return await resolveRedirects(url);
}
