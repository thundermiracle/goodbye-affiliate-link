import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
  },
  resolve: {
    alias: {
      // Match WXT's "@" -> srcDir alias so tests resolve "@/..." like the build.
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
