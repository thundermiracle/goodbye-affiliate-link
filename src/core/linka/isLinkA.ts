/**
 * Check if the url is Link-A affiliate link
 * @param url https://cl.link-ag.net/... or https://link-a.net/...
 */
export function isLinkA(url: string): boolean {
    const linkARegex = /^https?:\/\/(?:(?:cl\.)?link-ag\.net|link-a\.net)\/.*/;
    return linkARegex.test(url);
} 