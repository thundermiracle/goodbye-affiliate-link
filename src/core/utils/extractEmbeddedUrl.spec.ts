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
        "https://t.unknown.example/click?url=https%253A%252F%252Fshop.example%252Fp%253Fa%253D1";
      expect(extractEmbeddedUrl(input)).toBe("https://shop.example/p?a=1");
    });

    it("accepts protocol-relative embedded urls", () => {
      const input = "https://go.unknown.example/?url=%2F%2Fshop.example%2Fdeal";
      expect(extractEmbeddedUrl(input)).toBe("https://shop.example/deal");
    });

    it("recognizes the curated redirect param names", () => {
      const names = ["url", "link", "redirect_url", "rurl", "jump", "murl", "ued", "vc_url"];
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

    it("recognizes network-specific param names (lurl, mpre, urllink, dl_target_url, wgtarget)", () => {
      expect(
        extractEmbeddedUrl(
          "https://al.dmm.co.jp/?lurl=https%3A%2F%2Fwww.dmm.co.jp%2Fdigital%2Fvideoa%2F&af_id=x-001",
        ),
      ).toBe("https://www.dmm.co.jp/digital/videoa/");
      expect(
        extractEmbeddedUrl(
          "https://rover.ebay.com/rover/1/711-1234/1?mpre=https%3A%2F%2Fwww.ebay.com%2Fitm%2F123",
        ),
      ).toBe("https://www.ebay.com/itm/123");
      expect(
        extractEmbeddedUrl(
          "https://track.webgains.com/click.html?wgcampaignid=1&wgtarget=https://shop.example/p",
        ),
      ).toBe("https://shop.example/p");
      expect(
        extractEmbeddedUrl(
          "https://s.click.aliexpress.com/deep_link.htm?aff_short_key=x&dl_target_url=https%3A%2F%2Fwww.aliexpress.com%2Fitem%2F1.html",
        ),
      ).toBe("https://www.aliexpress.com/item/1.html");
    });

    it("accepts scheme-less www. destinations under allowed params (ShareASale urllink)", () => {
      const input =
        "https://www.shareasale.com/r.cfm?b=1&u=2&m=3&urllink=www%2Emerchant%2Eexample%2Fproduct%2F42";
      expect(extractEmbeddedUrl(input)).toBe("https://www.merchant.example/product/42");
    });

    it("extracts CJ path-embedded deep links (/type/dlg/)", () => {
      expect(
        extractEmbeddedUrl(
          "https://www.anrdoezrs.net/links/9041660/type/dlg/https://www.merchant.example/product?a=1",
        ),
      ).toBe("https://www.merchant.example/product?a=1");
      expect(
        extractEmbeddedUrl(
          "https://www.dpbolvw.net/links/123/type/dlg/https%3A%2F%2Fshop.example%2Fp",
        ),
      ).toBe("https://shop.example/p");
    });

    it("extracts Partnerize path-embedded deep links (/destination:)", () => {
      expect(
        extractEmbeddedUrl(
          "https://brand.prf.hn/click/camref:1101abc/destination:https%3A%2F%2Fwww.merchant.example%2Fitem%3Fcolor%3Dred",
        ),
      ).toBe("https://www.merchant.example/item?color=red");
    });

    it("resolves the short `u` param only on curated wrapper hosts (viglink, l.facebook)", () => {
      expect(
        extractEmbeddedUrl(
          "https://redirect.viglink.com/?key=abc&u=https%3A%2F%2Fshop.example%2Fx",
        ),
      ).toBe("https://shop.example/x");
      expect(
        extractEmbeddedUrl(
          "https://l.facebook.com/l.php?u=https%3A%2F%2Fnews.example%2Farticle&h=AT0x",
        ),
      ).toBe("https://news.example/article");
      expect(
        extractEmbeddedUrl("https://l.instagram.com/?u=https%3A%2F%2Fshop.example%2Fp&e=AT1y"),
      ).toBe("https://shop.example/p");
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

    it("ignores ambiguous login/SSO/nav param names even with a cross-host URL", () => {
      // These names are deliberately excluded because login/SSO/OAuth and in-site
      // navigation use them; rewriting would break the flow. All point cross-host
      // to a real http URL, so only the param-name exclusion protects them.
      const excluded = [
        "redirect",
        "u",
        "r",
        "to",
        "go",
        "out",
        "dest",
        "target",
        "goto",
        "destination",
      ];
      for (const name of excluded) {
        const input = `https://site.example/login?${name}=https://app.other.example/dashboard`;
        expect(extractEmbeddedUrl(input)).toBeNull();
      }
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

    it("ignores path markers whose value is not a cross-host URL", () => {
      expect(extractEmbeddedUrl("https://x.example/links/1/type/dlg/12345")).toBeNull();
      expect(
        extractEmbeddedUrl("https://brand.prf.hn/click/camref:1/destination:not-a-url"),
      ).toBeNull();
    });

    it("does not honor `u` on hosts outside the curated override list", () => {
      expect(
        extractEmbeddedUrl("https://unknown.example/out?u=https%3A%2F%2Fshop.example%2Fx"),
      ).toBeNull();
    });

    it("ignores non-http(s) embedded values (e.g. javascript:, mailto:)", () => {
      expect(extractEmbeddedUrl("https://wrap.example/go?url=javascript%3Aalert(1)")).toBeNull();
      expect(
        extractEmbeddedUrl("https://wrap.example/go?url=mailto%3Afoo%40bar.example"),
      ).toBeNull();
    });
  });
});
