import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";

vi.mock("../../hooks/useHistoriaClinica", () => ({ useHistoriaClinica: vi.fn() }));
vi.mock("./TurnosDelPaciente", () => ({ TurnosDelPaciente: ({ pacienteId }: { pacienteId: number }) => <p>turnos del paciente {pacienteId}</p> }));
vi.mock("../NuevaEntradaForm", () => ({
  NuevaEntradaForm: ({ onGuardar, onCancelar }: { onGuardar: (d: unknown) => Promise<void>; onCancelar: () => void }) => (
    <div>
      <button onClick={() => onGuardar({ diagnostico: "Gripe", evolucion: "Reposo", observaciones: "" })}>guardar entrada</button>
      <button onClick={onCancelar}>cancelar entrada</button>
    </div>
  ),
}));
vi.mock("../Turnos/NuevoTurnoModal", () => ({
  default: ({ pacienteIdInicial, onClose, onAgregar }: { pacienteIdInicial: number; onClose: () => void; onAgregar: () => void }) => (
    <div>
      <p>modal de turno para {pacienteIdInicial}</p>
      <button onClick={onAgregar}>turno agregado</button>
      <button onClick={onClose}>cerrar modal</button>
    </div>
  ),
}));

import { useHistoriaClinica } from "../../hooks/useHistoriaClinica";
import { PanelPacienteMedico } from "./PanelPacienteMedico";

const usuario = { id: 3, nombre: "Ana", apellido: "Pérez", dni: "30111222", email: "ana@imos.test" } as never;
const paciente = (extra = {}) =>
  ({ id: 9, sexo: "Femenino", telefono: "2344111111", fechaNacimiento: "1990-03-05T00:00:00.000Z", coberturas: [], ...extra }) as never;

const entrada = (id: number) => ({
  id,
  historiaClinicaId: 1,
  fecha: new Date(2026, 0, id, 12).toISOString(),
  diagnostico: `Diagnóstico ${id}`,
  evolucion: "Evolución",
  observaciones: "",
});

function mockHistoria(parcial: Record<string, unknown> = {}) {
  const agregarEntrada = vi.fn().mockResolvedValue(undefined);
  const actualizarListas = vi.fn().mockResolvedValue(undefined);
  vi.mocked(useHistoriaClinica).mockReturnValue({
    historia: { alergias: ["Polen"], antecedentes: ["Asma"], entradas: [], medicoResponsable: "Carlos Gómez" },
    loading: false,
    error: null,
    agregarEntrada,
    actualizarListas,
    ...parcial,
  } as never);
  return { agregarEntrada, actualizarListas };
}

function renderPanel(p = paciente()) {
  render(
    <MemoryRouter initialEntries={["/ficha"]}>
      <Routes>
        <Route path="/ficha" element={<PanelPacienteMedico usuario={usuario} paciente={p} />} />
        <Route path="/pacientes/:id/historial" element={<p>pantalla historial completo</p>} />
      </Routes>
    </MemoryRouter>
  );
}

