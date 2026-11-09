import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthContext, type AuthContextType } from "../context/AuthContextBase";

vi.mock("../components/Layout/Layout.tsx", () => ({ default: ({ children }: { children: React.ReactNode }) => <div>{children}</div> }));
vi.mock("../hooks/useFetch", () => ({ useFetch: vi.fn() }));
vi.mock("../services/api", () => ({
  apiFetch: vi.fn(),
  ApiError: class ApiError extends Error {
    status: number;
    constructor(message: string, status: number) {
      super(message);
      this.status = status;
    }
  },
}));
vi.mock("../components/SelectorTurno", () => ({
  SelectorTurno: ({ medicoId, onFecha, onHora, recargar }: { medicoId: string; onFecha: (f: string) => void; onHora: (h: string) => void; recargar: number }) => (
    <div>
      <p>selector para médico "{medicoId}" (recargas {recargar})</p>
      <button onClick={() => onFecha("2099-01-05")}>elegir fecha</button>
      <button onClick={() => onHora("10:30")}>elegir hora</button>
    </div>
  ),
}));

import { useFetch } from "../hooks/useFetch";
import { apiFetch, ApiError } from "../services/api";
import PedirTurno from "./PedirTurno";

const medicos = [
  { id: 1, especialidad: "Cardiología", matricula: "MP-1", usuario: { nombre: "Carlos", apellido: "Gómez" } },
  { id: 2, especialidad: "Cardiología", matricula: "MP-2", usuario: { nombre: "Dora", apellido: "Paz" } },
  { id: 3, especialidad: "Pediatría", matricula: "MP-3", usuario: { nombre: "Laura", apellido: "Sosa" } },
];

function Destino() {
  const { pathname, state } = useLocation();
  return <p>destino {pathname} {JSON.stringify(state)}</p>;
}

function renderPedir({ ruta = "/pedir-turno", cargando = false, cobertura = true } = {}) {
  vi.mocked(useFetch).mockImplementation(((url: string) => ({
    data: cargando ? null : url === "/especialidades" ? ["Cardiología", "Pediatría"] : medicos,
    loading: cargando,
    error: null,
  })) as never);
  const auth = {
    usuario: { paciente: { coberturas: cobertura ? [{ plan: "210", obraSocial: { nombre: "OSDE" } }] : [] } },
  } as unknown as AuthContextType;
  render(
    <AuthContext.Provider value={auth}>
      <MemoryRouter initialEntries={[ruta]}>
        <Routes>
          <Route path="/pedir-turno" element={<PedirTurno />} />
          <Route path="/mis-turnos" element={<Destino />} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  );
}

const confirmar = () => screen.getByRole("button", { name: "Confirmar turno" });
const completarFechaYHora = () => {
  fireEvent.click(screen.getByRole("button", { name: "elegir fecha" }));
  fireEvent.click(screen.getByRole("button", { name: "elegir hora" }));
};

