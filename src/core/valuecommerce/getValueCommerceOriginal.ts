import { fixIncompleteUrl, resolveRedirectsOfValueCommerce } from "../utils";

/**
 * Get the original URL from a ValueCommerce affiliate link
 * @param url https://ck.jp.ap.valuecommerce.com/servlet/referral?sid=1234567&pid=890123 or //ck.jp.ap.valuecommerce.com/servlet/referral?sid=3543619&pid=891659004
 */
export async function getValueCommerceOriginal(url: string): Promise<string> {
  url = fixIncompleteUrl(url);
  const urlParams = new URL(url);
  const vcUrl = urlParams.searchParams.get("vc_url");

  if (vcUrl) {
    return decodeURIComponent(vcUrl);
  }

  return await resolveRedirectsOfValueCommerce(url);
}
