/**
 * 指定 URL を辿って最終的なリダイレクト先 URL を返す
 * @param initialUrl - 最初にアクセスする URL
 * @param maxRedirects - 最大リダイレクト追跡回数（無限ループ防止用）
 */
export async function resolveRedirects(
  initialUrl: string,
  maxRedirects: number = 10,
): Promise<string> {
  let url = initialUrl;

  for (let ind = 0; ind < maxRedirects; ind++) {
    const res = await fetch(url, {
      redirect: "manual",
    });

    console.log(res.status, res);

    // 3xx 系ステータスなら Location ヘッダを取得して次へ
    if (res.status >= 300 && res.status < 400) {
      const location = res.headers.get("location");
      if (!location) break; // ヘッダがなければ終了
      // 相対パス対応のため絶対 URL に変換
      url = new URL(location, url).toString();
      continue;
    }

    // それ以外は最終ページとみなして URL を返す
    // fetch の res.url が更新される環境ならそちらでも OK
    return url;
  }

  // 最大追跡回数オーバーした場合は現在の URL を返す
  return url;
}
