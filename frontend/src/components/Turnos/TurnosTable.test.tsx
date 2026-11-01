import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AuthContext } from "../../context/AuthContextBase";
import type { AuthContextType } from "../../context/AuthContextBase";
import type { EstadoTurno, Turno } from "../../types/Turno";
import type { RolUsuario } from "../../types/UsuarioSesion";
import TurnosTable from "./TurnosTable";
import { apiFetch } from "../../services/api";

vi.mock("../../services/api", () => ({ apiFetch: vi.fn() }));

afterEach(() => { cleanup(); vi.clearAllMocks(); });

const turno = (id: number, fechaHora: string, estado: EstadoTurno, paciente: string): Turno => ({
  id,
  estado,
  fechaHora,
  idWhatsapp: null,
  pagoValidado: false,
  medicoId: 1,
  pacienteId: id,
  secretariaId: null,
  medico: { id: 1, especialidad: "Traumatología", matricula: "MP-1", usuario: { nombre: "Carlos", apellido: "Gómez", email: "c@x.com" } },
  paciente: { id, usuario: { nombre: paciente, apellido: "Test", email: `${id}@x.com` } },
});

function renderizar(turnos: Turno[], rol: RolUsuario = "SECRETARIA", recepcion = false) {
  const contexto: AuthContextType = {
    usuario: null,
    rol,
    cargando: false,
    estaAutenticado: true,
    setUsuario: vi.fn(),
    tieneRol: (r) => r === rol,
    login: vi.fn(),
    logout: vi.fn(),
  };
  return render(
    <AuthContext.Provider value={contexto}>
      <MemoryRouter>
        <TurnosTable recepcion={recepcion} turnos={turnos} onNuevoTurno={vi.fn()} onTurnoActualizado={vi.fn()} />
      </MemoryRouter>
    </AuthContext.Provider>
  );
}

const turnos = [
  turno(1, "2099-03-14T13:00:00.000Z", "Pendiente", "Ana"),
  turno(2, "2099-03-14T14:00:00.000Z", "Confirmado", "Beto"),
  turno(3, "2099-03-15T13:00:00.000Z", "Reprogramado", "Carla"),
  turno(4, "2099-03-14T15:00:00.000Z", "Cancelado", "Dani"),
];

const panelActivo = () => screen.getByRole("tabpanel");

describe("TurnosTable (próximos turnos por estado)", () => {
  it("el nombre del paciente lleva a su ficha", () => {
    renderizar(turnos);
    expect(screen.getByRole("link", { name: "Ana Test" })).toHaveAttribute("href", "/pacientes/1");
  });

  it("cada pestaña muestra cuántos turnos tiene", () => {
    renderizar(turnos);
    expect(screen.getByRole("tab", { name: /Pendientes/ })).toHaveTextContent("2");
    expect(screen.getByRole("tab", { name: /Confirmados/ })).toHaveTextContent("1");
    expect(screen.getByRole("tab", { name: /Cancelados/ })).toHaveTextContent("1");
  });

  it("arranca en Pendientes (incluye Reprogramados) agrupados por día", () => {
    renderizar(turnos);
    const panel = panelActivo();
    expect(within(panel).getByText("Ana Test")).toBeInTheDocument();
    expect(within(panel).getByText("Carla Test")).toBeInTheDocument();
    expect(within(panel).queryByText("Beto Test")).not.toBeInTheDocument();
    // Ana y Carla son de días distintos: dos títulos de día
    expect(within(panel).getAllByRole("columnheader").filter((th) => th.getAttribute("scope") === "colgroup")).toHaveLength(2);
  });

  it("los cancelados están en su propia pestaña, sin acciones", () => {
    renderizar(turnos);
    fireEvent.click(screen.getByRole("tab", { name: /Cancelados/ }));
    const panel = panelActivo();
    expect(within(panel).getByText("Dani Test")).toBeInTheDocument();
    expect(within(panel).queryByRole("button", { name: "Cancelar" })).not.toBeInTheDocument();
  });

  it("solo los pendientes se pueden confirmar", () => {
    renderizar(turnos);
    expect(within(panelActivo()).getAllByRole("button", { name: "Confirmar" })).toHaveLength(2);
    fireEvent.click(screen.getByRole("tab", { name: /Confirmados/ }));
    expect(within(panelActivo()).queryByRole("button", { name: "Confirmar" })).not.toBeInTheDocument();
  });

  it("una pestaña sin turnos lo dice", () => {
    renderizar([turno(1, "2099-03-14T13:00:00.000Z", "Pendiente", "Ana")]);
    fireEvent.click(screen.getByRole("tab", { name: /Cancelados/ }));
    expect(within(panelActivo()).getByText("No hay turnos cancelados próximos.")).toBeInTheDocument();
  });

  it("el médico no ve la columna Médico (son todos suyos)", () => {
    renderizar(turnos, "MEDICO");
    expect(screen.queryByRole("columnheader", { name: "Médico" })).not.toBeInTheDocument();
  });
});


