import { describe, expect, it } from "vitest";
import type { Turno } from "../types/Turno";
import { ALTURA_HORA, ubicarTurnos } from "./agenda";

// Hora local -> ISO, para que el test no dependa de la zona horaria
const turno = (id: number, h: number, m: number, estado: Turno["estado"] = "Pendiente") =>
  ({ id, estado, fechaHora: new Date(2099, 2, 16, h, m).toISOString() }) as Turno;

describe("ubicarTurnos (grilla de la agenda)", () => {
  it("dos turnos seguidos no se pisan", () => {
    const [a, b] = ubicarTurnos([turno(1, 9, 0), turno(2, 9, 30)]);
    expect(Number(a.estilo.top) + Number(a.estilo.height)).toBeLessThanOrEqual(Number(b.estilo.top));
    // 09:00 cae una hora debajo del inicio (08:00), con un poco de aire
    expect(Math.round(Number(a.estilo.top) / ALTURA_HORA)).toBe(1);
  });

  it("dos turnos a la misma hora se reparten el ancho", () => {
    const [a, b] = ubicarTurnos([turno(1, 10, 30, "Cancelado"), turno(2, 10, 30)]);
    expect(a.estilo.width).toContain("50%");
    expect(b.estilo.left).toContain("50%");
  });

  it("un turno solo ocupa todo el ancho", () => {
    const [a] = ubicarTurnos([turno(1, 11, 0)]);
    expect(a.estilo.width).toContain("100%");
  });
});
