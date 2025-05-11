import { isAmazon } from "./isAmazon";

describe("isAmazon", () => {
  it.each([
    ["https://www.amazon.co.jp/dp/B08JLZV7G1/ref=nosim?tag=example-22", true],
    ["https://www.amazon.co.jp/gp/product/B08JLZV7G1?tag=example-22", true],
    ["https://amzn.to/3abcDEF", true],
    ["https://www.amazon.co.jp/dp/B08JLZV7G1/", false],
    ["https://amzn.jp/B08JLZV7G1", false],
  ])("%s", (url, expected) => {
    expect(isAmazon(url)).toBe(expected);
  });
});
