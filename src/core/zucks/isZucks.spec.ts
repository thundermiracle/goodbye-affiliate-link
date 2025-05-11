import { isZucks } from "./isZucks";

describe("isZucks", () => {
  it.each([
    ["https://get.mobu.jp/redirect/12345", true],
    ["http://get.mobu.jp/redirect/abcdef", true],
    ["https://get.mobu.jp/12345", false],
    ["https://mobu.jp/redirect/12345", false],
    ["https://get.other.jp/redirect/12345", false],
  ])("%s", (url, expected) => {
    expect(isZucks(url)).toBe(expected);
  });
});
