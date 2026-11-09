import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { AuthContext, type AuthContextType } from "../context/AuthContextBase";

vi.mock("../components/Layout/Layout.tsx", () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock("../hooks/useFetch", () => ({ useFetch: vi.fn() }));
vi.mock("../hooks/useMiHistoria", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../hooks/useMiHistoria")>()),
  useMiHistoria: () => ({ historia: null, loading: false, error: null }),
}));

import { useFetch } from "../hooks/useFetch";
import DetalleTurno from "./DetalleTurno";

const FUTURO = new Date(2099, 2, 5, 10, 30).toISOString();
const PASADO = new Date(2000, 2, 5, 10, 30).toISOString();

const turno = (estado: string, fechaHora: string) => ({
  id: 5,
  estado,
  fechaHora,
  medico: { id: 1, especialidad: "Cardiología", matricula: "MP-1", usuario: { nombre: "Carlos", apellido: "Gómez" } },
});

function renderDetalle(t: unknown, coberturas: unknown[] = []) {
  vi.mocked(useFetch).mockReturnValue(
    t ? { data: t as never, loading: false, error: null } : { data: null, loading: false, error: new Error("404") }
  );
  const auth = { usuario: { id: 10, rol: "PACIENTE", paciente: { id: 15, coberturas } } } as unknown as AuthContextType;

  render(
    <AuthContext.Provider value={auth}>
      <MemoryRouter initialEntries={["/turnos/5"]}>
        <Routes>
          <Route path="/turnos/:id" element={<DetalleTurno />} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  );
}

describe("DetalleTurno según el estado del turno", () => {
  beforeEach(() => {
    vi.mocked(useFetch).mockReset();
  });

  it("un turno inexistente (404 del back) ofrece volver a Mis turnos", () => {
    renderDetalle(null);

    expect(screen.getByText("No encontramos este turno.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Ir a Mis turnos" })).toHaveAttribute("href", "/mis-turnos");
  });

  it("Pendiente a futuro: se puede cancelar y todavía no está confirmado", () => {
    renderDetalle(turno("Pendiente", FUTURO));

    expect(screen.getByText("Por confirmar")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Cancelar turno" })).toHaveAttribute("href", "/turnos/5/cancelar");
  });

  it("Confirmado a futuro: no ofrece cancelar (RN-006) y da recordatorios", () => {
    renderDetalle(turno("Confirmado", FUTURO));

    expect(screen.getByText("Tu turno está confirmado. Te esperamos.")).toBeInTheDocument();
    expect(screen.getByText("Llegá 10 minutos antes.")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Cancelar turno" })).not.toBeInTheDocument();
  });

  it("Cancelado: muestra las etapas Solicitado → Cancelado y ofrece pedir uno nuevo con el mismo médico", () => {
    renderDetalle(turno("Cancelado", FUTURO));

    const etapas = screen.getByRole("list", { name: "Estado del turno" });
    expect(etapas).toHaveTextContent("Solicitado");
    expect(etapas).toHaveTextContent("Cancelado");
    expect(etapas).not.toHaveTextContent("Atendido");
    expect(screen.getByRole("link", { name: "Pedir nuevo turno" })).toHaveAttribute("href", "/pedir-turno?medico=1");
    expect(screen.queryByRole("link", { name: "Cancelar turno" })).not.toBeInTheDocument();
  });

  it("Pasado y sin consulta registrada: figura como finalizado y sugiere pedir otro turno", () => {
    renderDetalle(turno("Confirmado", PASADO));

    expect(screen.getByText("Finalizado")).toBeInTheDocument();
    expect(screen.getByText(/Este turno ya pasó/)).toBeInTheDocument();
    expect(screen.queryByText("Resultado de la consulta")).not.toBeInTheDocument();
  });

  it("sin cobertura figura como Particular", () => {
    renderDetalle(turno("Pendiente", FUTURO), []);

    expect(screen.getByText("Particular")).toBeInTheDocument();
  });

  it("con cobertura muestra obra social y plan, y pide la credencial", () => {
    renderDetalle(turno("Confirmado", FUTURO), [{ plan: "210", obraSocial: { nombre: "OSDE" } }]);

    expect(screen.getByText("OSDE · Plan 210")).toBeInTheDocument();
    expect(screen.getByText(/credencial de tu obra social/)).toBeInTheDocument();
  });

  it("muestra el médico con su especialidad y matrícula", () => {
    renderDetalle(turno("Pendiente", FUTURO));

    expect(screen.getByText("Carlos Gómez")).toBeInTheDocument();
    expect(screen.getByText("Cardiología · Mat. MP-1")).toBeInTheDocument();
  });
});
