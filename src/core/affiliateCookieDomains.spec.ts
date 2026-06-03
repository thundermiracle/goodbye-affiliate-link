import { describe, it, expect } from "vitest";
import { isAffiliateCookieDomain } from "./affiliateCookieDomains";

describe("isAffiliateCookieDomain", () => {
  it("matches affiliate-network domains and their subdomains", () => {
    for (const d of [
      "a8.net",
      ".a8.net",
      "px.a8.net",
      "valuecommerce.com",
      "ck.jp.ap.valuecommerce.com",
      "accesstrade.net",
      "moshimo.com",
      "afl.rakuten.co.jp",
      "hb.afl.rakuten.co.jp",
      ".afl.rakuten.co.jp",
      "linksynergy.com",
      "click.linksynergy.com",
    ]) {
      expect(isAffiliateCookieDomain(d)).toBe(true);
    }
  });

  it("does NOT match merchant / functional domains", () => {
    for (const d of [
      "rakuten.co.jp", // shopping site — must be preserved
      "www.rakuten.co.jp",
      ".rakuten.co.jp",
      "item.rakuten.co.jp",
      "amazon.co.jp",
      "www.amazon.co.jp",
      "example.com",
      "google.com",
      "not-a8.net", // not a subdomain of a8.net
      "fakea8.net",
    ]) {
      expect(isAffiliateCookieDomain(d)).toBe(false);
    }
  });
});