describe("Pedir turno: flujo de tres pasos", () => {
  beforeEach(() => {
    vi.mocked(useFetch).mockReset();
    vi.mocked(apiFetch).mockReset();
  });

  it("mientras carga las especialidades muestra un spinner", () => {
    renderPedir({ cargando: true });

    expect(screen.getByRole("status", { name: "Cargando especialidades" })).toBeInTheDocument();
  });

  it("arranca sin nada elegido: pide primero la especialidad y no se puede confirmar", () => {
    renderPedir();

    expect(screen.getByText("Primero elegí una especialidad.")).toBeInTheDocument();
    expect(screen.getAllByText("Sin elegir")).toHaveLength(4);
    expect(confirmar()).toBeDisabled();
  });

  it("elegir una especialidad ofrece solo los médicos de esa especialidad", () => {
    renderPedir();

    fireEvent.click(screen.getByRole("button", { name: "Cardiología" }));

    expect(screen.getByRole("button", { name: /Carlos Gómez/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Dora Paz/ })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Laura Sosa/ })).not.toBeInTheDocument();
  });

  it("con una especialidad de un solo profesional lo elige solo", () => {
    renderPedir();

    fireEvent.click(screen.getByRole("button", { name: "Pediatría" }));

    expect(screen.getByRole("button", { name: /Laura Sosa/ })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText('selector para médico "3" (recargas 0)')).toBeInTheDocument();
  });

  it("cambiar de especialidad borra el profesional, el día y el horario ya elegidos", () => {
    renderPedir();
    fireEvent.click(screen.getByRole("button", { name: "Cardiología" }));
    fireEvent.click(screen.getByRole("button", { name: /Carlos Gómez/ }));
    completarFechaYHora();
    expect(confirmar()).toBeEnabled();

    fireEvent.click(screen.getByRole("button", { name: "Pediatría" }));
    fireEvent.click(screen.getByRole("button", { name: "Cardiología" }));

    expect(confirmar()).toBeDisabled();
    expect(screen.getByRole("button", { name: /Carlos Gómez/ })).toHaveAttribute("aria-pressed", "false");
  });

  it("cambiar de profesional borra el día y el horario", () => {
    renderPedir();
    fireEvent.click(screen.getByRole("button", { name: "Cardiología" }));
    fireEvent.click(screen.getByRole("button", { name: /Carlos Gómez/ }));
    completarFechaYHora();

    fireEvent.click(screen.getByRole("button", { name: /Dora Paz/ }));

    expect(confirmar()).toBeDisabled();
  });

  it("elegir otro día borra el horario", () => {
    renderPedir({ ruta: "/pedir-turno?medico=1" });
    completarFechaYHora();
    expect(confirmar()).toBeEnabled();

    fireEvent.click(screen.getByRole("button", { name: "elegir fecha" }));

    expect(confirmar()).toBeDisabled();
  });

  it("el resumen se va completando con especialidad, profesional, día, horario y cobertura", () => {
    renderPedir({ ruta: "/pedir-turno?medico=1" });
    completarFechaYHora();

    const resumen = screen.getByRole("complementary", { name: "Resumen del turno" });
    expect(resumen).toHaveTextContent("Cardiología");
    expect(resumen).toHaveTextContent("Carlos Gómez");
    expect(resumen).toHaveTextContent(/lunes, 5 de enero/i);
    expect(resumen).toHaveTextContent("10:30 h");
    expect(resumen).toHaveTextContent("OSDE · Plan 210");
    expect(resumen).toHaveTextContent("credencial de tu obra social");
  });

  it("sin cobertura no muestra ese dato ni pide la credencial", () => {
    renderPedir({ ruta: "/pedir-turno?medico=1", cobertura: false });

    const resumen = screen.getByRole("complementary", { name: "Resumen del turno" });
    expect(resumen).not.toHaveTextContent("Cobertura");
    expect(resumen).not.toHaveTextContent("credencial de tu obra social");
  });

  describe("confirmar", () => {
    it("hace POST /turnos solo con médico y fecha (el paciente sale del token) y va a Mis turnos avisando", async () => {
      vi.mocked(apiFetch).mockResolvedValue({});
      renderPedir({ ruta: "/pedir-turno?medico=1" });
      completarFechaYHora();

      fireEvent.click(confirmar());

      expect(await screen.findByText(/destino \/mis-turnos/)).toHaveTextContent('{"turnoCreado":true}');
      const [ruta, opciones] = vi.mocked(apiFetch).mock.calls[0];
      expect(ruta).toBe("/turnos");
      expect(opciones?.method).toBe("POST");
      const body = JSON.parse(opciones!.body as string);
      expect(body).toEqual({ medicoId: 1, fechaHora: new Date("2099-01-05T10:30:00").toISOString() });
      expect(body).not.toHaveProperty("pacienteId");
    });

    it("un error de la API se muestra y se puede volver a intentar", async () => {
      vi.mocked(apiFetch).mockImplementation(async () => {
        throw new Error("Sin conexión");
      });
      renderPedir({ ruta: "/pedir-turno?medico=1" });
      completarFechaYHora();

      fireEvent.click(confirmar());

      expect(await screen.findByRole("alert")).toHaveTextContent("Sin conexión");
      await waitFor(() => expect(confirmar()).toBeEnabled());
      expect(screen.queryByText(/destino \/mis-turnos/)).not.toBeInTheDocument();
    });

    it("un 409 (otro paciente tomó el horario) deselecciona la hora y pide recargar los ocupados", async () => {
      vi.mocked(apiFetch).mockImplementation(async () => {
        throw new ApiError("El médico ya tiene un turno en ese horario", 409);
      });
      renderPedir({ ruta: "/pedir-turno?medico=1" });
      completarFechaYHora();

      fireEvent.click(confirmar());

      expect(await screen.findByRole("alert")).toHaveTextContent("ya tiene un turno en ese horario");
      expect(screen.getByText('selector para médico "1" (recargas 1)')).toBeInTheDocument();
      expect(confirmar()).toBeDisabled();
    });
  });
});
