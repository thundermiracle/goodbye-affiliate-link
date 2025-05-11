import { isA8Net } from "./isA8Net";

describe("isA8Net", () => {
    it.each([
      ["https://px.a8.net/svt/ejp?a8mat=XXXXXXXX+YYYYYY+ZZZZ+AAAAAA", true],
      ["http://px.a8.net/svt/ejp?a8mat=XXXXXXXX+YYYYYY+ZZZZ+AAAAAA", true],
      ["https://px.a8.net/svt/jp?a8mat=XXXXXXXX+YYYYYY+ZZZZ+AAAAAA", false],
      ["https://a8.net/svt/ejp?a8mat=XXXXXXXX+YYYYYY+ZZZZ+AAAAAA", false],
    ])("%s", (url, expected) => {
      expect(isA8Net(url)).toBe(expected);
    });
});