describe("PanelPacienteMedico: acciones y estados", () => {
  beforeEach(() => {
    vi.mocked(useHistoriaClinica).mockReset();
  });

  it("pide la historia del paciente de la ficha", () => {
    mockHistoria();

    renderPanel();

    expect(useHistoriaClinica).toHaveBeenCalledWith(9);
    expect(screen.getByText("turnos del paciente 9")).toBeInTheDocument();
  });

  it("mientras carga la historia muestra un spinner y no las listas", () => {
    mockHistoria({ historia: null, loading: true });

    renderPanel();

    expect(screen.getByRole("status", { name: "Cargando historia clínica" })).toBeInTheDocument();
    expect(screen.queryByText("Alergias")).not.toBeInTheDocument();
  });

  it("si la historia falla muestra el error", () => {
    mockHistoria({ historia: null, error: new Error("No autorizado") });

    renderPanel();

    expect(screen.getByRole("alert")).toHaveTextContent("No autorizado");
  });

  it("sin consultas dice que todavía no hay y no ofrece 'Ver todas'", () => {
    mockHistoria();

    renderPanel();

    expect(screen.getByText("Todavía no hay consultas registradas.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Ver todas/ })).not.toBeInTheDocument();
  });

  it("sin obra social lo aclara; con obra social muestra plan y afiliado", () => {
    mockHistoria();
    renderPanel();
    expect(screen.getByText("Sin obra social.")).toBeInTheDocument();
  });

  it("con cobertura muestra obra social, plan y afiliado", () => {
    mockHistoria();

    renderPanel(paciente({ coberturas: [{ plan: "210", nroAfiliado: "A-1", obraSocial: { nombre: "OSDE" } }] }));

    expect(screen.getByText("OSDE")).toBeInTheDocument();
    expect(screen.getByText("210")).toBeInTheDocument();
    expect(screen.getByText("A-1")).toBeInTheDocument();
  });

  it("muestra los datos generales y de contacto del paciente", () => {
    mockHistoria();

    renderPanel();

    expect(screen.getByText("05/03/1990")).toBeInTheDocument();
    expect(screen.getByText("2344111111")).toBeInTheDocument();
    expect(screen.getByText("ana@imos.test")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Ana Pérez");
  });

  it("'Ver todas' lleva al historial completo", () => {
    mockHistoria({ historia: { alergias: [], antecedentes: [], entradas: [1, 2, 3, 4].map(entrada), medicoResponsable: null } });
    renderPanel();

    fireEvent.click(screen.getByRole("button", { name: "Ver todas (4)" }));

    expect(screen.getByText("pantalla historial completo")).toBeInTheDocument();
  });

  describe("nueva consulta", () => {
    it("'Registrar consulta' abre el formulario y Cancelar lo cierra", () => {
      mockHistoria();
      renderPanel();

      fireEvent.click(screen.getByRole("button", { name: "Registrar consulta" }));
      expect(screen.getByRole("button", { name: "guardar entrada" })).toBeInTheDocument();

      fireEvent.click(screen.getByRole("button", { name: "cancelar entrada" }));
      expect(screen.queryByRole("button", { name: "guardar entrada" })).not.toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Registrar consulta" })).toBeInTheDocument();
    });

    it("guardar la consulta la agrega a la historia, cierra el formulario y avisa", async () => {
      const { agregarEntrada } = mockHistoria();
      renderPanel();
      fireEvent.click(screen.getByRole("button", { name: /Nueva consulta/ }));

      fireEvent.click(screen.getByRole("button", { name: "guardar entrada" }));

      await waitFor(() => expect(agregarEntrada).toHaveBeenCalledWith({ diagnostico: "Gripe", evolucion: "Reposo", observaciones: "" }));
      expect(await screen.findByText("Consulta registrada en la historia clínica")).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "guardar entrada" })).not.toBeInTheDocument();
    });
  });

  describe("agendar control", () => {
    it("abre el modal de turno con el paciente ya elegido", () => {
      mockHistoria();
      renderPanel();

      fireEvent.click(screen.getByRole("button", { name: /Agendar control/ }));

      expect(screen.getByText("modal de turno para 9")).toBeInTheDocument();
    });

    it("cerrar el modal lo saca de la pantalla", () => {
      mockHistoria();
      renderPanel();
      fireEvent.click(screen.getByRole("button", { name: /Agendar control/ }));

      fireEvent.click(screen.getByRole("button", { name: "cerrar modal" }));

      expect(screen.queryByText("modal de turno para 9")).not.toBeInTheDocument();
    });

    it("al agendar avisa 'Control agendado'", async () => {
      mockHistoria();
      renderPanel();
      fireEvent.click(screen.getByRole("button", { name: /Agendar control/ }));

      fireEvent.click(screen.getByRole("button", { name: "turno agregado" }));

      expect(await screen.findByText("Control agendado")).toBeInTheDocument();
    });
  });

  describe("alergias y antecedentes", () => {
    it("guardar las alergias conserva los antecedentes", async () => {
      const { actualizarListas } = mockHistoria();
      renderPanel();

      fireEvent.click(screen.getByRole("button", { name: "Editar alergias" }));
      fireEvent.click(screen.getByRole("button", { name: "Guardar" }));

      await waitFor(() => expect(actualizarListas).toHaveBeenCalledWith({ alergias: ["Polen"], antecedentes: ["Asma"] }));
    });

    it("guardar los antecedentes conserva las alergias", async () => {
      const { actualizarListas } = mockHistoria();
      renderPanel();

      fireEvent.click(screen.getByRole("button", { name: "Editar antecedentes" }));
      fireEvent.click(screen.getByRole("button", { name: "Quitar Asma" }));
      fireEvent.click(screen.getByRole("button", { name: "Guardar" }));

      await waitFor(() => expect(actualizarListas).toHaveBeenCalledWith({ alergias: ["Polen"], antecedentes: [] }));
    });
  });
});
