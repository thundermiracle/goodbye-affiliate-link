/**
 * 宛先がサーバー側にしか存在しない「不透明リダイレクト」の既知ホスト。
 * オフラインでは復元できないため、opt-in の hover 解決（Cookieレスの
 * resolveRedirects）でのみ処理される。マーチャントのドメインは絶対に
 * 入れないこと — ここに載ったURLはネットワークで辿られる。
 */
const OPAQUE_REDIRECT_HOSTS: ReadonlyArray<{ host: string; pathPrefix?: string }> = [
  { host: "t.afi-b.com" }, // afb
  { host: "t.felmat.net" }, // felmat
  { host: "click.j-a-net.jp" }, // JANet
  { host: "px.tcs-asp.net" }, // TCSアフィリエイト
  { host: "rentracks.jp", pathPrefix: "/adx/" }, // レントラックス
  { host: "infotop.jp", pathPrefix: "/click" }, // infotop
  { host: "a.r10.to" }, // 楽天アフィリエイト短縮リンク
  { host: "geni.us" }, // Geniuslink
  { host: "hop.clickbank.net" }, // ClickBank
];

function hostMatches(hostname: string, host: string): boolean {
  return hostname === host || hostname.endsWith("." + host);
}

/**
 * Check if the url is a known opaque affiliate redirect
 * @param url https://t.afi-b.com/visit.php?guid=ON&a=XXXXX&p=YYYYY etc.
 */
export function isOpaqueRedirect(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return false;

    const hostname = parsed.hostname.toLowerCase();
    return OPAQUE_REDIRECT_HOSTS.some(
      ({ host, pathPrefix }) =>
        hostMatches(hostname, host) && (!pathPrefix || parsed.pathname.startsWith(pathPrefix)),
    );
  } catch {
    return false;
  }
}
