import { describe, it, expect, beforeEach } from "vitest";
import { createClickGuard, createLinkRewriter } from "./rewriteLinks";

describe("createLinkRewriter", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("rewrites an embedded-url affiliate anchor to its destination", () => {
    document.body.innerHTML = `<a id="x" href="https://unknown-asp.example/redirect?url=https%3A%2F%2Fshop.example%2Fitem">go</a>`;
    createLinkRewriter().rewriteWithin(document);

    const a = document.getElementById("x") as HTMLAnchorElement;
    expect(a.href).toBe("https://shop.example/item");
  });

  it("leaves opaque and ordinary links untouched", () => {
    document.body.innerHTML = `
      <a id="opaque" href="https://px.a8.net/svt/ejp?a8mat=ABC+DEF+GHI+JKL">a8</a>
      <a id="plain" href="https://blog.example/article?id=42">plain</a>`;
    createLinkRewriter().rewriteWithin(document);

    expect((document.getElementById("opaque") as HTMLAnchorElement).href).toBe(
      "https://px.a8.net/svt/ejp?a8mat=ABC+DEF+GHI+JKL",
    );
    expect((document.getElementById("plain") as HTMLAnchorElement).href).toBe(
      "https://blog.example/article?id=42",
    );
  });

  it("rewrites a single anchor (the MutationObserver add path)", () => {
    const a = document.createElement("a");
    a.href =
      "https://hb.afl.rakuten.co.jp/ichiba/abc/?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fshop%2F1";
    document.body.appendChild(a);

    createLinkRewriter().rewriteAnchor(a);

    expect(a.href).toBe("https://item.rakuten.co.jp/shop/1");
  });

  it("does not re-resolve a cached href (and resolved url is a no-op)", () => {
    const a = document.createElement("a");
    a.href = "https://unknown-asp.example/r?url=https%3A%2F%2Fshop.example%2Fp";
    document.body.appendChild(a);

    const rewriter = createLinkRewriter();
    rewriter.rewriteAnchor(a);
    expect(a.href).toBe("https://shop.example/p");

    // Re-running on the now-resolved anchor must leave it stable (no loop).
    rewriter.rewriteAnchor(a);
    expect(a.href).toBe("https://shop.example/p");
  });
});

describe("createClickGuard", () => {
  const AFFILIATE = "https://unknown-asp.example/redirect?url=https%3A%2F%2Fshop.example%2Fitem";
  const CLEAN = "https://shop.example/item";

  let anchor: HTMLAnchorElement;
  let guard: ReturnType<typeof createClickGuard>;

  beforeEach(() => {
    document.body.innerHTML = "";
    anchor = document.createElement("a");
    document.body.appendChild(anchor);
    // keep jsdom from attempting real navigation on unhandled clicks
    document.body.addEventListener("click", (e) => e.preventDefault());

    guard = createClickGuard(createLinkRewriter().rewriteAnchor);
    guard.start();
  });

  it("re-rewrites an href swapped to an affiliate url on mousedown", () => {
    anchor.href = CLEAN;
    anchor.addEventListener("mousedown", () => {
      anchor.href = AFFILIATE;
    });

    anchor.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    expect(anchor.href).toBe(AFFILIATE); // the cloaker won the mousedown...

    anchor.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
    expect(anchor.href).toBe(CLEAN); // ...but the click guard wins the click

    guard.stop();
  });

  it("re-rewrites when the swap happens inside the anchor's own click handler", () => {
    anchor.href = CLEAN;
    anchor.addEventListener("click", () => {
      anchor.href = AFFILIATE;
    });

    anchor.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
    expect(anchor.href).toBe(CLEAN); // document-level bubble listener ran last

    guard.stop();
  });

  it("does nothing after stop()", () => {
    guard.stop();
    anchor.href = AFFILIATE;

    anchor.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
    expect(anchor.href).toBe(AFFILIATE);
  });
});
