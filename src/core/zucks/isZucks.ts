/**
 * Check if the url is Zucks affiliate link
 * @param url https://get.mobu.jp/redirect/<ID>
 */
export function isZucks(url: string): boolean {
    const zucksRegex = /^https?:\/\/get\.mobu\.jp(?:\/redirect\/).*/;
    return zucksRegex.test(url);
} 