import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import VistaAgendaSemanal from "./VistaAgendaSemanal";
import type { Turno } from "../types/Turno";

const dias = [5, 6, 7, 8, 9].map((d) => new Date(2099, 0, d));

const turno = (id: number, dia: number, hora: number, estado = "Confirmado", pacienteId = id): Turno =>
  ({
    id,
    estado,
    pacienteId,
    fechaHora: new Date(2099, 0, dia, hora, 0).toISOString(),
    paciente: { id: pacienteId, usuario: { nombre: "Ana", apellido: `Paciente${id}` } },
  }) as Turno;

function renderAgenda(turnos: Turno[]) {
  const turnosDelDia = (fecha: Date) => turnos.filter((t) => new Date(t.fechaHora).getDate() === fecha.getDate());
  render(
    <MemoryRouter>
      <VistaAgendaSemanal diasSemana={dias} turnosDelDia={turnosDelDia} />
    </MemoryRouter>
  );
}

describe("VistaAgendaSemanal", () => {
  it("muestra una columna de encabezado por día con su número", () => {
    renderAgenda([]);

    for (const d of [5, 6, 7, 8, 9]) expect(screen.getByText(String(d))).toBeInTheDocument();
  });

  it("los días sin turnos dicen 'Sin turnos'", () => {
    renderAgenda([]);

    expect(screen.getAllByText("Sin turnos")).toHaveLength(5);
  });

  it("cuenta los turnos de cada día en singular y plural", () => {
    renderAgenda([turno(1, 5, 9), turno(2, 6, 9), turno(3, 6, 10)]);

    expect(screen.getByText("1 turno")).toBeInTheDocument();
    expect(screen.getByText("2 turnos")).toBeInTheDocument();
  });

  it("los turnos cancelados no cuentan en el resumen del día", () => {
    renderAgenda([turno(1, 5, 9, "Cancelado")]);

    expect(screen.getAllByText("Sin turnos")).toHaveLength(5);
  });

  it("cada turno es un link a la ficha de su paciente, con hora y nombre", () => {
    renderAgenda([turno(1, 5, 9, "Confirmado", 42)]);

    const link = screen.getByRole("link", { name: /09:00/ });
    expect(link).toHaveAttribute("href", "/pacientes/42");
    expect(link).toHaveTextContent("Ana Paciente1");
    expect(link).toHaveClass("estado-confirmado");
  });

  it("con nombre corto, hora y nombre van en un renglón separados por un guion", () => {
    renderAgenda([{ ...turno(1, 5, 9), paciente: { id: 1, usuario: { nombre: "Ana", apellido: "Gómez" } } } as Turno]);

    const link = screen.getByRole("link", { name: /09:00/ });
    expect(link).not.toHaveClass("agenda-evento-largo");
    expect(link).toHaveTextContent("09:00–Ana Gómez");
  });

  it("con nombre largo, va la hora y abajo el nombre (sin guion)", () => {
    renderAgenda([
      { ...turno(1, 5, 9), paciente: { id: 1, usuario: { nombre: "Maria Fernanda", apellido: "Rodriguez Gomez" } } } as Turno,
    ]);

    const link = screen.getByRole("link", { name: /09:00/ });
    expect(link).toHaveClass("agenda-evento-largo");
    expect(link).toHaveTextContent("09:00Maria Fernanda Rodriguez Gomez");
    expect(link.textContent).not.toContain("–");
  });

  it("dibuja las horas de la grilla de 08:00 a 19:00", () => {
    renderAgenda([]);

    expect(screen.getByText("08:00")).toBeInTheDocument();
    expect(screen.getByText("19:00")).toBeInTheDocument();
    expect(screen.queryByText("20:00")).not.toBeInTheDocument();
  });
});
