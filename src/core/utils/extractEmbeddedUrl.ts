import { fixIncompleteUrl } from "./fixIncompleteUrl";

/**
 * リダイレクト/アフィリエイトの「ラッパーURL」が宛先URLを載せるのに使う
 * クエリパラメータ名（小文字）。許可リスト（affiliateMap）に無い未知ネットワークでも、
 * これらの慣習的なパラメータ名に宛先が埋め込まれていればオフラインで復元できる。
 *
 * このデコーダはページ上の全 `<a>` に対して走るため、誤検知は通常リンクの破壊に直結する。
 * そこで「リダイレクト固有性が高い名前」だけに絞り、短く曖昧な名前
 * （u / r / to / go / out / dest / target / redirect / goto / destination 等）は
 * 意図的に除外している。これらは login / SSO / OAuth や同一サイト内ナビゲーションでも
 * 使われ、書き換えるとログインフロー等を壊すため。
 *
 * 強いガードは「値そのものが（別ホストの）絶対 http(s) URL であること」なので、検索語・
 * アカウントID・不透明トークン・相対パスといった値は、たとえ名前が一致しても弾かれる。
 */
const REDIRECT_PARAM_NAMES = new Set([
  "url",
  "link",
  "redirect_url",
  "redirecturl",
  "rurl",
  "jump",
  "murl",
  "ued",
  "vc_url",
  "view_url",
  "a8ejpre",
  "a8ejpredirect",
  // ネットワーク固有だが名前の識別性が高く、グローバル適用しても安全なもの
  "lurl", // DMMアフィリエイト (al.dmm.co.jp/?lurl=...)
  "mpre", // eBay Partner Network (rover.ebay.com ...&mpre=...)
  "urllink", // ShareASale (shareasale.com/r.cfm?...&urllink=...)
  "dl_target_url", // AliExpress (s.click.aliexpress.com/deep_link.htm)
  "wgtarget", // Webgains (track.webgains.com/click.html?...&wgtarget=...)
]);

/**
 * 「u」のような短く曖昧な名前は、グローバルには適用できない（OAuth等を壊す）が、
 * 宛先パラメータであることが確実な特定ホストに限れば安全に復元できる。
 * SNSの outbound クリック計測ラッパー（l.facebook.com 等）もここで剥がす —
 * シェア「インテント」(facebook.com/sharer) と違い、これらは単なる追跡付き
 * リダイレクトなので直リンク化はページを壊さない。
 */
const HOST_PARAM_OVERRIDES = new Map<string, Set<string>>([
  ["redirect.viglink.com", new Set(["u"])], // VigLink / Sovrn
  ["l.facebook.com", new Set(["u"])],
  ["lm.facebook.com", new Set(["u"])],
  ["l.instagram.com", new Set(["u"])],
  ["l.messenger.com", new Set(["u"])],
]);

/**
 * クエリではなくパス末尾に宛先URLを連結する「パス埋め込み」ディープリンク形式。
 * マーカー自体の識別性が高く、抽出値も通常の検証（別ホストの絶対 http(s) URL）を
 * 通すため、ホスト非依存で安全に適用できる。
 *  - CJ (Commission Junction): https://www.anrdoezrs.net/links/<id>/type/dlg/<URL>
 *    (dpbolvw.net / tkqlhce.com / kqzyfj.com / jdoqocy.com も同形式)
 *  - Partnerize: https://<brand>.prf.hn/click/camref:<id>/destination:<URL>
 */
const PATH_EMBED_MARKERS = ["/type/dlg/", "/destination:"];

/**
 * `url=` 系のパラメータを持つが「リダイレクトではない」ホスト
 * （SNSのシェアインテント、リーダー/翻訳プロキシ等）。
 * これらを書き換えるとページが壊れるため、汎用デコーダの対象から外す。
 * affiliateMap に登録された既知プロバイダは引き続き処理される。
 */
