import { resolveRedirects } from "../utils";

export async function getA8NetOriginal(url: string): Promise<string> {
    const originalUrl = await resolveRedirects(url);
    return originalUrl;
}
