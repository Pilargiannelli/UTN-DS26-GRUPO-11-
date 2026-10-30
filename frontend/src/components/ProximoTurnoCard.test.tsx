import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ProximoTurnoCard } from "./ProximoTurnoCard";
import type { EstadoTurno, Turno } from "../types/Turno";

afterEach(cleanup);

const turno = (estado: EstadoTurno): Turno => ({
  id: 5,
  estado,
  fechaHora: "2099-03-14T13:00:00.000Z",
  idWhatsapp: null,
  pagoValidado: false,
  medicoId: 1,
  pacienteId: 1,
  secretariaId: null,
  medico: { id: 1, especialidad: "Traumatología", matricula: "MP-1", usuario: { nombre: "Carlos", apellido: "Gómez", email: "c@x.com" } },
  paciente: { id: 1, usuario: { nombre: "María", apellido: "Flores", email: "m@x.com" } },
});

const renderizar = (t: Turno | null) => render(<MemoryRouter><ProximoTurnoCard turno={t} /></MemoryRouter>);

describe("ProximoTurnoCard", () => {
  it("un turno pendiente se puede cancelar", () => {
    renderizar(turno("Pendiente"));
    expect(screen.getByRole("link", { name: "Cancelar" })).toHaveAttribute("href", "/turnos/5/cancelar");
  });

  it("un turno confirmado no muestra Cancelar (RN-006)", () => {
    renderizar(turno("Confirmado"));
    expect(screen.queryByRole("link", { name: "Cancelar" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Ver más" })).toBeInTheDocument();
  });

  it("sin turno invita a agendar", () => {
    renderizar(null);
    expect(screen.getByRole("link", { name: "Agendar una consulta" })).toHaveAttribute("href", "/pedir-turno");
  });
});
