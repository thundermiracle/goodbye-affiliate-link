import { describe, it, expect } from "vitest";
import { extractEmbeddedUrl } from "./extractEmbeddedUrl";

describe("extractEmbeddedUrl", () => {
  describe("extracts embedded destinations from unknown wrappers", () => {
    it("decodes a percent-encoded url= param", () => {
      const input =
        "https://unknown-asp.example/redirect?url=https%3A%2F%2Fshop.example%2Fitem%2F123";
      expect(extractEmbeddedUrl(input)).toBe("https://shop.example/item/123");
    });

    it("handles double-encoded values", () => {
      const input =
        "https://t.unknown.example/click?u=https%253A%252F%252Fshop.example%252Fp%253Fa%253D1";
      expect(extractEmbeddedUrl(input)).toBe("https://shop.example/p?a=1");
    });

    it("accepts protocol-relative embedded urls", () => {
      const input = "https://go.unknown.example/?to=%2F%2Fshop.example%2Fdeal";
      expect(extractEmbeddedUrl(input)).toBe("https://shop.example/deal");
    });

    it("recognizes various redirect param names", () => {
      const names = ["dest", "destination", "target", "redirect", "out", "goto", "jump", "murl"];
      for (const name of names) {
        const input = `https://wrap.example/go?${name}=https://shop.example/x`;
        expect(extractEmbeddedUrl(input)).toBe("https://shop.example/x");
      }
    });

    it("returns the first matching redirect param", () => {
      const input =
        "https://wrap.example/go?ref=abc&url=https://shop.example/first&dest=https://other.example/second";
      expect(extractEmbeddedUrl(input)).toBe("https://shop.example/first");
    });
  });

  describe("does not rewrite legitimate links (negative cases)", () => {
    it("ignores params whose value is not a URL", () => {
      expect(extractEmbeddedUrl("https://example.com/?u=12345&r=token")).toBeNull();
      expect(extractEmbeddedUrl("https://www.google.com/search?q=hello+world")).toBeNull();
    });

    it("ignores same-host navigation params", () => {
      const input = "https://shop.example/login?redirect=https://shop.example/account";
      expect(extractEmbeddedUrl(input)).toBeNull();
    });

    it("ignores OAuth-style params (redirect_uri/state/next not in the allowlist)", () => {
      const input =
        "https://auth.example/authorize?redirect_uri=https%3A%2F%2Fapp.other.example%2Fcb&state=xyz";
      expect(extractEmbeddedUrl(input)).toBeNull();
    });

    it("skips known social-share / proxy hosts even with a url= param", () => {
      expect(
        extractEmbeddedUrl("https://twitter.com/intent/tweet?url=https://news.example/article"),
      ).toBeNull();
      expect(
        extractEmbeddedUrl("https://www.facebook.com/sharer/sharer.php?u=https://news.example/a"),
      ).toBeNull();
      expect(
        extractEmbeddedUrl("https://b.hatena.ne.jp/entry?url=https://news.example/a"),
      ).toBeNull();
    });

    it("ignores non-redirect param names that happen to carry a URL", () => {
      const input =
        "https://example.com/page?canonical=https://other.example/x&ref=https://y.example";
      expect(extractEmbeddedUrl(input)).toBeNull();
    });

    it("returns null for urls without any query params", () => {
      expect(extractEmbeddedUrl("https://example.com/path")).toBeNull();
    });

    it("returns null for invalid input", () => {
      expect(extractEmbeddedUrl("not a url")).toBeNull();
      expect(extractEmbeddedUrl("")).toBeNull();
    });

    it("ignores non-http(s) embedded values (e.g. javascript:, mailto:)", () => {
      expect(extractEmbeddedUrl("https://wrap.example/go?url=javascript%3Aalert(1)")).toBeNull();
      expect(
        extractEmbeddedUrl("https://wrap.example/go?url=mailto%3Afoo%40bar.example"),
      ).toBeNull();
    });
  });
});