const WRAPPER_HOST_DENYLIST = new Set([
  "twitter.com",
  "x.com",
  "facebook.com",
  "www.facebook.com",
  "line.me",
  "social-plugins.line.me",
  "b.hatena.ne.jp",
  "getpocket.com",
  "linkedin.com",
  "www.linkedin.com",
  "pinterest.com",
  "www.pinterest.com",
  "translate.google.com",
  "translate.googleusercontent.com",
]);

/**
 * 多重エンコードに対応して最大3回までデコードする。
 * これ以上変化しない / デコードに失敗した時点で打ち切る。
 */
function decodeMaybe(value: string): string {
  let current = value;
  for (let i = 0; i < 3; i++) {
    let decoded: string;
    try {
      decoded = decodeURIComponent(current);
    } catch {
      break;
    }
    if (decoded === current) break;
    current = decoded;
  }
  return current;
}

/**
 * 候補文字列を検証し、合格すれば正規化済みの宛先URLを返す。
 * 条件: （最大3回デコード後に）絶対 http(s) URL で、ラッパーと異なるホストであること。
 * 同一ホストへの遷移は「次へ」「戻る」等のナビゲーション用パラメータの可能性が高く、
 * アフィリエイトのクロスサイトリダイレクトではないため除外する。
 */
function validateCandidate(rawValue: string, wrapperHost: string): string | null {
  if (!rawValue) return null;

  let candidate = decodeMaybe(rawValue);
  // ShareASale の urllink= 等はスキーム無し（www.merchant.com/...）で宛先を載せる。
  // 許可済みパラメータ/マーカーの値に限った補完なので誤検知リスクは低い。
  if (/^www\./i.test(candidate)) candidate = "https://" + candidate;
  candidate = fixIncompleteUrl(candidate);
  if (!/^https?:\/\//i.test(candidate)) return null;

  let embedded: URL;
  try {
    embedded = new URL(candidate);
  } catch {
    return null;
  }

  if (embedded.hostname.toLowerCase() === wrapperHost) return null;

  return embedded.toString();
}

/**
 * ラッパーURLから、埋め込まれた宛先URLをオフラインで抽出する。
 * ネットワークリクエストを一切発生させない純粋関数。
 *
 * 抽出元は次の3系統（上から順に試す）:
 *  a. グローバル許可リストのクエリパラメータ（REDIRECT_PARAM_NAMES）
 *  b. ホスト限定の短い名前（HOST_PARAM_OVERRIDES — viglink/l.facebook 等の `u`）
 *  c. パス埋め込み形式（PATH_EMBED_MARKERS — CJ `/type/dlg/`、Partnerize `/destination:`）
 *
 * いずれも値が検証（validateCandidate: 別ホストの絶対 http(s) URL）を通った場合のみ返す。
 *
 * @param url 例: https://unknown-asp.example/redirect?url=https%3A%2F%2Fshop.example%2Fitem
 */
export function extractEmbeddedUrl(url: string): string | null {
  let wrapper: URL;
  try {
    wrapper = new URL(url);
  } catch {
    return null;
  }

  const wrapperHost = wrapper.hostname.toLowerCase();
  if (WRAPPER_HOST_DENYLIST.has(wrapperHost)) {
    return null;
  }

  const hostParams = HOST_PARAM_OVERRIDES.get(wrapperHost);

  for (const [name, rawValue] of wrapper.searchParams.entries()) {
    const paramName = name.toLowerCase();
    if (!REDIRECT_PARAM_NAMES.has(paramName) && !hostParams?.has(paramName)) continue;

    const embedded = validateCandidate(rawValue, wrapperHost);
    if (embedded) return embedded;
  }

  for (const marker of PATH_EMBED_MARKERS) {
    const index = url.indexOf(marker);
    if (index === -1) continue;

    const embedded = validateCandidate(url.slice(index + marker.length), wrapperHost);
    if (embedded) return embedded;
  }

  return null;
}
