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
]);

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
 * ラッパーURLのクエリパラメータから、埋め込まれた宛先URLをオフラインで抽出する。
 * ネットワークリクエストを一切発生させない純粋関数。
 *
 * 以下を全て満たす場合のみ宛先を返す（さもなくば null）:
 *  1. URL としてパースできる
 *  2. ホストが除外リストに無い
 *  3. リダイレクト系のパラメータ名を持つ
 *  4. その値が（最大3回デコード後に）絶対 http(s) URL である
 *  5. 抽出先のホストがラッパーと異なる（同一サイト内ナビゲーション用パラメータの誤検知防止）
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

  for (const [name, rawValue] of wrapper.searchParams.entries()) {
    if (!REDIRECT_PARAM_NAMES.has(name.toLowerCase())) continue;
    if (!rawValue) continue;

    const candidate = fixIncompleteUrl(decodeMaybe(rawValue));
    if (!/^https?:\/\//i.test(candidate)) continue;

    let embedded: URL;
    try {
      embedded = new URL(candidate);
    } catch {
      continue;
    }

    // 同一ホストへの遷移は「次へ」「戻る」等のナビゲーション用パラメータの可能性が高く、
    // アフィリエイトのクロスサイトリダイレクトではないため除外する。
    if (embedded.hostname.toLowerCase() === wrapperHost) {
      continue;
    }

    return embedded.toString();
  }

  return null;
}
