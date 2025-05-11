import { isValueCommerce } from "./isValueCommerce";

describe("isValueCommerce", () => {
    it.each([
      ["https://ck.jp.ap.valuecommerce.com/servlet/referral?sid=1234567&pid=890123", true],
      ["http://ck.jp.ap.valuecommerce.com/servlet/referral?pid=890123&sid=1234567", true],
      ["https://ck.jp.ap.valuecommerce.com/servlet/referral?sid=1234567", false],
      ["https://ck.jp.ap.valuecommerce.com/servlet/referral?pid=890123", false],
      ["https://ck.jp.ap.valuecommerce.com/servlet/other?sid=1234567&pid=890123", false],
    ])("%s", (url, expected) => {
      expect(isValueCommerce(url)).toBe(expected);
    });
}); 