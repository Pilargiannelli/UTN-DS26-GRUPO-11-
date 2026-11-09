import { describe, it, expect, vi } from "vitest";
import { render, screen, act, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AuthContext, type AuthContextType } from "../context/AuthContextBase";

vi.mock("../components/Layout/Layout.tsx", () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock("./GestionTurnos.tsx", () => ({ default: () => <p>vista gestión de turnos</p> }));
vi.mock("../components/HomePaciente.tsx", () => ({ HomePaciente: () => <p>vista home paciente</p> }));

import Home from "./Home";

function renderHome(rol: string | null) {
  const auth = {
    rol,
    usuario: rol ? { id: 1, rol } : null,
    estaAutenticado: rol !== null,
    cargando: false,
  } as unknown as AuthContextType;

  render(
    <AuthContext.Provider value={auth}>
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    </AuthContext.Provider>
  );
}

// Columna "qué hace la UI" de la matriz de permisos: cada rol ve su propia pantalla de inicio
describe("Home según el rol", () => {
  it("SECRETARIA ve la gestión de turnos", () => {
    renderHome("SECRETARIA");

    expect(screen.getByText("vista gestión de turnos")).toBeInTheDocument();
    expect(screen.queryByText("vista home paciente")).not.toBeInTheDocument();
  });

  it("MEDICO ve la gestión de turnos", () => {
    renderHome("MEDICO");

    expect(screen.getByText("vista gestión de turnos")).toBeInTheDocument();
  });

  it("PACIENTE ve su inicio, no la gestión de turnos", () => {
    renderHome("PACIENTE");

    expect(screen.getByText("vista home paciente")).toBeInTheDocument();
    expect(screen.queryByText("vista gestión de turnos")).not.toBeInTheDocument();
  });

  it("sin sesión avisa que hay que iniciar sesión", () => {
    renderHome(null);

    expect(screen.getByText("Sesión no iniciada")).toBeInTheDocument();
    expect(screen.queryByText("vista gestión de turnos")).not.toBeInTheDocument();
  });
});

describe("Home: aviso de cuenta creada", () => {
  it("al llegar desde el registro muestra 'Cuenta creada correctamente' y lo cierra solo a los 3 segundos", async () => {
    vi.useFakeTimers();
    const auth = { rol: "PACIENTE", usuario: { id: 1, rol: "PACIENTE" }, estaAutenticado: true, cargando: false } as unknown as AuthContextType;

    render(
      <AuthContext.Provider value={auth}>
        <MemoryRouter initialEntries={[{ pathname: "/home", state: { registroExitoso: true } }]}>
          <Home />
        </MemoryRouter>
      </AuthContext.Provider>
    );
    await act(async () => {
      await vi.advanceTimersByTimeAsync(10);
    });
    expect(screen.getByText("Cuenta creada correctamente")).toBeInTheDocument();

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
