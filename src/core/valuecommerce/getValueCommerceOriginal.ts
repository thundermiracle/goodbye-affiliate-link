import { resolveRedirects } from "../utils";

/**
 * Get the original URL from a ValueCommerce affiliate link
 * @param url https://ck.jp.ap.valuecommerce.com/servlet/referral?sid=1234567&pid=890123
 */
export async function getValueCommerceOriginal(url: string): Promise<string> {
  const urlParams = new URL(url);
  const vcUrl = urlParams.searchParams.get("vc_url");

  if (vcUrl) {
    return decodeURIComponent(vcUrl);
  }

  return await resolveRedirects(url);
}
