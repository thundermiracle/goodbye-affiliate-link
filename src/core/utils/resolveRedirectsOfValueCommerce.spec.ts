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

  it("should extract VIEW_URL from JS redirect URL parameters", async () => {
    const inputUrl =
      "https://ck.jp.ap.valuecommerce.com/servlet/referral?sid=3554664&pid=887566195";

    // JS redirect contains nested VIEW_URL in the u= parameter
    const htmlContent = `<html><head><script>
      window.location.replace("//atrrd.valuecommerce.com/resolve/abc?u=https%3A%2F%2Fvcentry3.valuecommerce.ne.jp%2Fcgi-bin%2F2201292%2F2201292_entry.php%3FVIEW_URL%3Dhttps%253A%252F%252Fshopping.yahoo.co.jp%252F%26vp%3D887566195&_v=1")
    </script></head></html>`;

    global.fetch = vi.fn().mockResolvedValue({
      text: async () => htmlContent,
      url: inputUrl,
      ok: true,
      headers: new Headers(),
    } as Response);

    const result = await resolveRedirectsOfValueCommerce(inputUrl);
    expect(result).toBe("https://shopping.yahoo.co.jp/");
  });

  it("should extract VIEW_URL directly from HTML as last resort", async () => {
    const inputUrl =
      "https://ck.jp.ap.valuecommerce.com/servlet/referral?sid=3554664&pid=887566195";

    // HTML with VIEW_URL embedded but no standard meta refresh or JS redirect patterns
    const htmlContent = `<html><body>
      <div data-url="https://vcentry3.valuecommerce.ne.jp/?VIEW_URL=https%3A%2F%2Fshopping.yahoo.co.jp%2F&other=param"></div>
    </body></html>`;

    global.fetch = vi.fn().mockResolvedValue({
      text: async () => htmlContent,
      url: inputUrl,
      ok: true,
      headers: new Headers(),
    } as Response);

    const result = await resolveRedirectsOfValueCommerce(inputUrl);
    expect(result).toBe("https://shopping.yahoo.co.jp/");
  });

  it("should handle double-encoded VIEW_URL in HTML", async () => {
    const inputUrl =
      "https://ck.jp.ap.valuecommerce.com/servlet/referral?sid=3554664&pid=887566195";

    // Double-encoded VIEW_URL (common in ValueCommerce JS)
    const htmlContent = `<html><body>
      VIEW_URL%3Dhttps%253A%252F%252Fshopping.yahoo.co.jp%252Fpromo%252F
    </body></html>`;

    global.fetch = vi.fn().mockResolvedValue({
      text: async () => htmlContent,
      url: inputUrl,
      ok: true,
      headers: new Headers(),
    } as Response);

    const result = await resolveRedirectsOfValueCommerce(inputUrl);
    expect(result).toBe("https://shopping.yahoo.co.jp/promo/");
  });
});
