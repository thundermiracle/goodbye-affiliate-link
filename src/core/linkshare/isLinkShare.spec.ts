import { isLinkShare } from "./isLinkShare";

describe("isLinkShare", () => {
  it.each([
    ["https://click.linksynergy.com/fs-bin/click?id=XXXXX&offerid=YYYYY", true],
    ["http://click.linksynergy.com/fs-bin/click?id=12345", true],
    ["https://click.linksynergy.com/other-path", true],
    ["https://linksynergy.com/fs-bin/click?id=XXXXX", false],
    ["https://other-domain.com/fs-bin/click?id=XXXXX", false],
  ])("%s", (url, expected) => {
    expect(isLinkShare(url)).toBe(expected);
  });
});
