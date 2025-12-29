import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { resolveRedirects } from "./resolveRedirects";

describe("resolveRedirects", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("should resolve redirects correctly", async () => {
    const mockFetch = global.fetch as any;
    mockFetch
      .mockResolvedValueOnce({
        status: 301,
        headers: { get: () => "http://example.com/redirect1" },
      })
      .mockResolvedValueOnce({
        status: 302,
        headers: { get: () => "http://example.com/final" },
      })
      .mockResolvedValueOnce({
        status: 200,
        url: "http://example.com/final",
        headers: { get: () => null },
      });

    const result = await resolveRedirects("http://example.com/start");
    expect(result).toBe("http://example.com/final");
    expect(mockFetch).toHaveBeenCalledTimes(3);
  });

  it("should stop after max redirects", async () => {
    const mockFetch = global.fetch as any;
    mockFetch.mockResolvedValue({
      status: 301,
      headers: { get: () => "http://example.com/loop" },
    });

    const result = await resolveRedirects("http://example.com/start", 2);
    expect(result).toBe("http://example.com/loop");
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it("should handle timeout gracefully", async () => {
    const mockFetch = global.fetch as any;
    // Simulate a pending promise that triggers the timeout
    mockFetch.mockImplementation(async (_url: string, options: { signal: AbortSignal }) => {
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          // This part is just to simulate that it eventually finishes or whatever,
          // but the abortion should happen first.
        }, 10000);

        if (options.signal) {
          options.signal.addEventListener("abort", () => {
            clearTimeout(timeout);
            const error = new Error("The operation was aborted");
            error.name = "AbortError";
            reject(error);
          });
        }
      });
    });

    const promise = resolveRedirects("http://example.com/timeout");

    // Fast-forward time to trigger timeout
    vi.advanceTimersByTime(5000);

    const result = await promise;
    // Should return the original URL (or whatever it had) on error
    expect(result).toBe("http://example.com/timeout");
  });

  it("should handle fetch errors gracefully", async () => {
    const mockFetch = global.fetch as any;
    mockFetch.mockRejectedValue(new Error("Network error"));

    const result = await resolveRedirects("http://example.com/error");
    expect(result).toBe("http://example.com/error");
  });
});
