import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { AuthContext } from "../context/AuthContextBase";
import type { AuthContextType } from "../context/AuthContextBase";
import type { RolUsuario } from "../types/UsuarioSesion";
import FichaPaciente from "./FichaPaciente";

// GET /pacientes/:id devuelve a María; los turnos, vacíos
const detalle = {
  id: 15, usuarioId: 10, fechaNacimiento: "1990-05-14T00:00:00.000Z", sexo: "Femenino", telefono: "5492344123456",
  coberturas: [{ nroAfiliado: "OS-1", plan: "210", obraSocial: { id: 1, nombre: "OSDE" } }],
  usuario: { id: 10, username: "maria", nombre: "María", apellido: "Flores", email: "maria@gmail.com", dni: "35123456" },
};
vi.mock("../hooks/useFetch", () => ({
  useFetch: (url: string) => ({ data: url === "/pacientes/15" ? detalle : [], loading: false, error: null }),
}));
vi.mock("../services/api", () => ({ apiFetch: vi.fn().mockResolvedValue(null), ApiError: class extends Error {} }));

afterEach(cleanup);

function renderizar(rol: RolUsuario) {
  const contexto: AuthContextType = {
    usuario: { id: 99, username: "x", nombre: "X", apellido: "Y", dni: "1", email: "x@y.com", fotoPerfil: null, rol },
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
      <MemoryRouter initialEntries={["/pacientes/15"]}>
        <Routes>
          <Route path="/pacientes/:id" element={<FichaPaciente />} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  );
}

describe("Ficha del paciente (/pacientes/:id)", () => {
  it("muestra la ruta Pacientes › nombre, con vuelta al listado", () => {
    renderizar("SECRETARIA");
    const ruta = screen.getByRole("navigation", { name: "Ruta de navegación" });
    expect(ruta).toHaveTextContent("Pacientes");
    expect(within(ruta).getByRole("link", { name: "Pacientes" })).toHaveAttribute("href", "/buscar-paciente");
    expect(screen.getAllByText("María Flores").length).toBeGreaterThan(0);
  });

  it("el médico ve la ficha clínica completa en el mismo lugar", () => {
    renderizar("MEDICO");
    expect(screen.getByRole("heading", { name: "Historia clínica" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Turnos" })).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /Nueva consulta/ }).length).toBeGreaterThan(0);
  });

  it("el médico tiene la historia clínica arriba de los turnos, con el llamado a registrar la consulta", () => {
    renderizar("MEDICO");
    const titulos = screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent);
    expect(titulos.indexOf("Historia clínica")).toBeLessThan(titulos.indexOf("Turnos"));

    expect(screen.getByText("¿Atendiste a María hoy?")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Registrar consulta" }));
    expect(screen.getByLabelText("Diagnóstico")).toBeInTheDocument();
  });

  it("la secretaria ve los datos para administrar y dar turno, sin historia clínica", () => {
    renderizar("SECRETARIA");
    expect(screen.getByRole("button", { name: "Dar turno" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Historia clínica" })).not.toBeInTheDocument();
  });
});
