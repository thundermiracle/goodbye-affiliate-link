import { describe, it, expect } from "vitest";
import { purifyResolvedUrl } from "./purifyResolvedUrl";

describe("purifyResolvedUrl", () => {
  it("removes scid and sc2id from rakuten domains", () => {
    const input = "https://www.rakuten.co.jp/item/?scid=abc&sc2id=def&foo=bar";
    expect(purifyResolvedUrl(input)).toBe("https://www.rakuten.co.jp/item/?foo=bar");
  });

  it("keeps non-rakuten domains untouched", () => {
    const input = "https://example.com/?scid=abc&sc2id=def&foo=bar";
    expect(purifyResolvedUrl(input)).toBe(input);
  });

  it("returns original when no target params exist", () => {
    const input = "https://www.rakuten.co.jp/item?foo=bar";
    expect(purifyResolvedUrl(input)).toBe(input);
  });

  it("removes tag and linkCode from amazon domains", () => {
    const input =
      "https://www.amazon.co.jp/dp/B0DJDZRW18?tag=sakurachecker-22&linkCode=ogi&th=1&psc=1";
    expect(purifyResolvedUrl(input)).toBe("https://www.amazon.co.jp/dp/B0DJDZRW18?th=1&psc=1");
  });

  it("keeps non-amazon domains untouched for amazon params", () => {
    const input = "https://example.com/?tag=test-22&linkCode=ogi";
    expect(purifyResolvedUrl(input)).toBe(input);
  });

  it("returns original amazon url when no affiliate params exist", () => {
    const input = "https://www.amazon.co.jp/dp/B0DJDZRW18?th=1&psc=1";
    expect(purifyResolvedUrl(input)).toBe(input);
  });

  it("removes associate params on every amazon TLD", () => {
    expect(purifyResolvedUrl("https://www.amazon.com/dp/B0?tag=x-20&linkId=abc&th=1")).toBe(
      "https://www.amazon.com/dp/B0?th=1",
    );
    expect(purifyResolvedUrl("https://www.amazon.de/dp/B0?tag=x-21&ascsubtag=s")).toBe(
      "https://www.amazon.de/dp/B0",
    );
  });

  it("strips the trailing /ref= attribution path segment on amazon", () => {
    expect(purifyResolvedUrl("https://www.amazon.co.jp/dp/B08JLZV7G1/ref=nosim?tag=x-22")).toBe(
      "https://www.amazon.co.jp/dp/B08JLZV7G1",
    );
    expect(purifyResolvedUrl("https://www.amazon.co.jp/dp/B08JLZV7G1/ref=as_li_ss_tl")).toBe(
      "https://www.amazon.co.jp/dp/B08JLZV7G1",
    );
  });

  it("keeps /ref= path segments on non-amazon domains", () => {
    const input = "https://example.com/dp/B08JLZV7G1/ref=nosim";
    expect(purifyResolvedUrl(input)).toBe(input);
  });

  it("strips generic tracking params on any domain", () => {
    expect(purifyResolvedUrl("https://news.example/article?utm_source=tw&gclid=abc&id=5")).toBe(
      "https://news.example/article?id=5",
    );
  });

  it("strips generic tracking params alongside affiliate params", () => {
    const input = "https://www.amazon.co.jp/dp/B0?tag=aff-22&utm_source=x&fbclid=y&th=1";
    expect(purifyResolvedUrl(input)).toBe("https://www.amazon.co.jp/dp/B0?th=1");
  });
});
