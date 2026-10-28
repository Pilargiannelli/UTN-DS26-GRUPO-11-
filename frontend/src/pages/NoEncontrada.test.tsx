import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { AuthContext } from "../context/AuthContextBase";
import type { AuthContextType } from "../context/AuthContextBase";
import NoEncontrada from "./NoEncontrada";

afterEach(cleanup);

// El Layout (Header + Footer) no es lo que se prueba acá
vi.mock("../components/Layout/Layout.tsx", () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

function renderizar(url: string, estaAutenticado: boolean) {
  const contexto: AuthContextType = {
    usuario: null,
    rol: null,
    cargando: false,
    estaAutenticado,
    setUsuario: vi.fn(),
    tieneRol: () => false,
    login: vi.fn(),
    logout: vi.fn(),
  };

  return render(
    <AuthContext.Provider value={contexto}>
      <MemoryRouter initialEntries={[url]}>
        <Routes>
          <Route path="/home" element={<p>Inicio</p>} />
          <Route path="*" element={<NoEncontrada />} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  );
}

describe("Ruta inexistente", () => {
  it("muestra la página 404 en vez de una pantalla en blanco", () => {
    renderizar("/una-ruta-que-no-existe", true);
    expect(screen.getByRole("heading", { name: "No encontramos esta página" })).toBeInTheDocument();
  });

  it("logueado, el botón vuelve al inicio", () => {
    renderizar("/cualquiera", true);
    expect(screen.getByRole("link", { name: "Volver al inicio" })).toHaveAttribute("href", "/home");
  });

  it("sin sesión, el botón lleva al login", () => {
    renderizar("/cualquiera", false);
    expect(screen.getByRole("link", { name: "Ir a ingresar" })).toHaveAttribute("href", "/");
  });
});
