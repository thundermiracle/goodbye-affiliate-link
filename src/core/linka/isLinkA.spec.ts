import { isLinkA } from "./isLinkA";

describe("isLinkA", () => {
    it.each([
      ["https://cl.link-ag.net/123456", true],
      ["http://cl.link-ag.net/abcdefg", true],
      ["https://link-a.net/12345", true],
      ["http://link-ag.net/path", true],
      ["https://example.link-ag.net/path", false],
      ["https://linkag.net/path", false],
    ])("%s", (url, expected) => {
      expect(isLinkA(url)).toBe(expected);
    });
}); 