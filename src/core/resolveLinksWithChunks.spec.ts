import { describe, it, expect } from "vitest";
import { resolveLinksWithChunks } from "./resolveLinksWithChunks";

describe("resolveLinksWithChunks", () => {
  it("should resolve Amazon links correctly", async () => {
    const link = "https://www.amazon.co.jp/dp/B0DT9JBBH6/?tag=sakurachecker-22";
    const resolved = await resolveLinksWithChunks([link]);

    expect(resolved).toHaveProperty(link);
    expect(resolved[link]).toBe("https://www.amazon.co.jp/dp/B0DT9JBBH6/");
    expect(resolved[link]).not.toBe(link);
  });

  it("should resolve multiple links", async () => {
    const links = [
      "https://www.amazon.co.jp/dp/B0DT9JBBH6/?tag=sakurachecker-22",
      "https://example.com", // Should be ignored
    ];
    const resolved = await resolveLinksWithChunks(links);
    const amazonLink = links[0];

    expect(resolved).toHaveProperty(amazonLink);
    expect(Object.keys(resolved)).toHaveLength(1);
  });
});
