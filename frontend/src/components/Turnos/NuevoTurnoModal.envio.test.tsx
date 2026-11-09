import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AuthContext, type AuthContextType } from "../../context/AuthContextBase";

vi.mock("../../hooks/useFetch", () => ({
  useFetch: (url: string) => ({
    data:
      url === "/medicos"
        ? [{ id: 2, especialidad: "Cardiología", usuario: { nombre: "Carlos", apellido: "Gómez" } }]
        : [{ id: 7, usuario: { nombre: "María", apellido: "Flores", dni: "35123456" } }],
    loading: false,
    error: null,
  }),
}));
vi.mock("../../services/api", () => ({
  apiFetch: vi.fn(),
  ApiError: class ApiError extends Error {
    status: number;
    constructor(message: string, status: number) {
      super(message);
      this.status = status;
    }
  },
}));
// El selector de horarios y el buscador tienen sus propios tests: acá se reemplazan por controles mínimos
vi.mock("../SelectorTurno", () => ({
  SelectorTurno: ({ onFecha, onHora, recargar }: { onFecha: (f: string) => void; onHora: (h: string) => void; recargar: number }) => (
    <div>
      <button type="button" onClick={() => onFecha("2099-01-05")}>elegir fecha</button>
      <button type="button" onClick={() => onHora("10:30")}>elegir hora</button>
      <span>recargas: {recargar}</span>
    </div>
  ),
}));
vi.mock("./BuscadorSelect", () => ({
  BuscadorSelect: (p: {
    ariaLabel: string;
    value: string;
    onChange: (v: string) => void;
    bloqueado?: boolean;
    opciones?: { value: string; etiqueta: string }[];
  }) => (
    <select aria-label={p.ariaLabel} value={p.value} disabled={p.bloqueado} onChange={(e) => p.onChange(e.target.value)}>
      <option value="">--</option>
      {(p.opciones ?? []).map((o) => (
        <option key={o.value} value={o.value}>{o.etiqueta}</option>
      ))}
    </select>
  ),
}));

import { apiFetch, ApiError } from "../../services/api";
import NuevoTurnoModal from "./NuevoTurnoModal";

const secretaria = { usuario: { id: 1, rol: "SECRETARIA" } } as unknown as AuthContextType;

function renderModal(props: { pacienteIdInicial?: number } = {}) {
  const onClose = vi.fn();
  const onAgregar = vi.fn();
  render(
    <AuthContext.Provider value={secretaria}>
      <NuevoTurnoModal show onClose={onClose} onAgregar={onAgregar} {...props} />
    </AuthContext.Provider>
  );
  return { onClose, onAgregar };
}

function completar() {
  fireEvent.change(screen.getByLabelText("Paciente"), { target: { value: "7" } });
  fireEvent.change(screen.getByLabelText("Médico"), { target: { value: "2" } });
  fireEvent.click(screen.getByRole("button", { name: "elegir fecha" }));
  fireEvent.click(screen.getByRole("button", { name: "elegir hora" }));
}

const guardar = () => fireEvent.click(screen.getByRole("button", { name: "Guardar Turno" }));

describe("Nuevo turno: envío", () => {
  beforeEach(() => {
    vi.mocked(apiFetch).mockReset();
  });

  it("sin completar nada marca los errores y no llama a la API", async () => {
    renderModal();

    guardar();

    expect(await screen.findByText("Seleccione un paciente")).toBeInTheDocument();
    expect(screen.getByText("Seleccione un médico")).toBeInTheDocument();
    expect(screen.getByText("Seleccione una fecha")).toBeInTheDocument();
    expect(apiFetch).not.toHaveBeenCalled();
  });

  it("elegir una opción limpia su error", async () => {
    renderModal();
    guardar();
    expect(await screen.findByText("Seleccione un paciente")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Paciente"), { target: { value: "7" } });

    expect(screen.queryByText("Seleccione un paciente")).not.toBeInTheDocument();
  });

  it("con todo completo hace POST /turnos, avisa el turno nuevo y cierra", async () => {
    vi.mocked(apiFetch).mockResolvedValue({ id: 99 });
    const { onAgregar, onClose } = renderModal();
    completar();

    guardar();

    await waitFor(() => expect(onAgregar).toHaveBeenCalledWith({ id: 99 }));
    expect(onClose).toHaveBeenCalled();
    const [ruta, opciones] = vi.mocked(apiFetch).mock.calls[0];
    expect(ruta).toBe("/turnos");
    expect(opciones?.method).toBe("POST");
    const body = JSON.parse(opciones!.body as string);
    expect(body).toMatchObject({ pacienteId: 7, medicoId: 2, estado: "Pendiente" });
    expect(body.fechaHora).toBe(new Date("2099-01-05T10:30:00").toISOString());
  });

  it("el estado Confirmado se envía tal cual", async () => {
    vi.mocked(apiFetch).mockResolvedValue({ id: 1 });
    renderModal();
    completar();
    fireEvent.change(screen.getByRole("combobox", { name: "" }), { target: { value: "Confirmado" } });

    guardar();

    await waitFor(() => expect(apiFetch).toHaveBeenCalled());
    expect(JSON.parse(vi.mocked(apiFetch).mock.calls[0][1]!.body as string).estado).toBe("Confirmado");
  });

  it("si el paciente viene fijo (desde su ficha) no se puede cambiar", () => {
    renderModal({ pacienteIdInicial: 7 });

    expect(screen.getByLabelText("Paciente")).toBeDisabled();
    expect(screen.getByLabelText("Paciente")).toHaveValue("7");
  });

  it("un error de la API se muestra y el modal sigue abierto", async () => {
    vi.mocked(apiFetch).mockImplementation(async () => {
      throw new Error("Solo la secretaria o el médico pueden dar turnos");
    });
    const { onAgregar, onClose } = renderModal();
    completar();

    guardar();

    expect(await screen.findByRole("alert")).toHaveTextContent("Solo la secretaria o el médico");
    expect(onAgregar).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Guardar Turno" })).toBeEnabled();
  });

  it("un 409 (horario tomado por otro) borra la hora elegida y pide recargar los ocupados", async () => {
    vi.mocked(apiFetch).mockImplementation(async () => {
      throw new ApiError("El médico ya tiene un turno en ese horario", 409);
    });
    renderModal();
    completar();
    expect(screen.getByText("recargas: 0")).toBeInTheDocument();

    guardar();

    expect(await screen.findByRole("alert")).toHaveTextContent("ya tiene un turno en ese horario");
    expect(screen.getByText("recargas: 1")).toBeInTheDocument();
    // sin hora elegida: volver a guardar exige elegirla de nuevo
    guardar();
    expect(await screen.findByText("Seleccione un horario")).toBeInTheDocument();
  });

  it("Cancelar cierra sin llamar a la API", () => {
    const { onClose } = renderModal();

    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(onClose).toHaveBeenCalled();
    expect(apiFetch).not.toHaveBeenCalled();
  });
});
