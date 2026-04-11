import { getMoshimoOriginal } from "./getMoshimoOriginal";

describe("getMoshimoOriginal", () => {
  it("should extract and decode the url parameter", async () => {
    const url =
      "https://af.moshimo.com/af/c/click?a_id=1234&p_id=5678&pc_id=90&pl_id=12&url=https%3A%2F%2Fexample.com%2Fproduct%3Fid%3D42";
    const result = await getMoshimoOriginal(url);
    expect(result).toBe("https://example.com/product?id=42");
  });

  it("should throw when url parameter is missing", async () => {
    const url = "https://af.moshimo.com/af/c/click?a_id=1234&p_id=5678";
    await expect(getMoshimoOriginal(url)).rejects.toThrow(
      "No url parameter found in Moshimo affiliate link",
    );
  });
});
