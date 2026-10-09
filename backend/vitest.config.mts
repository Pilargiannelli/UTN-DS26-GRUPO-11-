import { defineConfig } from "vitest/config";
import { loadEnv } from "vite";

// Lee el .env (para DATABASE_URL, que usan solo los tests con DB).
const env = loadEnv("test", process.cwd(), "");

export default defineConfig({
  test: {
    env: {
      // Secret solo para tests: nunca el real.
      JWT_SECRET: "secreto-solo-para-tests",
      DATABASE_URL: env.DATABASE_URL ?? "",
    },
  },
});
