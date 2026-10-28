import { describe, it, expect, vi, afterEach } from "vitest";
import request from "supertest";

// Seguridad preventiva, sin DB: cabeceras de helmet, /api/health y el límite
// de intentos de login. La app se importa en cada test (vi.resetModules) para
// que el límite de login lea LOGIN_RATE_LIMIT y arranque con el contador en 0.
async function cargarApp(limiteLogin?: string) {
  vi.resetModules();
  if (limiteLogin) vi.stubEnv("LOGIN_RATE_LIMIT", limiteLogin);
  return (await import("./app")).default;
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("Seguridad preventiva", () => {
  it("no revela que el servidor es Express y manda cabeceras de seguridad", async () => {
    const app = await cargarApp();
    const res = await request(app).get("/");

    expect(res.headers["x-powered-by"]).toBeUndefined();
    expect(res.headers["x-content-type-options"]).toBe("nosniff");
  });

  it("GET /api/health responde 200 sin tocar la base de datos", async () => {
    const app = await cargarApp();
    const res = await request(app).get("/api/health");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
  });

  it("después del límite de intentos fallidos, el login responde 429", async () => {
    const app = await cargarApp("2");
    // Body inválido: cuenta como intento fallido (400) y no llega a la base
    const intentar = () => request(app).post("/api/auth/login").send({ email: "no-es-email", password: "x" });

    expect((await intentar()).status).toBe(400);
    expect((await intentar()).status).toBe(400);

    const bloqueado = await intentar();
    expect(bloqueado.status).toBe(429);
    expect(bloqueado.body.error).toMatch(/Demasiados intentos/);
  });
});
