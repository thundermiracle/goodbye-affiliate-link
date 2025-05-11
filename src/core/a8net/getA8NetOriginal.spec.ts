import { getA8NetOriginal } from "./getA8NetOriginal";

describe("getA8NetOriginal", () => {
  it("should return the original URL", async () => {
    const url = "https://px.a8.net/svt/ejp?a8mat=3B78VZ+7IW90Y+1WP2+6I9N5";
    const originalUrl = await getA8NetOriginal(url);
    expect(originalUrl.startsWith("https://fx.dmm.com/lp/nmktg/lp0907open")).toBe(true);
  });
});
