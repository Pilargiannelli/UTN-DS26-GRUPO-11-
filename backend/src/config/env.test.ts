import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// env.ts lee process.env al importarse: cada test lo importa de cero
async function cargarEnv() {
  vi.resetModules();
  return import("./env");
}

describe("config/env", () => {
  beforeEach(() => {
    vi.stubEnv("JWT_SECRET", "secreto-de-test");
  });
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("expone el JWT_SECRET de la variable de entorno", async () => {
    const env = await cargarEnv();

    expect(env.JWT_SECRET).toBe("secreto-de-test");
  });

  it("sin JWT_SECRET falla al importar (la barrera de C18)", async () => {
    vi.stubEnv("JWT_SECRET", "");

    await expect(cargarEnv()).rejects.toThrow("Falta la variable de entorno JWT_SECRET");
  });

  it("JWT_EXPIRES_IN vale 1d por defecto y respeta la variable si existe", async () => {
    vi.stubEnv("JWT_EXPIRES_IN", "");
    expect((await cargarEnv()).JWT_EXPIRES_IN).toBe("1d");

    vi.stubEnv("JWT_EXPIRES_IN", "2h");
    expect((await cargarEnv()).JWT_EXPIRES_IN).toBe("2h");
  });

  it("SALT_ROUNDS vale 10 por defecto, respeta la variable y la convierte a número", async () => {
    vi.stubEnv("SALT_ROUNDS", "");
    expect((await cargarEnv()).SALT_ROUNDS).toBe(10);

    vi.stubEnv("SALT_ROUNDS", "12");
    expect((await cargarEnv()).SALT_ROUNDS).toBe(12);
  });

  it("un SALT_ROUNDS que no es número cae al valor por defecto", async () => {
    vi.stubEnv("SALT_ROUNDS", "abc");

    expect((await cargarEnv()).SALT_ROUNDS).toBe(10);
  });
});
