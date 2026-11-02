import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import type { Turno } from "../../types/Turno";
import { TurnosDeHoy } from "./TurnosDeHoy";

vi.mock("../../hooks/useFetch", () => ({
  useFetch: () => ({
    data: [
      { id: 1, coberturas: [{ nroAfiliado: "1", plan: "210", obraSocial: { id: 1, nombre: "OSDE" } }] },
      { id: 2, coberturas: [] },
    ],
    loading: false,
    error: null,
  }),
}));

afterEach(cleanup);

const aHora = (dias: number, hora: number, minutos = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + dias);
  d.setHours(hora, minutos, 0, 0);
  return d.toISOString();
};

const turno = (id: number, pacienteId: number, nombre: string, fechaHora: string, estado: Turno["estado"] = "Confirmado"): Turno => ({
  id, estado, fechaHora, idWhatsapp: null, pagoValidado: false, medicoId: 1, pacienteId, secretariaId: null,
  medico: { id: 1, especialidad: "Cardiología", matricula: "MP-1", usuario: { nombre: "Carlos", apellido: "Gómez", email: "c@x.com" } },
  paciente: { id: pacienteId, usuario: { nombre, apellido: "Test", email: `${id}@x.com` } },
});

const renderizar = (turnos: Turno[], onAgendar = vi.fn()) =>
  render(<MemoryRouter><TurnosDeHoy turnos={turnos} onAgendar={onAgendar} /></MemoryRouter>);

describe("Inicio del médico: turnos de hoy", () => {
  it("lista solo los turnos confirmados de hoy, ordenados por hora, con la obra social del paciente", () => {
    renderizar([
      turno(1, 2, "Tomás", aHora(0, 11, 30)),
      turno(2, 1, "Carolina", aHora(0, 9)),
      turno(3, 1, "Mañana", aHora(1, 9)),
      turno(4, 1, "Cancelada", aHora(0, 10), "Cancelado"),
      turno(5, 1, "Pendiente", aHora(0, 10, 30), "Pendiente"),
      turno(6, 1, "Reprogramada", aHora(0, 12), "Reprogramado"),
    ]);

    const filas = within(screen.getByRole("table")).getAllByRole("row").slice(1);
    expect(filas).toHaveLength(2);
    expect(within(filas[0]).getByText("Carolina Test")).toBeInTheDocument();
    expect(within(filas[0]).getByText("OSDE")).toBeInTheDocument();
    expect(within(filas[1]).getByText("Tomás Test")).toBeInTheDocument();
    expect(within(filas[1]).getByText("Sin obra social")).toBeInTheDocument();
  });

  it("sin turnos hoy muestra el aviso con Agendar turno y Ver agenda", () => {
    const onAgendar = vi.fn();
    renderizar([turno(1, 1, "Mañana", aHora(1, 9))], onAgendar);

    expect(screen.getByText("No tenés turnos programados para hoy")).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Ver agenda/ })).toHaveAttribute("href", "/orden-del-dia");
    fireEvent.click(screen.getByRole("button", { name: /Agendar turno/ }));
    expect(onAgendar).toHaveBeenCalled();
  });
});
