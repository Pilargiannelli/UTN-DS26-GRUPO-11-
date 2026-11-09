import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AuthContext, type AuthContextType } from "./context/AuthContextBase";

// Cada página se reemplaza por un cartel con su nombre: acá se prueba el
// ruteo y los permisos (PrivateRoute real), no el contenido de las pantallas.
vi.mock("./pages/Landing", () => ({ default: () => <p>[Landing]</p> }));
vi.mock("./pages/Login", () => ({ default: () => <p>[Login]</p> }));
vi.mock("./pages/Home.tsx", () => ({ default: () => <p>[Home]</p> }));
vi.mock("./pages/MisTurnos.tsx", () => ({ default: () => <p>[MisTurnos]</p> }));
vi.mock("./pages/RegistroPaciente.tsx", () => ({ default: () => <p>[RegistroPaciente]</p> }));
vi.mock("./pages/AutoregistroPaciente", () => ({ default: () => <p>[AutoregistroPaciente]</p> }));
vi.mock("./pages/BuscarPaciente", () => ({ default: () => <p>[BuscarPaciente]</p> }));
vi.mock("./pages/NoAutorizado", () => ({ default: () => <p>[NoAutorizado]</p> }));
vi.mock("./pages/VerUsuario.tsx", () => ({ default: () => <p>[VerUsuario]</p> }));
vi.mock("./pages/GestionTurnos", () => ({ default: () => <p>[GestionTurnos]</p> }));
vi.mock("./pages/DetalleTurno.tsx", () => ({ default: () => <p>[DetalleTurno]</p> }));
vi.mock("./pages/CancelarTurno.tsx", () => ({ default: () => <p>[CancelarTurno]</p> }));
vi.mock("./pages/PedirTurno.tsx", () => ({ default: () => <p>[PedirTurno]</p> }));
vi.mock("./pages/BuscarMédico.tsx", () => ({ default: () => <p>[BuscarMedico]</p> }));
vi.mock("./pages/OrdenDelDia.tsx", () => ({ default: () => <p>[OrdenDelDia]</p> }));
vi.mock("./pages/FichaPaciente.tsx", () => ({ default: () => <p>[FichaPaciente]</p> }));
vi.mock("./pages/HistorialConsultas.tsx", () => ({ default: () => <p>[HistorialConsultas]</p> }));
vi.mock("./pages/TurnosPaciente.tsx", () => ({ default: () => <p>[TurnosPaciente]</p> }));
vi.mock("./pages/NoEncontrada.tsx", () => ({ default: () => <p>[NoEncontrada]</p> }));
vi.mock("./components/Layout/Layout.tsx", () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

import App from "./App";

type Rol = "PACIENTE" | "MEDICO" | "SECRETARIA" | null;

function irA(ruta: string, rol: Rol) {
  const usuario = rol ? { id: 1, rol } : null;
  const auth = {
    usuario,
    rol,
    cargando: false,
    estaAutenticado: usuario !== null,
    tieneRol: (r: string) => usuario?.rol === r,
  } as unknown as AuthContextType;

  render(
    <AuthContext.Provider value={auth}>
      <MemoryRouter initialEntries={[ruta]}>
        <App />
      </MemoryRouter>
    </AuthContext.Provider>
  );
}

// La matriz de permisos de Documentación/ como suite del front: cada fila
// es "quién entra a qué ruta" y el resultado esperado.
describe("rutas públicas", () => {
  it.each([
    ["/", "[Landing]"],
    ["/login", "[Login]"],
    ["/crear-cuenta", "[AutoregistroPaciente]"],
    ["/no-autorizado", "[NoAutorizado]"],
  ])("un invitado entra a %s", (ruta, pantalla) => {
    irA(ruta, null);

    expect(screen.getByText(pantalla)).toBeInTheDocument();
  });

  it("una URL inexistente muestra la página 404", () => {
    irA("/ruta-que-no-existe", null);

    expect(screen.getByText("[NoEncontrada]")).toBeInTheDocument();
  });
});

describe("invitado en rutas privadas (401 → login)", () => {
  it.each(["/home", "/mis-turnos", "/pedir-turno", "/buscar-medico", "/mi-cuenta", "/buscar-paciente", "/registrar-paciente", "/orden-del-dia"])(
    "%s redirige al login",
    (ruta) => {
      irA(ruta, null);

      expect(screen.getByText("[Login]")).toBeInTheDocument();
    }
  );
});

describe("PACIENTE", () => {
  it.each([
    ["/home", "[Home]"],
    ["/mis-turnos", "[MisTurnos]"],
    ["/turnos/3", "[DetalleTurno]"],
    ["/turnos/3/cancelar", "[CancelarTurno]"],
    ["/pedir-turno", "[PedirTurno]"],
    ["/buscar-medico", "[BuscarMedico]"],
    ["/mi-cuenta", "[VerUsuario]"],
  ])("entra a %s", (ruta, pantalla) => {
    irA(ruta, "PACIENTE");

    expect(screen.getByText(pantalla)).toBeInTheDocument();
  });

  it.each(["/buscar-paciente", "/pacientes/1", "/gestion-turnos", "/registrar-paciente", "/orden-del-dia", "/pacientes/1/historial", "/pacientes/1/turnos"])(
    "%s lo manda a no-autorizado (403)",
    (ruta) => {
      irA(ruta, "PACIENTE");

      expect(screen.getByText("[NoAutorizado]")).toBeInTheDocument();
    }
  );
});

describe("MEDICO", () => {
  it.each([
    ["/buscar-paciente", "[BuscarPaciente]"],
    ["/pacientes/1", "[FichaPaciente]"],
    ["/gestion-turnos", "[GestionTurnos]"],
    ["/orden-del-dia", "[OrdenDelDia]"],
    ["/pacientes/1/historial", "[HistorialConsultas]"],
    ["/pacientes/1/turnos", "[TurnosPaciente]"],
  ])("entra a %s", (ruta, pantalla) => {
    irA(ruta, "MEDICO");

    expect(screen.getByText(pantalla)).toBeInTheDocument();
  });

  it("no puede registrar pacientes (es de la secretaria)", () => {
    irA("/registrar-paciente", "MEDICO");

    expect(screen.getByText("[NoAutorizado]")).toBeInTheDocument();
  });
});

describe("SECRETARIA", () => {
  it.each([
    ["/registrar-paciente", "[RegistroPaciente]"],
    ["/buscar-paciente", "[BuscarPaciente]"],
    ["/pacientes/1", "[FichaPaciente]"],
    ["/gestion-turnos", "[GestionTurnos]"],
    ["/orden-del-dia", "[OrdenDelDia]"],
  ])("entra a %s", (ruta, pantalla) => {
    irA(ruta, "SECRETARIA");

    expect(screen.getByText(pantalla)).toBeInTheDocument();
  });

  it.each(["/pacientes/1/historial", "/pacientes/1/turnos"])(
    "no accede a %s: la historia clínica es del médico",
    (ruta) => {
      irA(ruta, "SECRETARIA");

      expect(screen.getByText("[NoAutorizado]")).toBeInTheDocument();
    }
  );
});
