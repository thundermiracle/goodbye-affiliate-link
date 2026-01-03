import { describe, it, expect, vi, afterEach } from "vitest";
import { resolveRedirectsOfValueCommerce } from "./resolveRedirectsOfValueCommerce";

// Mock global fetch
const originalFetch = global.fetch;

describe("resolveRedirectsOfValueCommerce", () => {
  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("should return res.url if fetch follows a redirect but HTML has no meta/js redirects", async () => {
    const inputUrl =
      "https://ck.jp.ap.valuecommerce.com/servlet/referral?sid=3554664&pid=887566195";
    const finalUrl = "https://example.com/product/123";

    global.fetch = vi.fn().mockResolvedValue({
      text: async () => "<html><body>No meta refresh or js redirect here</body></html>",
      url: finalUrl,
      ok: true,
      headers: new Headers(),
    } as Response);

    const result = await resolveRedirectsOfValueCommerce(inputUrl);

    expect(result).toBe(finalUrl);
  });
});
