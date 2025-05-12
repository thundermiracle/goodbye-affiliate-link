import { isValueCommerce } from "./isValueCommerce";

describe("isValueCommerce", () => {
  it.each([
    ["https://ck.jp.ap.valuecommerce.com/servlet/referral?sid=1234567&pid=890123", true],
    ["http://ck.jp.ap.valuecommerce.com/servlet/referral?pid=890123&sid=1234567", true],
    [
      "//ck.jp.ap.valuecommerce.com/servlet/referral?va=2695950&sid=3543619&pid=891659004&vcid=__ixiIDrafx2SP513XW71XDT0T0jgX21IWi9Ig1ym5k&vcpub=0.977730",
      true,
    ],
    ["https://ck.jp.ap.valuecommerce.com/servlet/referral?sid=1234567", false],
    ["https://ck.jp.ap.valuecommerce.com/servlet/referral?pid=890123", false],
    ["https://ck.jp.ap.valuecommerce.com/servlet/other?sid=1234567&pid=890123", false],
  ])("%s", (url, expected) => {
    expect(isValueCommerce(url)).toBe(expected);
  });
});
