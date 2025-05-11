import { getRakutenOriginal } from "./getRakutenOriginal";

describe("getRakutenOriginal", () => {
    it("should return the original URL", async () => {
        const url =
          "https://hb.afl.rakuten.co.jp/hgc/g0190dd6.06slq03a.g0190dd6.06slr0d6/?pc=https%3A%2F%2Fimg.travel.rakuten.co.jp%2Fimage%2Ftr%2Fapi%2Fhs%2FcHNRi%2F%3Ff_no%3D37445%26f_flg%3DPLAN";
        const originalUrl = await getRakutenOriginal(url);
        expect(
          originalUrl.startsWith("https://hotel.travel.rakuten.co.jp/hotelinfo/plan")
        ).toBe(true);
    });
});
