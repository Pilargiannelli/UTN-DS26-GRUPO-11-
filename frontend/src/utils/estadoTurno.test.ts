import { describe, expect, it } from "vitest";
import { obtenerClaseEstado, puedeCancelarPaciente, yaPaso } from "./estadoTurno";

const FUTURO = "2099-03-14T13:00:00.000Z";
const PASADO = "2020-08-26T10:30:00.000Z";

describe("puedeCancelarPaciente (RN-006)", () => {
  it.each(["Pendiente", "Reprogramado"] as const)("permite cancelar un turno %s futuro", (estado) => {
    expect(puedeCancelarPaciente(estado, FUTURO)).toBe(true);
  });

  it.each(["Confirmado", "Cancelado"] as const)("no muestra cancelar en un turno %s", (estado) => {
    expect(puedeCancelarPaciente(estado, FUTURO)).toBe(false);
  });

  it("no muestra cancelar en un turno Pendiente que ya pasó", () => {
    expect(puedeCancelarPaciente("Pendiente", PASADO)).toBe(false);
  });
});

describe("yaPaso", () => {
  it("distingue un turno pasado de uno futuro", () => {
    expect(yaPaso(PASADO)).toBe(true);
    expect(yaPaso(FUTURO)).toBe(false);
  });
});

describe("obtenerClaseEstado", () => {
  it("Reprogramado usa el mismo color que Pendiente", () => {
    expect(obtenerClaseEstado("Reprogramado")).toBe(obtenerClaseEstado("Pendiente"));
  });
});
