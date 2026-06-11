/** Every Amazon retail TLD, matching purifyResolvedUrl's list. */
const amazonHost =
  "amazon\\.(?:com|co\\.jp|co\\.uk|de|fr|it|es|ca|cn|in|nl|se|pl|sg|ae|sa|eg|com\\.au|com\\.br|com\\.mx|com\\.tr|com\\.be)";

// Associate tags end in a numeric locale suffix (-22 JP, -20 US, -21 UK/DE, ...).
const amazonRegex = new RegExp(
  `^https?:\\/\\/(?:[\\w-]+\\.)?${amazonHost}\\/.*[?&]tag=[\\w.-]+-\\d{2}(?:[&#]|$)` +
    `|^https?:\\/\\/amzn\\.(?:to|asia)\\/[A-Za-z0-9]`,
);

/**
 * Check if the url is Amazon affiliate link
 * @param url https://www.amazon.co.jp/dp/ASIN/ref=nosim?tag=あなたのID-22,
 *            https://amzn.to/XXXXX or https://amzn.asia/d/XXXXX
 */
export function isAmazon(url: string): boolean {
  return amazonRegex.test(url);
}
