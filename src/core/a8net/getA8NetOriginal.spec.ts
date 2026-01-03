import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { getA8NetOriginal } from "./getA8NetOriginal";

// Mock resolveRedirects to just return the input URL (passthrough)
vi.mock("../utils", async () => {
  const actual = await vi.importActual("../utils");
  return {
    ...actual,
    resolveRedirects: vi.fn((url) => Promise.resolve(url)),
  };
});

describe("getA8NetOriginal", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("should handle HTTP 3xx redirect", async () => {
    const mockFetch = global.fetch as any;
    mockFetch.mockResolvedValue({
      status: 301,
      headers: { get: () => "http://example.com/final" },
    });

    const result = await getA8NetOriginal("http://a8.net/link");
    expect(result).toBe("http://example.com/final");
  });

  it("should handle Meta Refresh redirect", async () => {
    const mockFetch = global.fetch as any;
    const html = `<html><head><meta http-equiv="refresh" content="0; url=http://example.com/meta"></head></html>`;
    mockFetch.mockResolvedValue({
      status: 200,
      text: () => Promise.resolve(html),
    });

    const result = await getA8NetOriginal("http://a8.net/link");
    expect(result).toBe("http://example.com/meta");
  });

  it("should handle JS window.location.replace", async () => {
    const mockFetch = global.fetch as any;
    const html = `<html><body><script>window.location.replace("http://example.com/js-replace");</script></body></html>`;
    mockFetch.mockResolvedValue({
      status: 200,
      text: () => Promise.resolve(html),
    });

    const result = await getA8NetOriginal("http://a8.net/link");
    expect(result).toBe("http://example.com/js-replace");
  });

  it("should handle JS window.location.href", async () => {
    const mockFetch = global.fetch as any;
    const html = `<html><body><script>window.location.href = "http://example.com/js-href";</script></body></html>`;
    mockFetch.mockResolvedValue({
      status: 200,
      text: () => Promise.resolve(html),
    });

    const result = await getA8NetOriginal("http://a8.net/link");
    expect(result).toBe("http://example.com/js-href");
  });

  it("should return original URL on fetch error", async () => {
    const mockFetch = global.fetch as any;
    mockFetch.mockRejectedValue(new Error("Network error"));

    const result = await getA8NetOriginal("http://a8.net/fail");
    expect(result).toBe("http://a8.net/fail");
  });

  it("should fallback to extracting URL from query params if fetch fails", async () => {
    const mockFetch = global.fetch as any;
    mockFetch.mockRejectedValue(new Error("Blocked"));

    const targetUrl =
      "http://hb.afl.rakuten.co.jp/hgc/0ea62065.34400275.0ea62066.204f04c0/a16052887959_2NKOAY_FM1AXE_2HOM_BW8O1?pc=https%3A%2F%2Fproduct.rakuten.co.jp%2Fproduct%2F-%2F1f733aaf3ca567abb7da7469710eeb8b%2F&m=https%3A%2F%2Fproduct.rakuten.co.jp%2Fproduct%2F-%2F1f733aaf3ca567abb7da7469710eeb8b%2F";
    // User provided URL
    const a8Link =
      "https://rpx.a8.net/svt/ejp?a8mat=2NKOAY+FM1AXE+2HOM+BW8O1&rakuten=y&a8ejpredirect=http%3A%2F%2Fhb.afl.rakuten.co.jp%2Fhgc%2F0ea62065.34400275.0ea62066.204f04c0%2Fa16052887959_2NKOAY_FM1AXE_2HOM_BW8O1%3Fpc%3Dhttps%253A%252F%252Fproduct.rakuten.co.jp%252Fproduct%252F-%252F1f733aaf3ca567abb7da7469710eeb8b%252F%26m%3Dhttps%253A%252F%252Fproduct.rakuten.co.jp%252Fproduct%252F-%252F1f733aaf3ca567abb7da7469710eeb8b%252F";

    const result = await getA8NetOriginal(a8Link);
    expect(result).toBe(targetUrl);
  });
});
