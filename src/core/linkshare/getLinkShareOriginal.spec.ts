import { getLinkShareOriginal } from "./getLinkShareOriginal";

describe("getLinkShareOriginal", () => {
  it("should follow redirects to the original URL", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    fetchSpy.mockResolvedValueOnce(
      new Response(null, {
        status: 301,
        headers: { location: "https://www.rakuten.co.jp/shop/item123" },
      }),
    );
    fetchSpy.mockResolvedValueOnce(
      new Response(null, { status: 200 }),
    );

    const result = await getLinkShareOriginal(
      "https://click.linksynergy.com/fs-bin/click?id=XXX&offerid=YYY",
    );
    expect(result).toBe("https://www.rakuten.co.jp/shop/item123");

    fetchSpy.mockRestore();
  });

  it("should return the original URL when no redirect occurs", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    fetchSpy.mockResolvedValueOnce(
      new Response(null, { status: 200 }),
    );

    const url = "https://click.linksynergy.com/fs-bin/click?id=XXX";
    const result = await getLinkShareOriginal(url);
    expect(result).toBe(url);

    fetchSpy.mockRestore();
  });
});
