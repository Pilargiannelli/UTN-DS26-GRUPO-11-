import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";

vi.mock("./useFetch", () => ({ useFetch: vi.fn() }));

import { useFetch } from "./useFetch";
import { useTurnosPaciente } from "./useTurnosPaciente";
import { useTurnosMedico } from "./useTurnosMedico";
import { consultaDelTurno } from "./useMiHistoria";
import type { Turno } from "../types/Turno";
import type { EntradaClinica } from "../types/HistoriaClinica";

const turno = (id: number, fechaHora: Date, extra: Partial<Turno> = {}) =>
  ({ id, fechaHora: fechaHora.toISOString(), estado: "Pendiente", medicoId: 1, pacienteId: 1, ...extra }) as Turno;

function datos(turnos: Turno[] | null) {
  vi.mocked(useFetch).mockReturnValue({ data: turnos, loading: false, error: null });
}

const FUTURO_1 = new Date(2099, 0, 5, 9, 0);
const FUTURO_2 = new Date(2099, 0, 5, 15, 0);
const FUTURO_3 = new Date(2099, 0, 6, 9, 0);
const PASADO = new Date(2000, 0, 5, 9, 0);

describe("useTurnosPaciente", () => {
  beforeEach(() => {
    vi.mocked(useFetch).mockReset();
  });

  it("pide los turnos a /turnos", () => {
    datos([]);

    renderHook(() => useTurnosPaciente());

    expect(useFetch).toHaveBeenCalledWith("/turnos");
  });

  it("el próximo turno es el futuro más cercano, aunque lleguen desordenados", () => {
    datos([turno(1, FUTURO_3), turno(2, FUTURO_1), turno(3, FUTURO_2)]);

    const { result } = renderHook(() => useTurnosPaciente());

    expect(result.current.proximoTurno?.id).toBe(2);
  });

  it("ignora los turnos cancelados y los que ya pasaron", () => {
    datos([turno(1, FUTURO_1, { estado: "Cancelado" }), turno(2, PASADO), turno(3, FUTURO_3)]);

    const { result } = renderHook(() => useTurnosPaciente());

    expect(result.current.proximoTurno?.id).toBe(3);
  });

  it("sin turnos futuros el próximo es null y misTurnos conserva todos", () => {
    datos([turno(1, PASADO)]);

    const { result } = renderHook(() => useTurnosPaciente());

    expect(result.current.proximoTurno).toBeNull();
    expect(result.current.misTurnos).toHaveLength(1);
  });

  it("mientras no hay datos devuelve lista vacía", () => {
    datos(null);

    const { result } = renderHook(() => useTurnosPaciente());

    expect(result.current.misTurnos).toEqual([]);
    expect(result.current.proximoTurno).toBeNull();
  });
});

describe("useTurnosMedico", () => {
  beforeEach(() => {
    vi.mocked(useFetch).mockReset();
  });

  it("sin medicoId devuelve todos los turnos (la agenda del médico logueado)", () => {
    datos([turno(1, FUTURO_1, { medicoId: 1 }), turno(2, FUTURO_1, { medicoId: 2 })]);

    const { result } = renderHook(() => useTurnosMedico());

    expect(result.current.misTurnos).toHaveLength(2);
  });

  it("con medicoId se queda con la agenda de ese médico (vista de la secretaria)", () => {
    datos([turno(1, FUTURO_1, { medicoId: 1 }), turno(2, FUTURO_1, { medicoId: 2 })]);

    const { result } = renderHook(() => useTurnosMedico(2));

    expect(result.current.misTurnos.map((t) => t.id)).toEqual([2]);
  });

  it("turnosDelDia devuelve solo los de ese día, ordenados por hora", () => {
    datos([turno(1, FUTURO_2), turno(2, FUTURO_1), turno(3, FUTURO_3)]);

    const { result } = renderHook(() => useTurnosMedico());

    expect(result.current.turnosDelDia(new Date(2099, 0, 5)).map((t) => t.id)).toEqual([2, 1]);
  });

  it("turnosDelDia de un día sin turnos devuelve lista vacía", () => {
    datos([turno(1, FUTURO_1)]);

    const { result } = renderHook(() => useTurnosMedico());

    expect(result.current.turnosDelDia(new Date(2099, 5, 1))).toEqual([]);
  });
});

describe("consultaDelTurno", () => {
  const entrada = (id: number, fecha: Date) => ({ id, fecha: fecha.toISOString() }) as EntradaClinica;

  it("asocia la consulta registrada el mismo día del turno", () => {
    const e = entrada(7, new Date(2026, 5, 10, 17, 0));

    expect(consultaDelTurno(turno(1, new Date(2026, 5, 10, 9, 0)), [e])).toBe(e);
  });

  it("no asocia una consulta de otro día", () => {
    const e = entrada(7, new Date(2026, 5, 11, 9, 0));

    expect(consultaDelTurno(turno(1, new Date(2026, 5, 10, 9, 0)), [e])).toBeUndefined();
  });

  it("un turno cancelado nunca tiene consulta", () => {
    const e = entrada(7, new Date(2026, 5, 10, 9, 0));

    expect(consultaDelTurno(turno(1, new Date(2026, 5, 10, 9, 0), { estado: "Cancelado" }), [e])).toBeUndefined();
  });

  it("sin entradas devuelve undefined", () => {
    expect(consultaDelTurno(turno(1, PASADO), [])).toBeUndefined();
  });
});
