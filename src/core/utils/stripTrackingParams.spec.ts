import { describe, it, expect } from "vitest";
import { stripTrackingParams } from "./stripTrackingParams";

describe("stripTrackingParams", () => {
  it("removes utm_* params (prefix match)", () => {
    const input =
      "https://shop.example/item?utm_source=x&utm_medium=email&utm_campaign=spring&id=5";
    expect(stripTrackingParams(input)).toBe("https://shop.example/item?id=5");
  });

  it("removes well-known click-ids (gclid, fbclid, msclkid, ...)", () => {
    const input = "https://shop.example/p?gclid=a&fbclid=b&msclkid=c&yclid=d&keep=1";
    expect(stripTrackingParams(input)).toBe("https://shop.example/p?keep=1");
  });

  it("removes pk_/piwik_/matomo_ analytics params", () => {
    const input = "https://shop.example/p?pk_campaign=x&matomo_kwd=y&piwik_source=z&ok=1";
    expect(stripTrackingParams(input)).toBe("https://shop.example/p?ok=1");
  });

  it("removes the query string entirely when only tracking params remain", () => {
    expect(stripTrackingParams("https://shop.example/p?utm_source=x&fbclid=y")).toBe(
      "https://shop.example/p",
    );
  });

  it("returns the original string unchanged when there is nothing to strip", () => {
    const input = "https://shop.example/p?id=5&ref=newsletter";
    expect(stripTrackingParams(input)).toBe(input);
  });

  it("does NOT strip functional or affiliate params (tag, scid, q, page)", () => {
    const input = "https://shop.example/search?q=shoes&page=2&tag=aff-22&scid=abc";
    expect(stripTrackingParams(input)).toBe(input);
  });

  it("returns invalid input unchanged", () => {
    expect(stripTrackingParams("not a url")).toBe("not a url");
  });
});
