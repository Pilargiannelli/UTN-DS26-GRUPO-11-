import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

const sesion = vi.hoisted(() => ({ usuario: null as unknown }));
vi.mock("../hooks/useAuth", () => ({ useAuth: () => ({ usuario: sesion.usuario }) }));
vi.mock("../hooks/useFetch", () => ({ useFetch: vi.fn() }));
// Los tres hijos tienen sus propios tests: acá se reemplazan por stubs que dejan ver qué reciben
vi.mock("../components/Turnos/TurnosTable", () => ({
  default: ({ turnos, onNuevoTurno, onTurnoActualizado }: { turnos: { id: number; estado: string }[]; onNuevoTurno: () => void; onTurnoActualizado: (t: unknown) => void }) => (
    <div>
      <p>tabla con turnos [{turnos.map((t) => `${t.id}:${t.estado}`).join(",")}]</p>
      <button onClick={onNuevoTurno}>tabla: nuevo turno</button>
      <button onClick={() => onTurnoActualizado({ ...turnos[0], estado: "Cancelado" })}>tabla: cancelar primero</button>
    </div>
  ),
}));
vi.mock("../components/Medico/TurnosDeHoy", () => ({
  TurnosDeHoy: ({ turnos, onAgendar }: { turnos: unknown[]; onAgendar: () => void }) => (
    <div>
      <p>turnos de hoy del médico ({turnos.length})</p>
      <button onClick={onAgendar}>hoy: agendar</button>
    </div>
  ),
}));
vi.mock("../components/Turnos/NuevoTurnoModal", () => ({
  default: ({ show, onClose, onAgregar }: { show: boolean; onClose: () => void; onAgregar: (t: unknown) => void }) =>
    show ? (
      <div role="dialog">
        <button onClick={() => onAgregar({ id: 99, estado: "Pendiente", fechaHora: new Date(2099, 0, 1).toISOString() })}>modal: agregar</button>
        <button onClick={onClose}>modal: cerrar</button>
      </div>
    ) : null,
}));

import { useFetch } from "../hooks/useFetch";
import GestionTurnos from "./GestionTurnos";

const AHORA = new Date(2026, 5, 10, 8, 0, 0);
const turno = (id: number, fecha: Date, estado = "Pendiente") => ({ id, estado, fechaHora: fecha.toISOString() });

function renderGestion(
  usuario: unknown,
  turnos: unknown[] | null,
  { recepcion = true, loading = false, error = null as Error | null } = {}
) {
  sesion.usuario = usuario;
  vi.mocked(useFetch).mockReturnValue({ data: turnos as never, loading, error });
  render(
    <MemoryRouter>
      <GestionTurnos recepcion={recepcion} />
    </MemoryRouter>
  );
}

const secretaria = { rol: "SECRETARIA", nombre: "Sol", apellido: "Ríos" };
const medico = { rol: "MEDICO", nombre: "Carlos", apellido: "Gómez" };

