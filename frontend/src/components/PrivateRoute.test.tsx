import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { AuthContext } from "../context/AuthContextBase";
import type { AuthContextType } from "../context/AuthContextBase";
import type { UsuarioSesion } from "../types/UsuarioSesion";
import PrivateRoute from "./PrivateRoute";

afterEach(cleanup);

const medico: UsuarioSesion = {
  id: 1,
  username: "medico",
  nombre: "Juan",
  apellido: "Perez",
  dni: "12345678",
  email: "medico@test.com",
  fotoPerfil: null,
  rol: "MEDICO",
};

const paciente: UsuarioSesion = {
  ...medico,
  id: 2,
  username: "paciente",
  nombre: "Ana",
  email: "paciente@test.com",
  rol: "PACIENTE",
};

function renderizarRuta(usuario: UsuarioSesion | null) {
  const contexto: AuthContextType = {
    usuario,
    rol: usuario?.rol ?? null,
    cargando: false,
    estaAutenticado: usuario !== null,
    setUsuario: vi.fn(),
    tieneRol: (rol) => usuario?.rol === rol,
    login: vi.fn(),
    logout: vi.fn(),
  };

  return render(
    <AuthContext.Provider value={contexto}>
      <MemoryRouter initialEntries={["/medicos"]}>
        <Routes>
          <Route path="/" element={<p>Página de inicio</p>} />
          <Route
            path="/no-autorizado"
            element={<p>Acceso denegado</p>}
          />
          <Route element={<PrivateRoute roles={["MEDICO"]} />}>
            <Route
              path="/medicos"
              element={<p>Panel médico privado</p>}
            />
          </Route>
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  );
}

describe("PrivateRoute según autenticación y rol", () => {
  it("redirige al inicio cuando el usuario es invitado", () => {
    renderizarRuta(null);

    expect(screen.getByText("Página de inicio")).toBeInTheDocument();
    expect(screen.queryByText("Panel médico privado")).not.toBeInTheDocument();
  });

  it("redirige a No autorizado cuando el rol es incorrecto", () => {
    renderizarRuta(paciente);

    expect(screen.getByText("Acceso denegado")).toBeInTheDocument();
    expect(screen.queryByText("Panel médico privado")).not.toBeInTheDocument();
  });

  it("permite acceder cuando el usuario tiene el rol correcto", () => {
    renderizarRuta(medico);

    expect(screen.getByText("Panel médico privado")).toBeInTheDocument();
  });
});
