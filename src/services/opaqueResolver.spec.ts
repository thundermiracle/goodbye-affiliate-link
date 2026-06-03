import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createOpaqueResolver } from "./opaqueResolver";

let sendMessage: ReturnType<typeof vi.fn>;

beforeEach(() => {
  document.body.innerHTML = "";
  sendMessage = vi.fn(
    (msg: { links: string[] }, cb: (r: { resolvedLinks: Record<string, string> }) => void) => {
      cb({ resolvedLinks: { [msg.links[0]]: "https://shop.example/clean" } });
    },
  );
  (globalThis as unknown as { chrome: unknown }).chrome = {
    runtime: { lastError: undefined, sendMessage },
  };
});

afterEach(() => {
  delete (globalThis as { chrome?: unknown }).chrome;
  vi.restoreAllMocks();
});

function fireIntent(el: Element) {
  el.dispatchEvent(new Event("pointerover", { bubbles: true }));
}

describe("createOpaqueResolver", () => {
  it("resolves an anchor on hover and rewrites its href", () => {
    document.body.innerHTML = `<a id="x" href="https://px.a8.net/svt/ejp?a8mat=ABC">go</a>`;
    const resolver = createOpaqueResolver();
    resolver.start();

    const a = document.getElementById("x") as HTMLAnchorElement;
    fireIntent(a);

    expect(sendMessage).toHaveBeenCalledTimes(1);
    expect(a.href).toBe("https://shop.example/clean");
    resolver.stop();
  });

  it("does nothing after stop()", () => {
    document.body.innerHTML = `<a id="y" href="https://px.a8.net/svt/ejp?a8mat=XYZ">go</a>`;
    const resolver = createOpaqueResolver();
    resolver.start();
    resolver.stop();

    fireIntent(document.getElementById("y") as HTMLAnchorElement);
    expect(sendMessage).not.toHaveBeenCalled();
  });

  it("does not re-send for an already-resolved link", () => {
    document.body.innerHTML = `<a id="z" href="https://px.a8.net/svt/ejp?a8mat=Q">go</a>`;
    const resolver = createOpaqueResolver();
    resolver.start();

    const a = document.getElementById("z") as HTMLAnchorElement;
    fireIntent(a); // resolves a8mat -> clean
    fireIntent(a); // href is now clean (cached no-op)

    expect(sendMessage).toHaveBeenCalledTimes(1);
    resolver.stop();
  });
});
