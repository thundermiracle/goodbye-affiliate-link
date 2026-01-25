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
});
