// @vitest-environment node
import { describe, it, expect, vi, afterEach } from "vitest";
import { resolveRedirectsOfValueCommerce } from "../utils/resolveRedirectsOfValueCommerce";

// Mock global fetch
const originalFetch = global.fetch;

describe("resolveRedirectsOfValueCommerce real html reproduction", () => {
  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("should parse complex JS redirect or meta refresh from actual ValueCommerce HTML", async () => {
    const inputUrl =
      "https://ck.jp.ap.valuecommerce.com/servlet/referral?sid=3554664&pid=887566195";
    const expectedUrl = "https://shopping.yahoo.co.jp/";

    const htmlContent = `<html><head><script><!--
function vcResolveRd(){function u(g,n){"undefined"!==typeof g?(n.style.display="none",document.getElementsByTagName("body")[0].appendChild(n),window.location.replace("//atrrd.valuecommerce.com/resolve/666ccdeb1f6?u=https%3A%2F%2Fvcentry3.valuecommerce.ne.jp%2Fcgi-bin%2F2201292%2F2201292_entry.php%3FITRACK_INFO%3D088756619502695953260103031808%26COOKIE_PATH%3D%2F%26COOKIE_DOMAIN%3D.yahoo.co.jp%26VIEW_URL%3Dhttps%253A%252F%252Fshopping.yahoo.co.jp%252F%26COOKIE_EXPIRES%3DMon%2C%252002%2520Feb%25202026%252003%3A18%3A08%2520GMT%26vcptn%3DaViKcAAJkWR28VsMCooFYQqKC7mwOg%26_v%3D1%26vp%3D887566195%26vs%3D3554664&iti=088756619502695953260103031808&ct=1767410288627&mid=2201292&cid=aViKcAAJkWR28VsMCooFYQqKC7mwOg&_v=1&vf="+encodeURIComponent(g))):window.location.replace("//atrrd.valuecommerce.com/resolve/666ccdeb1f6?u=https%3A%2F%2Fvcentry3.valuecommerce.ne.jp%2Fcgi-bin%2F2201292%2F2201292_entry.php%3FITRACK_INFO%3D088756619502695953260103031808%26COOKIE_PATH%3D%2F%26COOKIE_DOMAIN%3D.yahoo.co.jp%26VIEW_URL%3Dhttps%253A%252F%252Fshopping.yahoo.co.jp%252F%26COOKIE_EXPIRES%3DMon%2C%252002%2520Feb%25202026%252003%3A18%3A08%2520GMT%26vcptn%3DaViKcAAJkWR28VsMCooFYQqKC7mwOg%26_v%3D1%26vp%3D887566195%26vs%3D3554664&iti=088756619502695953260103031808&ct=1767410288627&mid=2201292&cid=aViKcAAJkWR28VsMCooFYQqKC7mwOg&_v=1")}this.run=function(){var g=document.createElement("img"),n=document.createElement("canvas");g.addEventListener&&"undefined"!=typeof n?(g.addEventListener("load",function(){try{n.width=g.naturalWidth;n.height=g.naturalHeight;n.getContext("2d").drawImage(g,0,0);var q=n.toDataURL("image/png");u(q.replace(/^data:image\/(png|jpg);base64,/,""),g)}catch(A){u(void 0)}},!1),g.crossOrigin="anonymous",g.src="https://a.imgvc.com/i/bf.png?v=1"):u(void 0)}}var vcRrObj=new vcResolveRd;vcRrObj.run();
--></script><noscript><meta http-equiv="refresh" content="0; URL=https://vcentry3.valuecommerce.ne.jp/cgi-bin/2201292/2201292_entry.php?ITRACK_INFO=088756619502695953260103031808&COOKIE_PATH=/&COOKIE_DOMAIN=.yahoo.co.jp&VIEW_URL=https%3A%2F%2Fshopping.yahoo.co.jp%2F&COOKIE_EXPIRES=Mon,%2002%20Feb%202026%2003:18:08%20GMT&vcptn=aViKcAAJkWR28VsMCooFYQqKC7mwOg&_v=1&vp=887566195&vs=3554664">
</noscript></head><body></body></html>`;

    global.fetch = vi.fn().mockResolvedValue({
      text: async () => htmlContent,
      url: inputUrl, // The URL doesn't change on the first hop (200 OK)
      ok: true,
      headers: new Headers(),
    } as Response);

    const result = await resolveRedirectsOfValueCommerce(inputUrl);

    expect(result).toBe(expectedUrl);
  });

  it("should handle meta tag with swapped attributes (content before http-equiv)", async () => {
    const inputUrl = "https://example.com/reversed";
    const expectedUrl = "https://shopping.yahoo.co.jp/";
    // content="..." before http-equiv="refresh"
    const htmlContent = `<html><head><noscript><meta content="0; URL=https://vcentry3.valuecommerce.ne.jp/cgi-bin/2201292/2201292_entry.php?VIEW_URL=https%3A%2F%2Fshopping.yahoo.co.jp%2F" http-equiv="refresh"></noscript></head></html>`;

    global.fetch = vi.fn().mockResolvedValue({
      text: async () => htmlContent,
      url: inputUrl,
      ok: true,
      headers: new Headers(),
    } as Response);

    const result = await resolveRedirectsOfValueCommerce(inputUrl);

    expect(result).toBe(expectedUrl);
  });
});
