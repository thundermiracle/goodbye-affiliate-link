import { fixIncompleteUrl } from "./fixIncompleteUrl";

describe("fixIncompleteUrl", () => {
  it("should fix incomplete URL", () => {
    expect(fixIncompleteUrl("//example.com")).toBe("https://example.com");
    expect(fixIncompleteUrl("https://example.com")).toBe("https://example.com");
    expect(fixIncompleteUrl("http://example.com")).toBe("http://example.com");
  });
});
