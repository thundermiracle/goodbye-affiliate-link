import { fixIncompleteUrl, resolveRedirects } from "../utils";
import { getRakutenOriginal } from "../rakuten/getRakutenOriginal";

export async function getA8NetOriginal(url: string): Promise<string> {
  const finalUrl = await getA8NetOriginalInternal(url);
  if (finalUrl.includes("hb.afl.rakuten.co.jp")) {
    return await getRakutenOriginal(finalUrl);
  }

  return finalUrl;
}

async function getA8NetOriginalInternal(url: string): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const res = await fetch(url, {
      redirect: "manual",
      credentials: "omit",
      signal: controller.signal,
    });

    // 3xx Redirect
    if (res.status >= 300 && res.status < 400) {
      const location = res.headers.get("location");
      if (location) {
        const nextUrl = new URL(location, url).toString();
        return resolveRedirects(nextUrl);
      }
    }

    // 200 OK - Check Client-side Redirects
    const html = await res.text();

    // Meta Refresh
    const metaRegex =
      /<meta[^>]+http-equiv=["']refresh["'][^>]+content=["'][^;]+;\s*url=([^"']+)["']/i;
    const metaMatch = metaRegex.exec(html);
    if (metaMatch) {
      const nextUrl = fixIncompleteUrl(metaMatch[1]);
      return resolveRedirects(nextUrl);
    }

    // JS Redirect
    const jsRedirectRegex =
      /window\.location\.replace\(\s*['"]([^'"]+)['"]\s*\)|window\.location\.href\s*=\s*['"]([^'"]+)['"]/;
    const jsMatch = jsRedirectRegex.exec(html);
    if (jsMatch) {
      const nextUrl = fixIncompleteUrl(jsMatch[1] || jsMatch[2]);
      return resolveRedirects(nextUrl);
    }
  } catch (e: unknown) {
    if (e instanceof Error && e.name === "AbortError") {
      console.error(`Request timed out for ${url}`);
    } else {
      console.error(`Failed to fetch ${url}`, e);
    }
    return fallbackToQueryParams(url);
  } finally {
    clearTimeout(timeoutId);
  }

  const controller2 = new AbortController();
  const timeoutId2 = setTimeout(() => controller2.abort(), 5000);
  try {
    const resFollow = await fetch(url, {
      redirect: "follow",
      credentials: "omit",
      signal: controller2.signal,
    });

    // If we were redirected, res.url will be different from the original url
    if (resFollow.url && resFollow.url !== url) {
      return resFollow.url;
    }
  } catch (e) {
    console.error(`Fallback fetch failed for ${url}`, e);
  } finally {
    clearTimeout(timeoutId2);
  }

  return url;
}

function fallbackToQueryParams(url: string): string {
  try {
    const urlObj = new URL(url);
    const searchParams = urlObj.searchParams;

    // Check specific known parameters
    // a8ejpre seems to be used for Rakuten links via A8
    const a8ejpre = searchParams.get("a8ejpre");
    if (a8ejpre) {
      return a8ejpre;
    }

    const a8ejpredirect = searchParams.get("a8ejpredirect");
    if (a8ejpredirect) {
      return a8ejpredirect;
    }

    // Generic check: Look for any param that looks like a URL
    for (const value of searchParams.values()) {
      if (value.startsWith("http") || value.startsWith("https")) {
        return value;
      }
    }
  } catch {
    // ignore invalid URL
  }
  return url;
}
