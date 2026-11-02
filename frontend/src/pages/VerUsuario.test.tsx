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
  it("médico y paciente ven su DNI (solo lectura) en Mi cuenta", () => {
    const medico = { ...secretaria, id: 5, rol: "MEDICO" as const, dni: "28456789" };
    renderizar(medico, true);
    expect(screen.getByLabelText("DNI")).toBeDisabled();
    expect(screen.getByLabelText("DNI")).toHaveValue("28456789");
    expect(screen.getByRole("tab", { name: "Datos personales" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Seguridad" })).toBeInTheDocument();
  });

  it("el perfil de un profesional (visto por otro) no muestra la barra de pestañas", () => {
    const medico = { id: 5, username: "dr", nombre: "Mauricio", apellido: "Castellani", dni: "20111333", email: "m@clinica.com", fotoPerfil: null, rol: "MEDICO" as const, medico: { id: 2, especialidad: "Traumatología", matricula: "MP-1" } };
    const { container } = render(
      <AuthContext.Provider value={{ usuario: secretaria, rol: "SECRETARIA", cargando: false, estaAutenticado: true, setUsuario: vi.fn(), tieneRol: (r) => r === "SECRETARIA", login: vi.fn(), logout: vi.fn() }}>
        <MemoryRouter><VerUsuario perfilPaciente={medico as never} /></MemoryRouter>
      </AuthContext.Provider>
    );
    expect(container.querySelector(".perfil-tabs-ocultas")).not.toBeNull();
    expect(screen.getByText("Traumatología")).toBeInTheDocument();
  });

  it("muestra quién es y los datos se editan directo: Guardar se habilita al cambiar algo", () => {
    renderizar(secretaria, true);

    expect(screen.getByRole("heading", { name: "Ana Martínez" })).toBeInTheDocument();
    expect(screen.getByText("Mi cuenta · Secretaría")).toBeInTheDocument();
    // La secretaría no ve el DNI en su propia cuenta
    expect(screen.queryByLabelText("DNI")).not.toBeInTheDocument();

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



});
