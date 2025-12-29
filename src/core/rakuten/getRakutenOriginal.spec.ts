import { getRakutenOriginal } from "./getRakutenOriginal";

describe("getRakutenOriginal", () => {
  it("should return the review url", async () => {
    const url =
      "https://hb.afl.rakuten.co.jp/hgc/g0190dd6.06slq03a.g0190dd6.06slr0d6/?pc=https%3A%2F%2Fimg.travel.rakuten.co.jp%2Fimage%2Ftr%2Fapi%2Fhs%2FRmfmX%2F%3Ff_hotel_no%3D14241";
    const originalUrl = await getRakutenOriginal(url);
    expect(originalUrl).toBe("https://travel.rakuten.co.jp/HOTEL/14241/review.html");
  });
});
