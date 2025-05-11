import { resolveRedirects } from "../utils";

/**
 * Get the original URL from a LinkShare affiliate link
 * @param url http://click.linksynergy.com/fs-bin/click?id=XXXXX&offerid=YYYYY…
 */
export async function getLinkShareOriginal(url: string): Promise<string> {
  return await resolveRedirects(url);
}
