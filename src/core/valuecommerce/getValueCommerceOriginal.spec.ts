import { getValueCommerceOriginal } from "./getValueCommerceOriginal";

describe("getValueCommerceOriginal", () => {
  // Skipped: this hits the live ValueCommerce endpoint over the network, so it
  // fails in any networkless/CI environment and is non-deterministic (depends on
  // VC's current redirect HTML). It also exercises the redirect-following path,
  // which is no longer used in production now that resolution is offline-only.
  // Re-enable with a mocked fetch if/when the online path is reinstated.
  it.skip("should return the original URL (live network)", async () => {
    const url =
      "//ck.jp.ap.valuecommerce.com/servlet/referral?va=2847665&sid=3543619&pid=891659456&position=inline&vcid=vzjzwQ26rSTFfiZy5IsBsui8lZ-rXM3LeUlnuyeuDNM&vcpub=0.865960";
    const originalUrl = await getValueCommerceOriginal(url);
    expect(originalUrl).toBe("https://shopping.yahoo.co.jp/promotion/campaign/ppevr5/?pre=on");
  });

  it("should return the original URL from vc_url", async () => {
    const url =
      "//ck.jp.ap.valuecommerce.com/servlet/referral?vc_url=https://hotel.travel.rakuten.co.jp/hotelinfo/plan";
    const originalUrl = await getValueCommerceOriginal(url);
    expect(originalUrl).toBe("https://hotel.travel.rakuten.co.jp/hotelinfo/plan");
  });
});
