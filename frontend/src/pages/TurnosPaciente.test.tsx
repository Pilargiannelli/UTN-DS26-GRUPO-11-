import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { AuthContext } from "../context/AuthContextBase";
import type { AuthContextType } from "../context/AuthContextBase";
import type { EstadoTurno } from "../types/Turno";
import TurnosPaciente from "./TurnosPaciente";

const hoy = new Date();
const enDias = (dias: number) => new Date(hoy.getTime() + dias * 86400000).toISOString();

const turno = (id: number, dias: number, estado: EstadoTurno, pacienteId = 1) => ({
  id, estado, fechaHora: enDias(dias), idWhatsapp: null, pagoValidado: false, medicoId: 1, pacienteId, secretariaId: null,
  medico: { id: 1, especialidad: "Traumatología", matricula: "MP-1", usuario: { nombre: "Carlos", apellido: "Gómez", email: "c@x.com" } },
  paciente: { id: pacienteId, usuario: { nombre: "María", apellido: "Flores", email: "m@x.com" } },
});

// 10 turnos de María + 1 de otro paciente (no debe aparecer)
const turnos = [
  ...Array.from({ length: 10 }, (_, i) => turno(i + 1, i < 3 ? i + 2 : -(i * 10), i % 4 === 0 ? "Cancelado" : i < 3 ? "Confirmado" : "Pendiente")),
  turno(99, 5, "Confirmado", 2),
];

vi.mock("../hooks/useFetch", () => ({
  useFetch: (url: string) =>
    url === "/turnos"
      ? { data: turnos, loading: false, error: null }
      : url === "/medicos"
        ? {
            data: [
              { id: 1, especialidad: "Traumatología", usuario: { nombre: "Carlos", apellido: "Gómez" } },
              { id: 2, especialidad: "Cardiología", usuario: { nombre: "Mauricio", apellido: "Paz" } },
            ],
            loading: false,
            error: null,
          }
        : { data: { usuario: { nombre: "María", apellido: "Flores" } }, loading: false, error: null },
}));

const contexto: AuthContextType = {
  usuario: { id: 1, username: "dr", nombre: "Carlos", apellido: "Gómez", dni: "1", email: "c@x.com", fotoPerfil: null, rol: "MEDICO" },
  rol: "MEDICO",
  cargando: false,
  estaAutenticado: true,
  setUsuario: vi.fn(),
  tieneRol: (r) => r === "MEDICO",
  login: vi.fn(),
  logout: vi.fn(),
};

const renderizar = () =>
  render(
    <AuthContext.Provider value={contexto}>
      <MemoryRouter initialEntries={["/pacientes/1/turnos"]}>
        <Routes><Route path="/pacientes/:id/turnos" element={<TurnosPaciente />} /></Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  );

afterEach(cleanup);

const filas = () => within(screen.getByRole("table")).getAllByRole("row").slice(1);

describe("Todos los turnos del paciente con este médico", () => {
  it("muestra solo los turnos de ese paciente, de a 8, con botón Volver", () => {
    renderizar();

    expect(screen.getByText(/María Flores · 10 turnos con vos/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Volver" })).toBeInTheDocument();
    expect(filas()).toHaveLength(8);
    expect(screen.getByText("Mostrando 1–8 de 10")).toBeInTheDocument();
  });

  it("filtra por estado y por fecha (próximos / anteriores)", () => {
    renderizar();

    fireEvent.change(screen.getByLabelText("Estado"), { target: { value: "Confirmado" } });
    expect(filas()).toHaveLength(2);

    fireEvent.change(screen.getByLabelText("Estado"), { target: { value: "todos" } });
    fireEvent.change(screen.getByLabelText("Fecha"), { target: { value: "proximos" } });
    expect(filas()).toHaveLength(3);

    fireEvent.change(screen.getByLabelText("Fecha"), { target: { value: "anteriores" } });
    expect(filas()).toHaveLength(7);
  });

  it("al elegir médico la especialidad se completa y queda fija; por especialidad solo se ofrecen sus médicos", () => {
    renderizar();

    fireEvent.change(screen.getByLabelText("Especialidad"), { target: { value: "Cardiología" } });
    fireEvent.focus(screen.getByLabelText("Médico"));
    expect(screen.queryByRole("option", { name: /Carlos Gómez/ })).not.toBeInTheDocument();
    expect(screen.getByRole("option", { name: /Mauricio Paz/ })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Limpiar filtros" }));
    fireEvent.focus(screen.getByLabelText("Médico"));
    fireEvent.click(screen.getByRole("option", { name: /Carlos Gómez/ }));
    expect(screen.getByLabelText("Especialidad")).toHaveValue("Traumatología");
    expect(screen.getByLabelText("Especialidad")).toBeDisabled();
  });

  it("limpia los filtros", () => {
    renderizar();
    fireEvent.change(screen.getByLabelText("Fecha"), { target: { value: "proximos" } });
    fireEvent.click(screen.getByRole("button", { name: "Limpiar filtros" }));
    expect(screen.getByText("Mostrando 1–8 de 10")).toBeInTheDocument();
  });
});
