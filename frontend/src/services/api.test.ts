import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { apiFetch } from "./api";
import { guardarToken, obtenerToken } from "./sesion";

// Respuesta falsa de fetch con el status y el cuerpo que queremos probar
function mockFetch(status: number, cuerpo: unknown) {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: status >= 200 && status < 300,
      status,
      json: () => Promise.resolve(cuerpo),
    })
  );
}

describe("apiFetch ante un 401", () => {
  let eventosExpirada: number;
  const contar = () => { eventosExpirada++; };

  beforeEach(() => {
    localStorage.clear();
    eventosExpirada = 0;
    window.addEventListener("sesion-expirada", contar);
  });

  afterEach(() => {
    window.removeEventListener("sesion-expirada", contar);
    vi.unstubAllGlobals();
  });

  it("sin token (login con credenciales malas) muestra el error del back y no cierra sesión", async () => {
    mockFetch(401, { error: "Email o contraseña incorrectos" });

    await expect(apiFetch("/auth/login", { method: "POST" }))
      .rejects.toThrow("Email o contraseña incorrectos");
    expect(eventosExpirada).toBe(0);
  });

  it("con token (sesión vencida) borra el token y avisa que la sesión expiró", async () => {
    guardarToken("token-vencido");
    mockFetch(401, { error: "Token inválido o expirado" });

    await expect(apiFetch("/turnos")).rejects.toThrow("Token inválido o expirado");
    expect(obtenerToken()).toBeNull();
    expect(eventosExpirada).toBe(1);
  });
});
