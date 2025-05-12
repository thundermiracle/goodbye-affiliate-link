import { fixIncompleteUrl } from "./fixIncompleteUrl";
import { resolveRedirects } from "./resolveRedirects";

/**
 * ValueCommerce の referral URL から元リンクを取得する
 * 1. meta リフレッシュから URL を取り出し decodeURIComponent
 * 2. 新たに new URL() して VIEW_URL パラメータを取得、decodeURIComponent
 * 3. 成功すれば返却
 * 4. 失敗時は jsRedirectRegex で JS 内転送先を抽出し resolveRedirects で最終 URL を取得
 */
export async function resolveRedirectsOfValueCommerce(referralUrl: string): Promise<string> {
  // 1. HTML 取得
  const html = await fetch(referralUrl, { credentials: "omit" }).then((r) => r.text());

  // 2. meta refresh で埋め込まれた URL を取得
  const metaRegex =
    /<meta[^>]+http-equiv=["']refresh["'][^>]+content=["'][^;]+;\s*URL=([^"']+)["']/i;
  const metaMatch = metaRegex.exec(html);
  if (metaMatch) {
    const decodedMetaUrl = decodeURIComponent(metaMatch[1]);
    try {
      const uri = new URL(decodedMetaUrl);
      const viewParam = uri.searchParams.get("VIEW_URL");
      if (viewParam) {
        return decodeURIComponent(viewParam);
      }
    } catch {
      // URL パース失敗時はフォールバックへ
    }
  }

  // 3. フォールバック: JS 内の window.location.replace を正規表現で取得
  const jsRedirectRegex = /window\.location\.replace\(\s*['"]([^'"]+)['"]\s*\)/;
  const jsMatch = jsRedirectRegex.exec(html);
  if (jsMatch) {
    const nextUrl = fixIncompleteUrl(jsMatch[1]);
    return await resolveRedirects(nextUrl);
  }

  // 取得できなかった場合
  return referralUrl;
}
