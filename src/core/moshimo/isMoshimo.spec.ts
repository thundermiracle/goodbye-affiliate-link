import { isMoshimo } from "./isMoshimo";

describe("isMoshimo", () => {
  it.each([
    [
      "https://af.moshimo.com/af/c/click?a_id=1234&p_id=5678&pc_id=90&pl_id=12&url=https%3A%2F%2Fexample.com",
      true,
    ],
    ["http://af.moshimo.com/af/c/click?a_id=1234&url=https%3A%2F%2Fexample.com", true],
    ["https://af.moshimo.com/af/c/click?a_id=1234", false],
    ["https://af.moshimo.com/other/path?url=https%3A%2F%2Fexample.com", false],
  ])("%s", (url, expected) => {
    expect(isMoshimo(url)).toBe(expected);
  });
});
