import { describe, expect, it } from "vitest";
import { enRango, normalizarTexto, rangoDePeriodo } from "./periodos";

const ahora = new Date("2026-11-01T12:00:00");

describe("rangoDePeriodo", () => {
  it("sin período no limita nada", () => {
    expect(rangoDePeriodo("todo", "", "", ahora)).toEqual({ desde: null, hasta: null });
  });

  it("última semana, mes y año cuentan hacia atrás desde ahora", () => {
    expect(enRango("2026-10-28T10:00:00", rangoDePeriodo("semana", "", "", ahora))).toBe(true);
    expect(enRango("2026-10-20T10:00:00", rangoDePeriodo("semana", "", "", ahora))).toBe(false);
    expect(enRango("2026-10-05T10:00:00", rangoDePeriodo("mes", "", "", ahora))).toBe(true);
    expect(enRango("2026-09-01T10:00:00", rangoDePeriodo("mes", "", "", ahora))).toBe(false);
    expect(enRango("2026-01-15T10:00:00", rangoDePeriodo("anio", "", "", ahora))).toBe(true);
    expect(enRango("2025-10-01T10:00:00", rangoDePeriodo("anio", "", "", ahora))).toBe(false);
  });

  it("no incluye fechas futuras en los períodos hacia atrás", () => {
    expect(enRango("2026-11-05T10:00:00", rangoDePeriodo("semana", "", "", ahora))).toBe(false);
  });

  it("próximos y anteriores se dividen en el momento actual", () => {
    expect(enRango("2026-11-05T10:00:00", rangoDePeriodo("proximos", "", "", ahora))).toBe(true);
    expect(enRango("2026-10-30T10:00:00", rangoDePeriodo("proximos", "", "", ahora))).toBe(false);
    expect(enRango("2026-10-30T10:00:00", rangoDePeriodo("anteriores", "", "", ahora))).toBe(true);
  });

  it("personalizado incluye los dos días completos y acepta un solo extremo", () => {
    const rango = rangoDePeriodo("personalizado", "2026-10-10", "2026-10-12", ahora);
    expect(enRango("2026-10-10T00:30:00", rango)).toBe(true);
    expect(enRango("2026-10-12T23:00:00", rango)).toBe(true);
    expect(enRango("2026-10-13T00:30:00", rango)).toBe(false);
    expect(enRango("2026-10-09T23:00:00", rango)).toBe(false);

    const soloDesde = rangoDePeriodo("personalizado", "2026-10-10", "", ahora);
    expect(enRango("2030-01-01T10:00:00", soloDesde)).toBe(true);
  });
});

describe("normalizarTexto", () => {
  it("ignora tildes y mayúsculas", () => {
    expect(normalizarTexto("  Esguince de TOBILLO – Evolución ")).toBe("esguince de tobillo – evolucion");
  });
});
