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
  it("las acciones están a la vista (sin la ruedita) y la contraseña se cambia en el lugar", () => {
    renderizar(secretaria, true);

    expect(screen.getByRole("heading", { name: "Ana Martínez" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Datos personales" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Editar" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Cambiar" }));
    expect(screen.getByLabelText("Contraseña actual")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(screen.queryByLabelText("Contraseña actual")).not.toBeInTheDocument();
  });

  it("Editar abre el formulario de nombre y email en la misma tarjeta", () => {
    renderizar(secretaria, true);
    fireEvent.click(screen.getByRole("button", { name: "Editar" }));

    expect(screen.getByLabelText("Email")).toHaveValue("ana@clinica.com");
    expect(screen.getByRole("button", { name: "Guardar cambios" })).toBeInTheDocument();
  });
});

describe("Perfil de un paciente", () => {
  beforeEach(() => localStorage.setItem("usuarioSeleccionado", JSON.stringify(pacienteMaria)));

  it("la secretaria ve sus datos, puede editarlos y darle turno", () => {
    renderizar(secretaria, false);

    expect(screen.getByRole("heading", { name: "Datos del paciente" })).toBeInTheDocument();
    expect(screen.getByText("OSDE · Plan 210 · Afiliado OS-1")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Dar turno" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Editar" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Próximos turnos" })).toBeInTheDocument();
    // La secretaria no ve la historia clínica (matriz §10)
    expect(screen.queryByText("Historia clínica de prueba")).not.toBeInTheDocument();
    // Ni la sección de contraseña, que es solo de la cuenta propia
    expect(screen.queryByRole("heading", { name: "Seguridad" })).not.toBeInTheDocument();
  });

  it("el médico ve la historia clínica pero no edita ni da turnos", () => {
    renderizar(medico, false);

    expect(screen.getByText("Historia clínica de prueba")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Editar" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Dar turno" })).not.toBeInTheDocument();
  });
});
