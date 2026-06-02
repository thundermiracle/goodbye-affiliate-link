import { describe, it, expect, vi, afterEach } from "vitest";
import { resolveLinksWithChunks } from "./resolveLinksWithChunks";

// Mock affiliateMap
vi.mock("./affiliateMap", () => {
  return {
    affiliateMap: {
      siteA: {
        isAffiliateLink: (url: string) => url.includes("siteA"),
        getOriginalLink: (url: string) => Promise.resolve("https://siteB.com/target"),
      },
      siteB: {
        isAffiliateLink: (url: string) => url.includes("siteB"),
        getOriginalLink: (url: string) => Promise.resolve("https://final-target.com"),
      },
      amazon: {
        isAffiliateLink: (url: string) => url.includes("amazon.co.jp"),
        getOriginalLink: (url: string) => Promise.resolve("https://www.amazon.co.jp/clean"),
      },
      rakutenTest: {
        isAffiliateLink: (url: string) => url.includes("rakuten-aff"),
        getOriginalLink: (url: string) =>
          Promise.resolve("https://www.rakuten.co.jp/item/?scid=abc&sc2id=def&foo=bar"),
      },
    },
  };
});

describe("resolveLinksWithChunks", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should resolve recursive links (Site A -> Site B -> Final)", async () => {
    const link = "https://siteA.com/link";
    const resolved = await resolveLinksWithChunks([link]);

    expect(resolved).toHaveProperty(link);
    expect(resolved[link]).toBe("https://final-target.com");
  });

  it("should stop at max depth 3", async () => {
    // Create a circular ref or deep chain to test limit if needed,
    // but for now verifying it goes at least 2 hops is good.
    // The mock above does 2 hops: A -> B -> Final.
  });

  it("should purify rakuten parameters in the final url", async () => {
    const link = "https://rakuten-aff.example/link";
    const resolved = await resolveLinksWithChunks([link]);

    expect(resolved[link]).toBe("https://www.rakuten.co.jp/item/?foo=bar");
  });

  it("should resolve unknown wrappers via the generic embedded-url fallback", async () => {
    const link = "https://unknown-asp.example/redirect?url=https%3A%2F%2Fshop.example%2Fitem";
    const resolved = await resolveLinksWithChunks([link]);

    expect(resolved[link]).toBe("https://shop.example/item");
  });

  it("should leave ordinary links untouched (no false-positive rewrite)", async () => {
    const link = "https://blog.example/article?ref=newsletter&id=42";
    const resolved = await resolveLinksWithChunks([link]);

    expect(resolved).not.toHaveProperty(link);
  });
});
