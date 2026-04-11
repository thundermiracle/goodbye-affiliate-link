import { getZucksOriginal } from "./getZucksOriginal";

describe("getZucksOriginal", () => {
  it("should follow redirects to the original URL", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    fetchSpy.mockResolvedValueOnce(
      new Response(null, {
        status: 302,
        headers: { location: "https://example.com/app" },
      }),
    );
    fetchSpy.mockResolvedValueOnce(
      new Response(null, { status: 200 }),
    );

    const result = await getZucksOriginal("https://get.mobu.jp/redirect/abc123");
    expect(result).toBe("https://example.com/app");

    fetchSpy.mockRestore();
  });

  it("should return the original URL on fetch error", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    fetchSpy.mockRejectedValueOnce(new Error("Network error"));

    const url = "https://get.mobu.jp/redirect/abc123";
    const result = await getZucksOriginal(url);
    expect(result).toBe(url);

    fetchSpy.mockRestore();
  });
});