describe("Filtros del dashboard de Secretaría", () => {
  it("busca por paciente, ignora tildes y actualiza los contadores", () => {
    renderizar(turnos, "SECRETARIA", true);
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "CÁRLA" } });
    expect(screen.getByText("Carla Test")).toBeInTheDocument();
    expect(screen.queryByText("Ana Test")).not.toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Pendientes/ })).toHaveTextContent("1");
  });
  it("busca por profesional y mantiene acceso a cada estado", () => {
    renderizar(turnos, "SECRETARIA", true);
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "gomez" } });
    expect(screen.getByText("Ana Test")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("tab", { name: /Confirmados/ }));
    expect(screen.getByText("Beto Test")).toBeInTheDocument();
  });
  it("filtra una fecha local, distingue falta de coincidencias y permite limpiar", () => {
    renderizar(turnos, "SECRETARIA", true);
    fireEvent.change(screen.getByRole("combobox", { name: "Filtrar por fecha" }), { target: { value: "elegir" } });
    fireEvent.change(screen.getByLabelText("Fecha del turno"), { target: { value: "2099-03-15" } });
    expect(screen.queryByText("Ana Test")).not.toBeInTheDocument();
    expect(screen.getByText("Carla Test")).toBeInTheDocument();
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "inexistente" } });
    expect(screen.getByText("Sin coincidencias")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Limpiar filtros" }));
    expect(screen.getByText("Ana Test")).toBeInTheDocument();
    expect(screen.getByRole("searchbox")).toHaveValue("");
  });
  it("no agrega filtros a la presentación de Médico", () => {
    renderizar(turnos, "MEDICO");
    expect(screen.queryByRole("searchbox")).not.toBeInTheDocument();
  });
});

describe("TurnosTable (confirmación previa de las acciones)", () => {
  const modal = () => within(document.querySelector(".modal-box") as HTMLElement);

  it("pide confirmación antes de confirmar y no actúa si se cancela", () => {
    renderizar(turnos);
    fireEvent.click(within(panelActivo()).getAllByRole("button", { name: "Confirmar" })[0]);

    expect(modal().getByText(/¿Estás seguro de confirmar el turno de Ana Test/)).toBeInTheDocument();
    expect(apiFetch).not.toHaveBeenCalled();

    fireEvent.click(modal().getByRole("button", { name: "Cancelar" }));
    expect(document.querySelector(".modal-box")).toBeNull();
    expect(apiFetch).not.toHaveBeenCalled();
  });

  it("realiza el cambio solo al aceptar", () => {
    vi.mocked(apiFetch).mockResolvedValue(turnos[0]);
    renderizar(turnos);
    fireEvent.click(within(panelActivo()).getAllByRole("button", { name: "Cancelar" })[0]);

    expect(modal().getByText(/¿Estás seguro de cancelar el turno de Ana Test/)).toBeInTheDocument();
    expect(apiFetch).not.toHaveBeenCalled();

    fireEvent.click(modal().getByRole("button", { name: "Aceptar" }));
    expect(apiFetch).toHaveBeenCalledWith("/turnos/1/cancelar", { method: "PATCH" });
  });
});
