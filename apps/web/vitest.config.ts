import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
    include: ["__tests__/**/*.test.ts"],
    globals: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@prefskit/db": path.resolve(__dirname, "../../packages/db/src/index"),
      "@prefskit/db/schema": path.resolve(
        __dirname,
        "../../packages/db/src/schema",
      ),
    },
  },
});
