/**
 * Check if the url is Rakuten affiliate link
 * @param url https://hb.afl.rakuten.co.jp/ichiba/00000000.XXXXXXXX.YYYYYYYY.ZZZZZZZZ/...
 */
export function isRakuten(url: string): boolean {
    const rakutenRegex = /^https?:\/\/hb\.afl\.rakuten\.co\.jp\/.*/;
    return rakutenRegex.test(url);
} 