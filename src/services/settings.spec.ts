import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { loadSettings } from "./settings";

type Store = Record<string, unknown>;

function mockChromeStorage(store: Store) {
  (globalThis as unknown as { chrome: unknown }).chrome = {
    storage: {
      local: {
        get: (_keys: string[], cb: (result: Store) => void) => cb(store),
      },
    },
  };
}

beforeEach(() => mockChromeStorage({}));
afterEach(() => {
  delete (globalThis as { chrome?: unknown }).chrome;
  vi.restoreAllMocks();
});

describe("loadSettings", () => {
  it("returns defaults when nothing is stored (enabled on, resolveOpaque off)", async () => {
    expect(await loadSettings()).toEqual({ enabled: true, resolveOpaque: false });
  });

  it("respects stored values", async () => {
    mockChromeStorage({ enabled: false, resolveOpaque: true });
    expect(await loadSettings()).toEqual({ enabled: false, resolveOpaque: true });
  });

  it("coerces non-true values to false", async () => {
    mockChromeStorage({ enabled: "yes", resolveOpaque: 1 });
    expect(await loadSettings()).toEqual({ enabled: false, resolveOpaque: false });
  });
});
