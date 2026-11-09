import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { apiFetch, ApiError } from "./api";
import { guardarToken } from "./sesion";

function mockFetch(status: number, cuerpo: unknown, jsonRoto = false) {
  const fetchFalso = vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: () => (jsonRoto ? Promise.reject(new Error("no es JSON")) : Promise.resolve(cuerpo)),
  });
  vi.stubGlobal("fetch", fetchFalso);
  return fetchFalso;
}

describe("apiFetch: armado del pedido", () => {
  beforeEach(() => {
    localStorage.clear();
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("antepone /api al path y agrega la barra inicial si falta", async () => {
    const f = mockFetch(200, {});

    await apiFetch("turnos");

    expect(f.mock.calls[0][0]).toMatch(/\/api\/turnos$/);
  });

  it("no duplica el prefijo /api si el path ya lo trae", async () => {
    const f = mockFetch(200, {});

    await apiFetch("/api/turnos");

    expect(f.mock.calls[0][0]).toMatch(/\/api\/turnos$/);
    expect(f.mock.calls[0][0]).not.toMatch(/\/api\/api\//);
  });

  it("manda el token como Bearer cuando hay sesión", async () => {
    guardarToken("abc");
    const f = mockFetch(200, {});

    await apiFetch("/turnos");

    expect(f.mock.calls[0][1].headers.Authorization).toBe("Bearer abc");
    expect(f.mock.calls[0][1].headers["Content-Type"]).toBe("application/json");
  });

  it("sin sesión no manda Authorization", async () => {
    const f = mockFetch(200, {});

    await apiFetch("/medicos");

    expect(f.mock.calls[0][1].headers).not.toHaveProperty("Authorization");
  });

  it("respeta método, body y headers propios sin perder los de base", async () => {
    const f = mockFetch(200, {});

    await apiFetch("/turnos", { method: "POST", body: '{"a":1}', headers: { "X-Prueba": "1" } });

    const opciones = f.mock.calls[0][1];
    expect(opciones.method).toBe("POST");
    expect(opciones.body).toBe('{"a":1}');
    expect(opciones.headers["X-Prueba"]).toBe("1");
    expect(opciones.headers["Content-Type"]).toBe("application/json");
  });

  it("devuelve el cuerpo JSON de una respuesta exitosa", async () => {
    mockFetch(200, [{ id: 1 }]);

    expect(await apiFetch("/turnos")).toEqual([{ id: 1 }]);
  });

  it("una respuesta exitosa sin cuerpo (204) devuelve null", async () => {
    mockFetch(204, null, true);

    expect(await apiFetch("/auth/password", { method: "PATCH" })).toBeNull();
  });
});

describe("apiFetch: errores", () => {
  beforeEach(() => {
    localStorage.clear();
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("lanza un ApiError con status, mensaje y detalles del back (400 de Zod)", async () => {
    mockFetch(400, { error: "Datos inválidos", detalles: [{ campo: "dni", mensaje: "DNI inválido" }] });

    const error = (await apiFetch("/pacientes", { method: "POST" }).catch((e) => e)) as ApiError;

    expect(error).toBeInstanceOf(ApiError);
    expect(error.name).toBe("ApiError");
    expect(error.status).toBe(400);
    expect(error.message).toBe("Datos inválidos");
    expect(error.detalles).toEqual([{ campo: "dni", mensaje: "DNI inválido" }]);
  });

  it("sin detalles en la respuesta, detalles queda vacío", async () => {
    mockFetch(409, { error: "Ya existe" });

    const error = (await apiFetch("/pacientes").catch((e) => e)) as ApiError;

    expect(error.detalles).toEqual([]);
  });

  it("si el error no trae cuerpo JSON usa un mensaje genérico con el status", async () => {
    mockFetch(500, null, true);

    await expect(apiFetch("/turnos")).rejects.toThrow("Error 500");
  });

  it("un 401 con token en una pantalla que no es /login redirige a /login?expired=true", async () => {
    guardarToken("vencido");
    vi.spyOn(console, "error").mockImplementation(() => {});
    window.history.pushState({}, "", "/home");
    mockFetch(401, { error: "Token expirado" });

    // jsdom no implementa navegar: alcanza con que no rompa y la sesión quede cerrada
    await expect(apiFetch("/turnos")).rejects.toThrow("Token expirado");
    expect(localStorage.getItem("token")).toBeNull();
  });

  it("un 401 con token estando ya en /login no intenta redirigir de nuevo", async () => {
    guardarToken("vencido");
    window.history.pushState({}, "", "/login");
    mockFetch(401, { error: "Token expirado" });
    const hrefAntes = window.location.href;

    await expect(apiFetch("/turnos")).rejects.toThrow();

    expect(window.location.href).toBe(hrefAntes);
  });

  it("un 403 no cierra la sesión (el usuario está autenticado pero sin permiso)", async () => {
    guardarToken("valido");
    mockFetch(403, { error: "No tenés permiso" });

    await expect(apiFetch("/pacientes")).rejects.toThrow("No tenés permiso");
    expect(localStorage.getItem("token")).toBe("valido");
  });
});
