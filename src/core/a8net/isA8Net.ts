/**
 * Check if the url is a8net affiliate link
 * @param url https://px.a8.net/svt/ejp?a8mat=XXXXXXXX+YYYYYY+ZZZZ+AAAAAA
 */
export function isA8Net(url: string): boolean {
    const a8netRegex = /^https?:\/\/(?:[\w-]+\.)?px\.a8\.net\/svt\/ejp\?a8mat=[A-Za-z0-9+%]+/;
    return a8netRegex.test(url);
}
