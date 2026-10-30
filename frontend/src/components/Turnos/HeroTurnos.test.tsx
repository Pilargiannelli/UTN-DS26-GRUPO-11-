import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import HeroTurnos from "./HeroTurnos";
import type { Turno } from "../../types/Turno";

afterEach(cleanup);

const turno: Turno = {
  id: 1,
  estado: "Pendiente",
  fechaHora: "2099-03-14T13:30:00.000Z",
  idWhatsapp: null,
  pagoValidado: false,
  medicoId: 1,
  pacienteId: 1,
  secretariaId: null,
  medico: { id: 1, especialidad: "Traumatología", matricula: "MP-1", usuario: { nombre: "Carlos", apellido: "Gómez", email: "c@x.com" } },
  paciente: { id: 1, usuario: { nombre: "María", apellido: "Flores", email: "m@x.com" } },
};

const renderizar = (props: Partial<Parameters<typeof HeroTurnos>[0]> = {}) =>
  render(
    <HeroTurnos
      rol="SECRETARIA"
      nombre="Ana"
      fecha="jueves 30 de octubre de 2026"
      turnosDeHoy={5}
      pendientes={2}
      proximoTurno={turno}
      {...props}
    />
  );

describe("HeroTurnos (resumen del día)", () => {
  it("resume el día en una línea y resalta lo pendiente de confirmar", () => {
    renderizar();
    expect(screen.getByText("5 turnos")).toBeInTheDocument();
    expect(screen.getByText("2 pendientes de confirmar")).toHaveClass("hero-resumen-pendientes");
  });

  it("usa singular con un solo turno y avisa cuando no hay pendientes", () => {
    renderizar({ turnosDeHoy: 1, pendientes: 0 });
    expect(screen.getByText("1 turno")).toBeInTheDocument();
    expect(screen.getByText(/sin pendientes de confirmar/)).toBeInTheDocument();
  });

  it("muestra el paciente y la hora del próximo turno, no la hora actual", () => {
    renderizar();
    expect(screen.getByText("María Flores")).toBeInTheDocument();
    const hora = new Date(turno.fechaHora).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", hour12: false });
    expect(screen.getByText(new RegExp(`${hora} hs`))).toBeInTheDocument();
  });

  it("el médico ve 'Consultorio' en vez de 'Secretaría'", () => {
    renderizar({ rol: "MEDICO" });
    expect(screen.getByText("Consultorio")).toBeInTheDocument();
  });

  it("sin turnos próximos lo dice", () => {
    renderizar({ proximoTurno: null });
    expect(screen.getByText("Sin turnos próximos")).toBeInTheDocument();
  });
});
