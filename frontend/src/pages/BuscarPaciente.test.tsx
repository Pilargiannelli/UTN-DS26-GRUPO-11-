import { describe, it, expect, vi } from "vitest";
import { render, screen, act, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AuthContext, type AuthContextType } from "../context/AuthContextBase";

vi.mock("../components/Layout/Layout", () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock("../components/ListarUsuarios", () => ({
  ListarUsuarios: ({ rol }: { rol: string }) => <p>listado de {rol}</p>,
}));

import BuscarPaciente from "./BuscarPaciente";

function renderPagina(rol: string) {
  const auth = { tieneRol: (r: string) => r === rol } as unknown as AuthContextType;
  render(
    <AuthContext.Provider value={auth}>
      <MemoryRouter>
        <BuscarPaciente />
      </MemoryRouter>
    </AuthContext.Provider>
  );
}

describe("BuscarPaciente", () => {
  it("el PACIENTE ve el aviso de acceso restringido y no el listado", () => {
    renderPagina("PACIENTE");

    expect(screen.getByText("Acceso Restringido (403)")).toBeInTheDocument();
    expect(screen.queryByText("listado de paciente")).not.toBeInTheDocument();
  });

  it.each(["MEDICO", "SECRETARIA"])("el %s ve el listado de pacientes", (rol) => {
    renderPagina(rol);

    expect(screen.getByText("listado de paciente")).toBeInTheDocument();
    expect(screen.queryByText("Acceso Restringido (403)")).not.toBeInTheDocument();
  });
});

describe("BuscarPaciente: aviso de paciente creado", () => {
  it("al volver del alta muestra 'Paciente registrado correctamente' y lo cierra solo a los 3 segundos", async () => {
    vi.useFakeTimers();
    const auth = { tieneRol: (r: string) => r === "SECRETARIA" } as unknown as AuthContextType;

    render(
      <AuthContext.Provider value={auth}>
        <MemoryRouter initialEntries={[{ pathname: "/buscar-paciente", state: { pacienteCreado: true } }]}>
          <BuscarPaciente />
        </MemoryRouter>
      </AuthContext.Provider>
    );
    await act(async () => {
      await vi.advanceTimersByTimeAsync(10);
    });
    expect(screen.getByText("Paciente registrado correctamente")).toBeInTheDocument();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(3500);
    });
    // sin navegador no hay fin de animación: se lo avisamos a mano
    const aviso = document.querySelector(".toast") as HTMLElement;
    fireEvent.transitionEnd(aviso);
    expect(document.querySelector(".toast.show")).toBeNull();
    vi.useRealTimers();
  });
});
