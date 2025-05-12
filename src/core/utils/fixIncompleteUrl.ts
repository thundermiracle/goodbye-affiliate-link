export function fixIncompleteUrl(url: string): string {
  const absoluteUrl = url.startsWith("//") ? "https:" + url : url;

  return absoluteUrl;
}
