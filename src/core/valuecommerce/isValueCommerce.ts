/**
 * Check if the url is ValueCommerce affiliate link
 * @param url https://ck.jp.ap.valuecommerce.com/servlet/referral?sid=1234567&pid=890123
 */
export function isValueCommerce(url: string): boolean {
    const valueCommerceRegex = /^https?:\/\/ck\.jp\.ap\.valuecommerce\.com\/servlet\/referral\?.*sid=\d+.*pid=\d+/;
    return valueCommerceRegex.test(url);
} 