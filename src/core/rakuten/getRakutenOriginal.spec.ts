import { describe, it, expect, vi } from "vitest";
import { getRakutenOriginal } from "./getRakutenOriginal";
import * as utils from "../utils";

vi.mock("../utils", async () => {
  const actual = await vi.importActual("../utils");
  return {
    ...actual,
    resolveRedirects: vi.fn(),
  };
});

describe("getRakutenOriginal", () => {
  it("should extract URL from pc parameter", async () => {
    const target = "https://product.rakuten.co.jp/product/-/1f733aaf3ca567abb7da7469710eeb8b/";
    const encoded = encodeURIComponent(target);
    const url = `http://hb.afl.rakuten.co.jp/hgc/0ea62065.34400275.0ea62066.204f04c0/a16052887959?pc=${encoded}`;

    const result = await getRakutenOriginal(url);
    expect(result).toBe(target);
    expect(utils.resolveRedirects).not.toHaveBeenCalled();
  });

  it("should extract URL from m parameter if pc is missing", async () => {
    const target = "https://product.rakuten.co.jp/product/-/1f733aaf3ca567abb7da7469710eeb8b/";
    const encoded = encodeURIComponent(target);
    const url = `http://hb.afl.rakuten.co.jp/hgc/0ea62065.34400275.0ea62066.204f04c0/a16052887959?m=${encoded}`;

    const result = await getRakutenOriginal(url);
    expect(result).toBe(target);
    expect(utils.resolveRedirects).not.toHaveBeenCalled();
  });

  it("should fallback to resolveRedirects if no parameters", async () => {
    const url = "http://hb.afl.rakuten.co.jp/no-params";
    (utils.resolveRedirects as any).mockResolvedValue("http://resolved.com");

    const result = await getRakutenOriginal(url);
    expect(result).toBe("http://resolved.com");
    expect(utils.resolveRedirects).toHaveBeenCalledWith(url);
  });
});
