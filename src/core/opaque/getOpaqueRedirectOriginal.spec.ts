import { getOpaqueRedirectOriginal } from "./getOpaqueRedirectOriginal";

describe("getOpaqueRedirectOriginal", () => {
  it("should follow redirects to the original URL", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    fetchSpy.mockResolvedValueOnce(
      new Response(null, {
        status: 302,
        headers: { location: "https://shop.example/item/42" },
      }),
    );
    fetchSpy.mockResolvedValueOnce(new Response(null, { status: 200 }));

    const result = await getOpaqueRedirectOriginal("https://t.afi-b.com/visit.php?guid=ON&a=A1");
    expect(result).toBe("https://shop.example/item/42");

    fetchSpy.mockRestore();
  });

  it("should return the original URL on fetch error", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    fetchSpy.mockRejectedValueOnce(new Error("Network error"));

    const url = "https://t.felmat.net/fmcl?ak=B1234.5678";
    const result = await getOpaqueRedirectOriginal(url);
    expect(result).toBe(url);

    fetchSpy.mockRestore();
  });
});
