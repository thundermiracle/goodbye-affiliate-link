import { isOpaqueRedirect } from "./isOpaqueRedirect";

describe("isOpaqueRedirect", () => {
  it.each([
    ["https://t.afi-b.com/visit.php?guid=ON&a=A1234&p=P5678", true],
    ["https://t.felmat.net/fmcl?ak=B1234.5678", true],
    ["https://click.j-a-net.jp/1234567/890123/", true],
    ["https://px.tcs-asp.net/cl/abcd1234/?bId=xyz", true],
    ["https://www.rentracks.jp/adx/r.html?idx=12345.67890", true],
    ["https://www.infotop.jp/click.php?aid=123456&iid=78901", true],
    ["https://a.r10.to/hN1abc", true],
    ["https://geni.us/example", true],
    ["https://hop.clickbank.net/?affiliate=x&vendor=y", true],
    // 対象ホストでもアフィリエイト用パス以外は除外
    ["https://www.rentracks.jp/company/about.html", false],
    ["https://www.infotop.jp/", false],
    // マーチャント・一般サイトは除外
    ["https://www.amazon.co.jp/dp/B08JLZV7G1", false],
    ["https://example.com/visit.php?a=1", false],
    ["not a url", false],
  ])("%s", (url, expected) => {
    expect(isOpaqueRedirect(url)).toBe(expected);
  });
});
