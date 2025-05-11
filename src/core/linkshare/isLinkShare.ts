/**
 * Check if the url is LinkShare affiliate link
 * @param url http://click.linksynergy.com/fs-bin/click?id=XXXXX&offerid=YYYYY…
 */
export function isLinkShare(url: string): boolean {
    const linkShareRegex = /^https?:\/\/click\.linksynergy\.com\/.*/;
    return linkShareRegex.test(url);
} 