import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AuthContext } from "../context/AuthContextBase";
import type { AuthContextType } from "../context/AuthContextBase";
import type { UsuarioSesion } from "../types/UsuarioSesion";
import VerUsuario from "./VerUsuario";

// Turnos, historia clínica y catálogos: no son lo que se prueba acá
vi.mock("../hooks/useFetch", () => ({ useFetch: () => ({ data: [], loading: false, error: null }) }));
vi.mock("../services/api", () => ({ apiFetch: vi.fn().mockResolvedValue(null), ApiError: class extends Error {} }));
vi.mock("../components/HistorialMedicoCard", () => ({ HistorialMedicoCard: () => <p>Historia clínica de prueba</p> }));

const secretaria: UsuarioSesion = {
  id: 3, username: "ana", nombre: "Ana", apellido: "Martínez", dni: "32111222",
  email: "ana@clinica.com", fotoPerfil: null, rol: "SECRETARIA",
};
const medico: UsuarioSesion = { ...secretaria, id: 4, nombre: "Carlos", apellido: "Gómez", rol: "MEDICO" };

const pacienteMaria = {
  id: 10, username: "maria", nombre: "María", apellido: "Flores", dni: "35123456",
  email: "maria@gmail.com", fotoPerfil: null, rol: "PACIENTE",
  paciente: {
    id: 1, fechaNacimiento: "1990-05-14T00:00:00.000Z", sexo: "Femenino", telefono: "5492344123456",
    coberturas: [{ nroAfiliado: "OS-1", plan: "210", obraSocial: { id: 1, nombre: "OSDE" } }],
  },
};

function renderizar(usuario: UsuarioSesion, propio: boolean) {
  const contexto: AuthContextType = {
    usuario,
    rol: usuario.rol,
    cargando: false,
    estaAutenticado: true,
    setUsuario: vi.fn(),
    tieneRol: (r) => r === usuario.rol,
    login: vi.fn(),
    logout: vi.fn(),
  };
  return render(
    <AuthContext.Provider value={contexto}>
      <MemoryRouter>
        <VerUsuario propio={propio} />
      </MemoryRouter>
    </AuthContext.Provider>
  );
}

beforeEach(() => localStorage.clear());
afterEach(cleanup);

describe("Mi cuenta", () => {
  it("muestra quién es y los datos se editan directo: Guardar se habilita al cambiar algo", () => {
    renderizar(secretaria, true);

    expect(screen.getByRole("heading", { name: "Ana Martínez" })).toBeInTheDocument();
    expect(screen.getByText("Mi cuenta · Secretaría")).toBeInTheDocument();
    expect(screen.getByLabelText("DNI")).toBeDisabled();

    const guardar = screen.getByRole("button", { name: "Guardar cambios" });
    expect(guardar).toBeDisabled();
    fireEvent.change(screen.getByLabelText("Apellido"), { target: { value: "Martín" } });
    expect(guardar).toBeEnabled();
    expect(screen.getByRole("button", { name: "Descartar cambios" })).toBeInTheDocument();
  });

  it("la contraseña está en la pestaña Seguridad, sin pasos intermedios", () => {
    renderizar(secretaria, true);
    fireEvent.click(screen.getByRole("tab", { name: "Seguridad" }));

    expect(screen.getByLabelText("Contraseña actual")).toBeInTheDocument();
    expect(screen.queryByLabelText("Apellido")).not.toBeInTheDocument();
  });
});

describe("Perfil de un paciente", () => {
  beforeEach(() => localStorage.setItem("usuarioSeleccionado", JSON.stringify(pacienteMaria)));

  it("la secretaria edita sus datos directo, le da turno y ve sus próximos turnos", () => {
    renderizar(secretaria, false);

    expect(screen.getByRole("tab", { name: "Datos del paciente" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Dar turno" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Próximos turnos" })).toBeInTheDocument();
    // Ni historia clínica (matriz §10) ni Seguridad (es de la cuenta propia)
    expect(screen.queryByRole("tab", { name: "Historia clínica" })).not.toBeInTheDocument();
    expect(screen.queryByRole("tab", { name: "Seguridad" })).not.toBeInTheDocument();
  });

  it("el médico ve la ficha clínica: nueva consulta, agendar control e historia", () => {
    renderizar(medico, false);

    expect(screen.getAllByRole("button", { name: /Nueva consulta/ }).length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: /Agendar control/ })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Historia clínica" })).toBeInTheDocument();
    expect(screen.getByText("OSDE")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Dar turno" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Guardar cambios" })).not.toBeInTheDocument();
  });

});
