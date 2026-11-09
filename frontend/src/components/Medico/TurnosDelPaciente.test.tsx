import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

vi.mock("../../hooks/useFetch", () => ({ useFetch: vi.fn() }));

import { useFetch } from "../../hooks/useFetch";
import { TurnosDelPaciente } from "./TurnosDelPaciente";

const turno = (id: number, pacienteId: number, fecha: Date, estado = "Confirmado") => ({
  id,
  pacienteId,
  estado,
  fechaHora: fecha.toISOString(),
  medico: { especialidad: "Cardiología" },
});

function renderTurnos(data: unknown, extra: { loading?: boolean; error?: Error | null } = {}) {
  vi.mocked(useFetch).mockReturnValue({ data: data as never, loading: false, error: null, ...extra });
  render(
    <MemoryRouter>
      <TurnosDelPaciente pacienteId={1} />
    </MemoryRouter>
  );
}

describe("TurnosDelPaciente (ficha del médico)", () => {
  beforeEach(() => {
    vi.mocked(useFetch).mockReset();
  });

  it("mientras carga muestra un spinner", () => {
    renderTurnos(null, { loading: true });

    expect(screen.getByRole("status", { name: "Cargando turnos" })).toBeInTheDocument();
  });

  it("si falla muestra el motivo", () => {
    renderTurnos(null, { error: new Error("sin conexión") });

    expect(screen.getByText(/No se pudieron cargar los turnos: sin conexión/)).toBeInTheDocument();
  });

  it("sin turnos del paciente con este médico lo dice", () => {
    renderTurnos([turno(1, 2, new Date(2099, 0, 5, 9))]);

    expect(screen.getByText("Todavía no tiene turnos con vos.")).toBeInTheDocument();
  });

  it("muestra solo los turnos de ese paciente, del más nuevo al más viejo", () => {
    renderTurnos([
      turno(1, 1, new Date(2099, 0, 5, 9)),
      turno(2, 1, new Date(2099, 0, 7, 9)),
      turno(3, 9, new Date(2099, 0, 6, 9)),
    ]);

    const filas = screen.getAllByRole("listitem");
    expect(filas).toHaveLength(2);
    expect(filas[0]).toHaveTextContent(/7 ene/);
    expect(filas[1]).toHaveTextContent(/5 ene/);
  });

  it("un turno pasado y no cancelado figura como 'Realizado'", () => {
    renderTurnos([turno(1, 1, new Date(2000, 0, 5, 9), "Confirmado")]);

    expect(screen.getByText("Realizado")).toBeInTheDocument();
  });

  it("un turno pasado cancelado sigue figurando como Cancelado", () => {
    renderTurnos([turno(1, 1, new Date(2000, 0, 5, 9), "Cancelado")]);

    expect(screen.getByText("Cancelado")).toBeInTheDocument();
    expect(screen.queryByText("Realizado")).not.toBeInTheDocument();
  });

  it("un turno futuro muestra su estado", () => {
    renderTurnos([turno(1, 1, new Date(2099, 0, 5, 9), "Pendiente")]);

    expect(screen.getByText("Pendiente")).toBeInTheDocument();
  });

  it("con hasta 3 turnos no ofrece 'Ver más'", () => {
    renderTurnos([1, 2, 3].map((i) => turno(i, 1, new Date(2099, 0, i + 1, 9))));

    expect(screen.getAllByRole("listitem")).toHaveLength(3);
    expect(screen.queryByRole("link", { name: /Ver más/ })).not.toBeInTheDocument();
  });

  it("con más de 3 muestra 3 y 'Ver más' con la cantidad restante, que lleva a la lista completa", () => {
    renderTurnos([1, 2, 3, 4, 5].map((i) => turno(i, 1, new Date(2099, 0, i + 1, 9))));

    expect(screen.getAllByRole("listitem")).toHaveLength(3);
    const link = screen.getByRole("link", { name: "Ver más (2)" });
    expect(link).toHaveAttribute("href", "/pacientes/1/turnos");
  });
});
