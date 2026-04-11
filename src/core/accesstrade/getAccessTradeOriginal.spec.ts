import { getAccessTradeOriginal } from "./getAccessTradeOriginal";

describe("getAccessTradeOriginal", () => {
  it("should extract and decode the url parameter", async () => {
    const url =
      "https://h.accesstrade.net/sp/cc?rk=ABC123&url=https%3A%2F%2Fexample.com%2Fproduct%3Fid%3D1";
    const result = await getAccessTradeOriginal(url);
    expect(result).toBe("https://example.com/product?id=1");
  });

  it("should follow redirects when url parameter is missing", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    fetchSpy.mockResolvedValueOnce(
      new Response(null, {
        status: 302,
        headers: { location: "https://example.com/final" },
      }),
    );
    fetchSpy.mockResolvedValueOnce(
      new Response(null, { status: 200 }),
    );

    const url = "https://h.accesstrade.net/sp/cc?rk=ABC123";
    const result = await getAccessTradeOriginal(url);
    expect(result).toBe("https://example.com/final");

    fetchSpy.mockRestore();
  });
});
