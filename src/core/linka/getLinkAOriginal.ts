import { resolveRedirects } from "../utils";

/**
 * Get the original URL from a Link-A affiliate link
 * @param url https://cl.link-ag.net/... or https://link-a.net/...
 */
export async function getLinkAOriginal(url: string): Promise<string> {
    return await resolveRedirects(url);
} 