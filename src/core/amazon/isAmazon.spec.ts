import { isAmazon } from "./isAmazon";

describe("isAmazon", () => {
  it.each([
    ["https://www.amazon.co.jp/dp/B08JLZV7G1/ref=nosim?tag=example-22", true],
    ["https://www.amazon.co.jp/gp/product/B08JLZV7G1?tag=example-22", true],
    ["https://www.amazon.co.jp/dp/B08JLZV7G1?tag=example-22&th=1", true],
    ["https://www.amazon.com/dp/B08JLZV7G1?tag=example-20", true],
    ["https://www.amazon.de/dp/B08JLZV7G1?tag=example-21", true],
    ["https://www.amazon.com.au/dp/B08JLZV7G1?tag=example-22", true],
    ["https://amzn.to/3abcDEF", true],
    ["https://amzn.asia/d/abcDEF1", true],
    ["https://www.amazon.co.jp/dp/B08JLZV7G1/", false],
    ["https://www.amazon.co.jp/s?k=keyboard&tag=", false],
    ["https://example.com/path?tag=example-22", false],
    ["https://amzn.jp/B08JLZV7G1", false],
  ])("%s", (url, expected) => {
    expect(isAmazon(url)).toBe(expected);
  });
});
