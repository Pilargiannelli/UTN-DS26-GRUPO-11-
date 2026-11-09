import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// app.ts se reemplaza: acá interesa solo que index.ts arranque el servidor
const listen = vi.fn();
vi.mock("./app", () => ({ default: { listen } }));

describe("index.ts (arranque del servidor)", () => {
  beforeEach(() => {
    vi.resetModules();
    listen.mockReset();
    vi.spyOn(console, "log").mockImplementation(() => {});
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("escucha en el puerto de la variable PORT", async () => {
    vi.stubEnv("PORT", "4321");

    await import("./index");

    expect(listen).toHaveBeenCalledTimes(1);
    expect(listen.mock.calls[0][0]).toBe("4321");
  });

  it("sin PORT escucha en el 3000", async () => {
    vi.stubEnv("PORT", "");

    await import("./index");

    expect(listen.mock.calls[0][0]).toBe(3000);
  });

  it("al arrancar avisa por consola la URL", async () => {
    vi.stubEnv("PORT", "4321");
    listen.mockImplementation((_puerto: unknown, alEscuchar: () => void) => alEscuchar());

    await import("./index");

    expect(console.log).toHaveBeenCalledWith("Servidor en http://localhost:4321");
  });
});
