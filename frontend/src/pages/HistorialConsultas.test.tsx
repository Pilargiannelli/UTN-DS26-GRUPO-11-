import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { AuthContext } from "../context/AuthContextBase";
import type { AuthContextType } from "../context/AuthContextBase";
import { apiFetch } from "../services/api";
import HistorialConsultas from "./HistorialConsultas";

vi.mock("../services/api", () => ({ apiFetch: vi.fn(), ApiError: class extends Error {} }));

const hoy = new Date();
const hace = (dias: number) => new Date(hoy.getTime() - dias * 86400000).toISOString();

// 10 consultas: una por semana hacia atrás, con textos distintos
const entradas = Array.from({ length: 10 }, (_, i) => ({
  id: i + 1,
  historiaClinicaId: 1,
  fecha: hace(i * 7 + 1),
  diagnostico: i === 3 ? "Lumbalgia aguda" : `Control ${i + 1}`,
  evolucion: i === 3 ? "Dolor lumbar con reposo" : "Sin novedades",
  observaciones: "",
}));

const historia = {
  paciente: { id: 1, nombre: "María", apellido: "Flores", dni: "35123456" },
  medicoResponsable: "Carlos Gómez",
  alergias: [],
  antecedentes: [],
  entradas,
};

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
      <MemoryRouter initialEntries={["/pacientes/1/historial"]}>
        <Routes><Route path="/pacientes/:id/historial" element={<HistorialConsultas />} /></Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  );

beforeEach(() => {
  vi.mocked(apiFetch).mockResolvedValue(historia);
});
afterEach(() => {
  cleanup();
  vi.mocked(apiFetch).mockReset();
});

const filasDeLaTabla = () => screen.getAllByRole("listitem");

describe("Historial completo de consultas", () => {
  it("muestra el paciente, un botón Volver y las consultas de a páginas de 3", async () => {
    renderizar();

    expect(await screen.findByText(/María Flores · 10 consultas registradas/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Volver" })).toBeInTheDocument();
    expect(filasDeLaTabla()).toHaveLength(3);
    expect(screen.getByText("Mostrando 1–3 de 10")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Página siguiente" }));
    expect(filasDeLaTabla()).toHaveLength(3);
    expect(screen.getByText("Mostrando 4–6 de 10")).toBeInTheDocument();
  });

  it("filtra por período: la última semana trae solo la consulta de esa semana", async () => {
    renderizar();
    await screen.findByText(/María Flores/);

    fireEvent.change(screen.getByLabelText("Período"), { target: { value: "semana" } });
    expect(filasDeLaTabla()).toHaveLength(1);
    expect(screen.getByText("Mostrando 1–1 de 1")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Período"), { target: { value: "mes" } });
    expect(filasDeLaTabla().length).toBeGreaterThan(1);
  });

  it("el período personalizado pide Desde y Hasta", async () => {
    renderizar();
    await screen.findByText(/María Flores/);

    fireEvent.change(screen.getByLabelText("Período"), { target: { value: "personalizado" } });
    expect(screen.getByLabelText("Desde")).toBeInTheDocument();
    expect(screen.getByLabelText("Hasta")).toBeInTheDocument();
  });

  it("busca por texto sin importar tildes ni mayúsculas, y se limpia", async () => {
    renderizar();
    await screen.findByText(/María Flores/);

    fireEvent.change(screen.getByLabelText("Buscar en las consultas"), { target: { value: "LUMBAR" } });
    expect(filasDeLaTabla()).toHaveLength(1);
    expect(screen.getByText("Lumbalgia aguda")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Buscar en las consultas"), { target: { value: "no existe" } });
    expect(screen.getByText("No hay consultas que coincidan con los filtros.")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Limpiar filtros" }));
    expect(filasDeLaTabla()).toHaveLength(3);
  });

  it("ordena de la más reciente a la más antigua", async () => {
    renderizar();
    await screen.findByText(/María Flores/);
    expect(within(filasDeLaTabla()[0]).getByText("Control 1")).toBeInTheDocument();
  });

  it("abre una consulta en modo lectura: sin edición", async () => {
    renderizar();
    await screen.findByText(/María Flores/);

    fireEvent.change(screen.getByLabelText("Buscar en las consultas"), { target: { value: "lumbalgia" } });
    expect(screen.queryByRole("button", { name: /Editar/ })).not.toBeInTheDocument();
    fireEvent.click(within(filasDeLaTabla()[0]).getByRole("button", { name: /Ver la consulta/ }));

    expect(await screen.findByText("Dolor lumbar con reposo", { selector: "dd" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Editar|Guardar/ })).not.toBeInTheDocument();
  });
});