describe("GestionTurnos: vistas", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"], now: AHORA });
    vi.mocked(useFetch).mockReset();
  });
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it("mientras carga muestra un spinner", () => {
    renderGestion(secretaria, null, { loading: true });

    expect(document.querySelector(".spinner-border")).toBeInTheDocument();
    expect(screen.queryByText(/tabla con turnos/)).not.toBeInTheDocument();
  });

  it("si falla muestra el mensaje de error", () => {
    renderGestion(secretaria, null, { error: new Error("No se pudo conectar") });

    expect(screen.getByRole("alert")).toHaveTextContent("No se pudo conectar");
  });

  describe("recepción de la secretaria", () => {
    it("saluda por el nombre y ofrece agendar turno, ver agenda y registrar paciente", () => {
      renderGestion(secretaria, []);

      expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Sol");
      expect(screen.getByText("Recepción · Secretaría")).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /Registrar paciente/ })).toHaveAttribute("href", "/registrar-paciente");
      expect(screen.queryByRole("link", { name: /Buscar paciente/ })).not.toBeInTheDocument();
    });

    it("muestra la fecha de hoy en letras", () => {
      renderGestion(secretaria, []);

      expect(screen.getByText(/miércoles, 10 de junio de 2026/i)).toBeInTheDocument();
    });

    it("cuenta en singular o plural los turnos que quedan por atender hoy (sin cancelados ni pasados)", () => {
      renderGestion(secretaria, [turno(1, new Date(2026, 5, 10, 14))]);
      expect(screen.getByRole("link", { name: /turno por atender hoy/ })).toHaveTextContent("1 turno por atender hoy");
      cleanup();

      renderGestion(secretaria, [
        turno(1, new Date(2026, 5, 10, 14)),
        turno(2, new Date(2026, 5, 10, 16)),
        turno(3, new Date(2026, 5, 10, 17), "Cancelado"),
        turno(4, new Date(2026, 5, 10, 7)),
      ]);
      expect(screen.getByRole("link", { name: /turnos por atender hoy/ })).toHaveTextContent("2 turnos por atender hoy");
    });

    it("a la tabla solo le pasa los turnos que todavía no pasaron, ordenados por fecha", () => {
      renderGestion(secretaria, [turno(1, new Date(2026, 5, 20)), turno(2, new Date(2000, 0, 1)), turno(3, new Date(2026, 5, 11))]);

      expect(screen.getByText("tabla con turnos [3:Pendiente,1:Pendiente]")).toBeInTheDocument();
    });

    it("los accesos de agenda llevan a /orden-del-dia", () => {
      renderGestion(secretaria, []);

      expect(screen.getByRole("link", { name: /Ver agenda/ })).toHaveAttribute("href", "/orden-del-dia");
    });
  });

  describe("recepción del médico", () => {
    it("lo saluda como 'Dr. Apellido', ofrece buscar paciente y muestra sus turnos de hoy en lugar de la tabla", () => {
      renderGestion(medico, [turno(1, new Date(2026, 5, 10, 14), "Confirmado")]);

      expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Dr. Gómez");
      expect(screen.getByText("Consultorio · Médico")).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /Buscar paciente/ })).toHaveAttribute("href", "/buscar-paciente");
      expect(screen.getByText("turnos de hoy del médico (1)")).toBeInTheDocument();
      expect(screen.queryByText(/tabla con turnos/)).not.toBeInTheDocument();
    });

    it("agendar desde 'Turnos de hoy' abre el modal", () => {
      renderGestion(medico, []);

      fireEvent.click(screen.getByRole("button", { name: "hoy: agendar" }));

      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });
  });

  describe("sin recepción (pantalla de turnos)", () => {
    it("muestra el encabezado con los contadores por atender hoy y por confirmar", () => {
      renderGestion(secretaria, [
        turno(1, new Date(2026, 5, 10, 14), "Pendiente"),
        turno(2, new Date(2026, 5, 11, 9), "Reprogramado"),
        turno(3, new Date(2026, 5, 11, 10), "Confirmado"),
      ], { recepcion: false });

      expect(screen.getByRole("heading", { level: 1, name: "Turnos" })).toBeInTheDocument();
      expect(screen.getByText("Por atender hoy").nextElementSibling).toHaveTextContent("1");
      expect(screen.getByText("Por confirmar").nextElementSibling).toHaveTextContent("2");
      expect(screen.queryByText("Recepción · Secretaría")).not.toBeInTheDocument();
    });
  });

  describe("cambios desde la pantalla", () => {
    it("un turno creado en el modal se suma a la lista y el modal se cierra con su botón", () => {
      renderGestion(secretaria, [turno(1, new Date(2026, 5, 20))]);

      fireEvent.click(screen.getByRole("button", { name: "tabla: nuevo turno" }));
      fireEvent.click(screen.getByRole("button", { name: "modal: agregar" }));

      expect(screen.getByText("tabla con turnos [1:Pendiente,99:Pendiente]")).toBeInTheDocument();

      fireEvent.click(screen.getByRole("button", { name: "modal: cerrar" }));
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("un turno actualizado desde la tabla reemplaza al original", () => {
      renderGestion(secretaria, [turno(1, new Date(2026, 5, 20)), turno(2, new Date(2026, 5, 21))]);

      fireEvent.click(screen.getByRole("button", { name: "tabla: cancelar primero" }));

      expect(screen.getByText("tabla con turnos [1:Cancelado,2:Pendiente]")).toBeInTheDocument();
    });
  });
});
