import { getLinkAOriginal } from "./getLinkAOriginal";

describe("getLinkAOriginal", () => {
  it("should follow redirects to the original URL", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    fetchSpy.mockResolvedValueOnce(
      new Response(null, {
        status: 302,
        headers: { location: "https://example.com/product" },
      }),
    );
    fetchSpy.mockResolvedValueOnce(
      new Response(null, { status: 200 }),
    );

    const result = await getLinkAOriginal("https://cl.link-ag.net/click/abc123");
    expect(result).toBe("https://example.com/product");

    fetchSpy.mockRestore();
  });

  it("should return the original URL when no redirect occurs", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    fetchSpy.mockResolvedValueOnce(
      new Response(null, { status: 200 }),
    );

    const url = "https://cl.link-ag.net/click/abc123";
    const result = await getLinkAOriginal(url);
    expect(result).toBe(url);

    fetchSpy.mockRestore();
  });
});
