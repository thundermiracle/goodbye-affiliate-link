import { describe, it, expect } from "vitest";
import { resolveLinkOffline } from "./resolveLinkOffline";

describe("resolveLinkOffline", () => {
  it("decodes an embedded destination url", () => {
    const input = "https://unknown-asp.example/redirect?url=https%3A%2F%2Fshop.example%2Fitem";
    expect(resolveLinkOffline(input)).toBe("https://shop.example/item");
  });

  it("resolves rakuten pc/m params", () => {
    const input =
      "https://hb.afl.rakuten.co.jp/ichiba/abc/?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fshop%2F1";
    expect(resolveLinkOffline(input)).toBe("https://item.rakuten.co.jp/shop/1");
  });

  it("strips tracking params from the final destination (purify)", () => {
    const input =
      "https://unknown-asp.example/go?url=https%3A%2F%2Fwww.amazon.co.jp%2Fdp%2FB0%3Ftag%3Daff-22%26th%3D1";
    expect(resolveLinkOffline(input)).toBe("https://www.amazon.co.jp/dp/B0?th=1");
  });

  it("follows nested wrappers up to the depth limit", () => {
    const inner = "https://shop.example/item";
    const middle = `https://b.example/r?url=${encodeURIComponent(inner)}`;
    const outer = `https://a.example/r?url=${encodeURIComponent(middle)}`;
    expect(resolveLinkOffline(outer)).toBe(inner);
  });

  it("leaves opaque links unchanged (no network, no trigger)", () => {
    const opaque = "https://px.a8.net/svt/ejp?a8mat=ABC+DEF+GHI+JKL";
    expect(resolveLinkOffline(opaque)).toBe(opaque);
  });

  it("leaves ordinary links unchanged", () => {
    const ordinary = "https://blog.example/article?id=42";
    expect(resolveLinkOffline(ordinary)).toBe(ordinary);
  });
});
