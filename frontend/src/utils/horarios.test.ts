import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  HORARIOS_CONSULTORIO,
  horarioNoDisponible,
  horariosLibres,
  esDiaHabil,
  claveFecha,
  diasHabiles,
} from "./horarios";

describe("HORARIOS_CONSULTORIO", () => {
  it("va de 08:00 a 19:30 cada 30 minutos (24 turnos)", () => {
    expect(HORARIOS_CONSULTORIO).toHaveLength(24);
    expect(HORARIOS_CONSULTORIO[0]).toBe("08:00");
    expect(HORARIOS_CONSULTORIO[1]).toBe("08:30");
    expect(HORARIOS_CONSULTORIO.at(-1)).toBe("19:30");
  });
});

describe("disponibilidad (con reloj fijo)", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-10T12:00:00"));
  });
  afterEach(() => vi.useRealTimers());

  it("un horario ocupado no está disponible", () => {
    expect(horarioNoDisponible("2026-06-12", "10:00", new Set(["10:00"]))).toBe(true);
  });

  it("un horario futuro y libre está disponible", () => {
    expect(horarioNoDisponible("2026-06-12", "10:00", new Set())).toBe(false);
  });

  it("un horario de hoy que ya pasó no está disponible", () => {
    expect(horarioNoDisponible("2026-06-10", "09:00", new Set())).toBe(true);
  });

  it("un día futuro sin ocupados tiene los 24 horarios libres", () => {
    expect(horariosLibres("2026-06-12", new Set())).toBe(24);
  });

  it("horariosLibres descuenta los ocupados", () => {
    expect(horariosLibres("2026-06-12", new Set(["08:00", "08:30"]))).toBe(22);
  });

  it("hoy a las 12:00 solo quedan los horarios posteriores", () => {
    // 12:30 a 19:30 => 15 horarios
    expect(horariosLibres("2026-06-10", new Set())).toBe(15);
  });
});

describe("días hábiles", () => {
  it("esDiaHabil es true de lunes a viernes y false en fin de semana", () => {
    expect(esDiaHabil(new Date("2026-06-08T12:00:00"))).toBe(true); // lunes
    expect(esDiaHabil(new Date("2026-06-12T12:00:00"))).toBe(true); // viernes
    expect(esDiaHabil(new Date("2026-06-13T12:00:00"))).toBe(false); // sábado
    expect(esDiaHabil(new Date("2026-06-14T12:00:00"))).toBe(false); // domingo
  });

  it("claveFecha devuelve YYYY-MM-DD en fecha local", () => {
    expect(claveFecha(new Date(2026, 5, 9))).toBe("2026-06-09");
  });

  it("diasHabiles saltea sábados y domingos", () => {
    // Viernes 12/06: el siguiente día hábil es el lunes 15/06
    const dias = diasHabiles(new Date("2026-06-12T12:00:00"), 3).map(claveFecha);

    expect(dias).toEqual(["2026-06-12", "2026-06-15", "2026-06-16"]);
  });

  it("diasHabiles respeta el parámetro saltear", () => {
    const dias = diasHabiles(new Date("2026-06-08T12:00:00"), 2, 2).map(claveFecha);

    expect(dias).toEqual(["2026-06-10", "2026-06-11"]);
  });

  it("diasHabiles no modifica la fecha de entrada", () => {
    const desde = new Date("2026-06-08T15:30:00");
    const copia = desde.getTime();

    diasHabiles(desde, 5);

    expect(desde.getTime()).toBe(copia);
  });
});
