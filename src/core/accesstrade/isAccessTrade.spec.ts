import { isAccessTrade } from "./isAccessTrade";

describe("isAccessTrade", () => {
  it.each([
    ["https://h.accesstrade.net/sp/cc?rk=XXXXXXXXXXXXXX", true],
    ["http://h.accesstrade.net/sp/cc?rk=0123456789ABCD", true],
    ["https://h.accesstrade.net/sp/cc?other=param&rk=ABCDEF", true],
    ["https://h.accesstrade.net/sp/cc", false],
    ["https://h.accesstrade.net/other/path?rk=XXXXXXXXXXXXXX", false],
  ])("%s", (url, expected) => {
    expect(isAccessTrade(url)).toBe(expected);
  });
});
