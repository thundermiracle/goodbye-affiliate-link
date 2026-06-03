import { describe, it, expect, vi, beforeEach } from "vitest";
import { createCookieCleaner } from "./cookieCleaner";

function makeCookie(overrides: Partial<chrome.cookies.Cookie>): chrome.cookies.Cookie {
  return {
    name: "x",
    value: "1",
    domain: ".a8.net",
    path: "/",
    secure: true,
    httpOnly: false,
    sameSite: "no_restriction",
    session: false,
    hostOnly: false,
    storeId: "0",
    ...overrides,
  } as chrome.cookies.Cookie;
}

let cookies: { getAll: ReturnType<typeof vi.fn>; remove: ReturnType<typeof vi.fn> };

beforeEach(() => {
  cookies = {
    getAll: vi.fn().mockResolvedValue([]),
    remove: vi.fn().mockResolvedValue({}),
  };
});

describe("createCookieCleaner", () => {
  it("removes a newly-set affiliate cookie with the right url", () => {
    const cleaner = createCookieCleaner(cookies as unknown as typeof chrome.cookies);
    cleaner.handleChange({
      removed: false,
      cause: "explicit",
      cookie: makeCookie({ name: "uid", domain: ".a8.net", path: "/", secure: true }),
    } as chrome.cookies.CookieChangeInfo);

    expect(cookies.remove).toHaveBeenCalledWith({
      url: "https://a8.net/",
      name: "uid",
      storeId: "0",
    });
  });

  it("ignores cookie deletions (does not loop on its own removals)", () => {
    const cleaner = createCookieCleaner(cookies as unknown as typeof chrome.cookies);
    cleaner.handleChange({
      removed: true,
      cause: "explicit",
      cookie: makeCookie({ domain: ".a8.net" }),
    } as chrome.cookies.CookieChangeInfo);

    expect(cookies.remove).not.toHaveBeenCalled();
  });

  it("ignores cookies on non-affiliate (merchant) domains", () => {
    const cleaner = createCookieCleaner(cookies as unknown as typeof chrome.cookies);
    cleaner.handleChange({
      removed: false,
      cause: "explicit",
      cookie: makeCookie({ domain: ".rakuten.co.jp" }),
    } as chrome.cookies.CookieChangeInfo);

    expect(cookies.remove).not.toHaveBeenCalled();
  });

  it("clearAll sweeps existing affiliate cookies via getAll + remove", async () => {
    cookies.getAll.mockImplementation(async ({ domain }: { domain: string }) =>
      domain === "a8.net" ? [makeCookie({ name: "uid", domain: ".a8.net" })] : [],
    );

    const cleaner = createCookieCleaner(cookies as unknown as typeof chrome.cookies);
    await cleaner.clearAll();

    expect(cookies.remove).toHaveBeenCalledWith(
      expect.objectContaining({ url: "https://a8.net/", name: "uid" }),
    );
  });

  it("builds an http url for non-secure cookies", () => {
    const cleaner = createCookieCleaner(cookies as unknown as typeof chrome.cookies);
    const url = cleaner.urlForCookie(
      makeCookie({ domain: "px.a8.net", path: "/svt", secure: false }),
    );
    expect(url).toBe("http://px.a8.net/svt");
  });
});
