import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route, useLocation } from "react-router-dom";

vi.mock("../components/Layout/Layout.tsx", () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock("../hooks/useFetch", () => ({ useFetch: vi.fn() }));
vi.mock("../services/api", () => ({ apiFetch: vi.fn() }));

import { useFetch } from "../hooks/useFetch";
import { apiFetch } from "../services/api";
import CancelarTurno from "./CancelarTurno";

const turno = {
  id: 5,
  estado: "Pendiente",
  fechaHora: new Date(2099, 2, 5, 10, 30).toISOString(),
  medico: { id: 1, especialidad: "Cardiología", usuario: { nombre: "Carlos", apellido: "Gómez" } },
};

function Destino({ texto }: { texto: string }) {
  const { state } = useLocation();
  return <p>{texto} {JSON.stringify(state)}</p>;
}

function renderCancelar() {
  render(
    <MemoryRouter initialEntries={["/turnos/5/cancelar"]}>
      <Routes>
        <Route path="/turnos/:id/cancelar" element={<CancelarTurno />} />
        <Route path="/mis-turnos" element={<Destino texto="pantalla mis turnos" />} />
        <Route path="/turnos/:id" element={<Destino texto="pantalla detalle" />} />
        <Route path="/home" element={<p>pantalla home</p>} />
      </Routes>
    </MemoryRouter>
  );
}

describe("CancelarTurno", () => {
  beforeEach(() => {
    vi.mocked(useFetch).mockReset();
    vi.mocked(apiFetch).mockReset();
  });

  it("mientras carga muestra un spinner", () => {
    vi.mocked(useFetch).mockReturnValue({ data: null, loading: true, error: null });

    renderCancelar();

    expect(screen.getByRole("status", { name: "Cargando turno" })).toBeInTheDocument();
  });

  it("si el turno no existe o no es del paciente avisa que no lo encontró", () => {
    vi.mocked(useFetch).mockReturnValue({ data: null, loading: false, error: new Error("404") });

    renderCancelar();

    expect(screen.getByText("No encontramos este turno.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Confirmar cancelación" })).not.toBeInTheDocument();
  });

  it("pide el turno de la URL y muestra especialidad, horario y médico", () => {
    vi.mocked(useFetch).mockReturnValue({ data: turno as never, loading: false, error: null });

    renderCancelar();

    expect(useFetch).toHaveBeenCalledWith("/turnos/5");
    const texto = screen.getByText(/Vas a liberar el turno/);
    expect(texto).toHaveTextContent("Cardiología");
    expect(texto).toHaveTextContent("10:30");
    expect(texto).toHaveTextContent("Carlos Gómez");
  });

  it("al confirmar hace PATCH /turnos/5/cancelar y vuelve a Mis turnos avisando que se canceló", async () => {
    vi.mocked(useFetch).mockReturnValue({ data: turno as never, loading: false, error: null });
    vi.mocked(apiFetch).mockResolvedValue({});
    renderCancelar();

    fireEvent.click(screen.getByRole("button", { name: "Confirmar cancelación" }));

    expect(await screen.findByText(/pantalla mis turnos/)).toHaveTextContent('{"turnoCancelado":true}');
    const [ruta, opciones] = vi.mocked(apiFetch).mock.calls[0];
    expect(ruta).toBe("/turnos/5/cancelar");
    expect(opciones?.method).toBe("PATCH");
  });

  it("si el back rechaza (ya confirmado) muestra su mensaje, no navega y permite reintentar", async () => {
    vi.mocked(useFetch).mockReturnValue({ data: turno as never, loading: false, error: null });
    vi.mocked(apiFetch).mockImplementation(async () => {
      throw new Error("El turno ya fue confirmado; comunicate con el consultorio");
    });
    renderCancelar();

    fireEvent.click(screen.getByRole("button", { name: "Confirmar cancelación" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("ya fue confirmado");
    expect(screen.queryByText(/pantalla mis turnos/)).not.toBeInTheDocument();
    await waitFor(() => expect(screen.getByRole("button", { name: "Confirmar cancelación" })).toBeEnabled());
  });

  it("Volver lleva al detalle del turno sin cancelar nada", () => {
    vi.mocked(useFetch).mockReturnValue({ data: turno as never, loading: false, error: null });
    renderCancelar();

    fireEvent.click(screen.getAllByRole("button", { name: "Volver" }).at(-1)!);

    expect(screen.getByText(/pantalla detalle/)).toBeInTheDocument();
    expect(apiFetch).not.toHaveBeenCalled();
  });
});
