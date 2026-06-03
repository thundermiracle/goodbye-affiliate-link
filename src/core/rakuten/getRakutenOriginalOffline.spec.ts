import { describe, it, expect } from "vitest";
import { getRakutenOriginalOffline } from "./getRakutenOriginalOffline";

describe("getRakutenOriginalOffline", () => {
  it("extracts the destination from the pc param", () => {
    const input =
      "https://hb.afl.rakuten.co.jp/ichiba/abc.def.ghi/?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fshop%2F123&m=https%3A%2F%2Fm.rakuten.co.jp%2Fx";
    expect(getRakutenOriginalOffline(input)).toBe("https://item.rakuten.co.jp/shop/123");
  });

  it("falls back to the m param when pc is absent", () => {
    const input = "https://hb.afl.rakuten.co.jp/ichiba/abc/?m=https%3A%2F%2Fm.rakuten.co.jp%2Fx";
    expect(getRakutenOriginalOffline(input)).toBe("https://m.rakuten.co.jp/x");
  });

  it("returns null for non-rakuten urls", () => {
    expect(getRakutenOriginalOffline("https://example.com/?pc=https://x.example")).toBeNull();
  });

  it("returns null when no destination is embedded (opaque / network-only)", () => {
    expect(getRakutenOriginalOffline("https://hb.afl.rakuten.co.jp/ichiba/abc/")).toBeNull();
  });

  it("ignores non-http pc/m values", () => {
    expect(
      getRakutenOriginalOffline("https://hb.afl.rakuten.co.jp/ichiba/abc/?pc=not-a-url"),
    ).toBeNull();
  });
});
