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
    expect(purifyResolvedUrl(input)).toBe(
      "https://www.amazon.co.jp/dp/B0DJDZRW18?th=1&psc=1",
    );
  });

  it("keeps non-amazon domains untouched for amazon params", () => {
    const input = "https://example.com/?tag=test-22&linkCode=ogi";
    expect(purifyResolvedUrl(input)).toBe(input);
  });

  it("returns original amazon url when no affiliate params exist", () => {
    const input = "https://www.amazon.co.jp/dp/B0DJDZRW18?th=1&psc=1";
    expect(purifyResolvedUrl(input)).toBe(input);
  });
});
