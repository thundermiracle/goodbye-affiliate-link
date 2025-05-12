import { getValueCommerceOriginal } from "./getValueCommerceOriginal";

describe("getValueCommerceOriginal", () => {
  it("should return the original URL", async () => {
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
