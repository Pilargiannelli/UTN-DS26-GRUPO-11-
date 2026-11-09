import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { AuthContext, type AuthContextType } from "../context/AuthContextBase";

vi.mock("../hooks/useHistoriaClinica", () => ({ useHistoriaClinica: vi.fn() }));

import { useHistoriaClinica } from "../hooks/useHistoriaClinica";
import { HistorialMedicoCard } from "./HistorialMedicoCard";

const historia = {
  paciente: { id: 9, nombre: "Ana", apellido: "Pérez", dni: "1" },
  medicoResponsable: "Carlos Gómez",
  alergias: ["Penicilina"],
  antecedentes: ["Asma"],
  entradas: [
    { id: 1, historiaClinicaId: 1, fecha: new Date(2026, 5, 10, 12).toISOString(), diagnostico: "Gripe", evolucion: "Reposo", observaciones: "" },
  ],
};

function mockHook(parcial: Record<string, unknown> = {}) {
  const actualizarListas = vi.fn().mockResolvedValue(undefined);
  vi.mocked(useHistoriaClinica).mockReturnValue({
    historia,
    loading: false,
    error: null,
    agregarEntrada: vi.fn(),
    actualizarListas,
    ...parcial,
  } as never);
  return actualizarListas;
}

function renderCard(rol: "MEDICO" | "PACIENTE") {
  const auth = { tieneRol: (r: string) => r === rol } as unknown as AuthContextType;
  render(
    <AuthContext.Provider value={auth}>
      <MemoryRouter initialEntries={["/perfil"]}>
        <Routes>
          <Route path="/perfil" element={<HistorialMedicoCard pacienteId={9} />} />
          <Route path="/pacientes/:id" element={<p>pantalla ficha del paciente</p>} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  );
}

describe("HistorialMedicoCard", () => {
  beforeEach(() => {
    vi.mocked(useHistoriaClinica).mockReset();
  });

  it("pide la historia del paciente indicado", () => {
    mockHook();

    renderCard("PACIENTE");

    expect(useHistoriaClinica).toHaveBeenCalledWith(9);
  });

  it("mientras carga muestra un spinner", () => {
    mockHook({ historia: null, loading: true });

    renderCard("PACIENTE");

    expect(screen.queryByText("Historia clínica")).not.toBeInTheDocument();
  });

  it("si falla muestra el error", () => {
    mockHook({ historia: null, error: new Error("No autorizado") });

    renderCard("PACIENTE");

    expect(screen.getByRole("alert")).toHaveTextContent("No autorizado");
  });

  it("muestra las consultas con el médico responsable", () => {
    mockHook();

    renderCard("PACIENTE");

    expect(screen.getByText("Gripe")).toBeInTheDocument();
    expect(screen.getByText("Carlos Gómez")).toBeInTheDocument();
  });

  it("sin consultas lo avisa", () => {
    mockHook({ historia: { ...historia, entradas: [] } });

    renderCard("PACIENTE");

    expect(screen.getByText("No hay consultas registradas.")).toBeInTheDocument();
  });

  it("el PACIENTE solo lee: sin 'Nueva consulta' ni botones de edición", () => {
    mockHook();

    renderCard("PACIENTE");

    expect(screen.queryByRole("button", { name: "Nueva consulta" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Editar" })).not.toBeInTheDocument();
    expect(screen.getByText("Penicilina")).toBeInTheDocument();
    expect(screen.getByText("Asma")).toBeInTheDocument();
  });

  it("el MEDICO puede crear una consulta: lo lleva a la ficha del paciente", () => {
    mockHook();
    renderCard("MEDICO");

    fireEvent.click(screen.getByRole("button", { name: "Nueva consulta" }));

    expect(screen.getByText("pantalla ficha del paciente")).toBeInTheDocument();
  });

  it("el MEDICO edita alergias: pide confirmación y recién entonces guarda", async () => {
    const actualizarListas = mockHook();
    renderCard("MEDICO");

    fireEvent.click(screen.getAllByRole("button", { name: "Editar" })[0]);
    fireEvent.change(screen.getByPlaceholderText("Nueva alergia..."), { target: { value: "Polen" } });
    fireEvent.click(screen.getByRole("button", { name: "+" }));
    fireEvent.click(screen.getByRole("button", { name: /Guardar Cambios/ }));

    expect(screen.getByText("¿Está seguro que quiere guardar los cambios en Alergias?")).toBeInTheDocument();
    expect(actualizarListas).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Aceptar" }));

    await waitFor(() =>
      expect(actualizarListas).toHaveBeenCalledWith({ alergias: ["Penicilina", "Polen"], antecedentes: ["Asma"] })
    );
  });

  it("cancelar la confirmación no guarda nada", () => {
    const actualizarListas = mockHook();
    renderCard("MEDICO");
    fireEvent.click(screen.getAllByRole("button", { name: "Editar" })[0]);
    fireEvent.click(screen.getByRole("button", { name: /Guardar Cambios/ }));

    fireEvent.click(screen.getAllByRole("button", { name: "Cancelar" }).at(-1)!);

    expect(actualizarListas).not.toHaveBeenCalled();
    expect(screen.queryByText(/¿Está seguro/)).not.toBeInTheDocument();
  });

  it("si el guardado falla muestra el mensaje del back", async () => {
    const actualizarListas = mockHook();
    actualizarListas.mockRejectedValue(new Error("No se pudo guardar"));
    renderCard("MEDICO");
    fireEvent.click(screen.getAllByRole("button", { name: "Editar" })[0]);
    fireEvent.click(screen.getByRole("button", { name: /Guardar Cambios/ }));

    fireEvent.click(screen.getByRole("button", { name: "Aceptar" }));

    expect(await screen.findByText("No se pudo guardar")).toBeInTheDocument();
  });
});
