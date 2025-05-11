/**
 * Check if the url is Amazon affiliate link
 * @param url https://www.amazon.co.jp/dp/ASIN/ref=nosim?tag=あなたのID-22 or https://amzn.to/XXXXX
 */
export function isAmazon(url: string): boolean {
  const amazonRegex =
    /^https?:\/\/(?:www\.)?amazon\.co\.jp\/.*[?&]tag=[A-Za-z0-9_-]+-22|^https?:\/\/amzn\.to\/[A-Za-z0-9]+/;
  return amazonRegex.test(url);
}
