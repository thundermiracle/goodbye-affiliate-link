import { getAmazonOriginal } from "./getAmazonOriginal";

describe("getAmazonOriginal", () => {
  it("should remove tag parameter", async () => {
    const url = "https://www.amazon.co.jp/dp/B0DJDZRW18?tag=sakurachecker-22";
    const result = await getAmazonOriginal(url);
    expect(result).toBe("https://www.amazon.co.jp/dp/B0DJDZRW18");
  });

  it("should remove both tag and linkCode parameters", async () => {
    const url =
      "https://www.amazon.co.jp/dp/B0DJDZRW18?tag=sakurachecker-22&linkCode=ogi&th=1&psc=1";
    const result = await getAmazonOriginal(url);
    expect(result).toBe("https://www.amazon.co.jp/dp/B0DJDZRW18?th=1&psc=1");
  });

  it("should remove tag when it is not the first parameter", async () => {
    const url =
      "https://www.amazon.co.jp/gp/product/B08JLZV7G1?ref=nosim&tag=example-22&linkCode=ogi";
    const result = await getAmazonOriginal(url);
    expect(result).toBe("https://www.amazon.co.jp/gp/product/B08JLZV7G1?ref=nosim");
  });

  it("should remove the full associate param set (linkId, creative, camp, ascsubtag...)", async () => {
    const url =
      "https://www.amazon.co.jp/dp/B0DJDZRW18?tag=x-22&linkId=abc&creative=123&creativeASIN=B0&camp=247&ascsubtag=sub&th=1";
    const result = await getAmazonOriginal(url);
    expect(result).toBe("https://www.amazon.co.jp/dp/B0DJDZRW18?th=1");
  });

  it("should strip the trailing /ref= attribution path segment", async () => {
    const url = "https://www.amazon.co.jp/dp/B08JLZV7G1/ref=nosim?tag=example-22";
    const result = await getAmazonOriginal(url);
    expect(result).toBe("https://www.amazon.co.jp/dp/B08JLZV7G1");
  });

  it("should work on non-JP amazon domains", async () => {
    const url = "https://www.amazon.com/dp/B08JLZV7G1/ref=as_li_ss_tl?tag=example-20&linkCode=ll1";
    const result = await getAmazonOriginal(url);
    expect(result).toBe("https://www.amazon.com/dp/B08JLZV7G1");
  });

  it("should resolve amzn.asia short links via redirect", async () => {
    const redirectTarget = "https://www.amazon.co.jp/dp/B08JLZV7G1/ref=cm_sw_r_as?tag=test-22";
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(null, {
        status: 301,
        headers: { location: redirectTarget },
      }),
    );
    const result = await getAmazonOriginal("https://amzn.asia/d/abcDEF1");
    expect(result).toBe("https://www.amazon.co.jp/dp/B08JLZV7G1");
  });

  it("should resolve amzn.to short links via redirect", async () => {
    const redirectTarget = "https://www.amazon.co.jp/dp/B08JLZV7G1?tag=test-22&linkCode=ogi";
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(null, {
        status: 301,
        headers: { location: redirectTarget },
      }),
    );
    // resolveRedirects follows the 301 and returns the location
    // Then getAmazonOriginal strips tag and linkCode
    const result = await getAmazonOriginal("https://amzn.to/3abcDEF");
    expect(result).toBe("https://www.amazon.co.jp/dp/B08JLZV7G1");
  });
});
