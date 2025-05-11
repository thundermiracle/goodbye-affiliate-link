import { isRakuten } from "./isRakuten";

describe("isRakuten", () => {
  it.each([
    ["https://hb.afl.rakuten.co.jp/ichiba/00000000.XXXXXXXX.YYYYYYYY.ZZZZZZZZ/", true],
    ["http://hb.afl.rakuten.co.jp/ichiba/00000000.XXXXXXXX.YYYYYYYY.ZZZZZZZZ/?pc=1", true],
    ["https://hb.afl.rakuten.co.jp/hgc/11111111.22222222.33333333.44444444/", true],
    ["https://www.rakuten.co.jp/item/", false],
    ["https://afl.rakuten.co.jp/ichiba/00000000.XXXXXXXX.YYYYYYYY.ZZZZZZZZ/", false],
  ])("%s", (url, expected) => {
    expect(isRakuten(url)).toBe(expected);
  });
});
