import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AuthContext } from "../context/AuthContextBase";
import type { AuthContextType } from "../context/AuthContextBase";
import type { RolUsuario } from "../types/UsuarioSesion";
import { ListarUsuarios } from "./ListarUsuarios";

// useFetch mockeado: cada test define qué devuelve /pacientes o /medicos
const datos: Record<string, unknown> = {};
vi.mock("../hooks/useFetch", () => ({
  useFetch: (url: string) => ({ data: datos[url] ?? [], loading: false, error: null }),
}));

afterEach(cleanup);

const pacientes = [
  {
    id: 1, usuarioId: 10, fechaNacimiento: "1990-05-20", sexo: "Femenino", telefono: "5492344111111",
    coberturas: [{ nroAfiliado: "A-1", plan: "210", obraSocial: { id: 1, nombre: "OSDE" } }],
    usuario: { id: 10, nombre: "María", apellido: "Flores", dni: "35123456", email: "maria@x.com" },
  },
  {
    id: 2, usuarioId: 11, fechaNacimiento: "1985-01-10", sexo: "Masculino", telefono: "5492344222222",
    coberturas: [],
    usuario: { id: 11, nombre: "Juan", apellido: "Rodríguez", dni: "40987654", email: "juan@x.com" },
  },
];

function renderizar(rol: "paciente" | "medico", rolUsuario: RolUsuario = "SECRETARIA") {
  const contexto: AuthContextType = {
    usuario: null,
    rol: rolUsuario,
    cargando: false,
    estaAutenticado: true,
    setUsuario: vi.fn(),
    tieneRol: (r) => r === rolUsuario,
    login: vi.fn(),
    logout: vi.fn(),
  };
  return render(
    <AuthContext.Provider value={contexto}>
      <MemoryRouter>
        <ListarUsuarios rol={rol} />
      </MemoryRouter>
    </AuthContext.Provider>
  );
}

describe("Directorio de pacientes", () => {
  it("muestra título, cantidad y los datos de cada paciente", () => {
    datos["/pacientes"] = pacientes;
    renderizar("paciente");

    expect(screen.getByRole("heading", { name: "Pacientes" })).toBeInTheDocument();
    // Resumen del encabezado: 2 pacientes, 1 con obra social
    expect(screen.getByText("Con obra social").nextSibling).toHaveTextContent("1");
    expect(screen.getByText("Pacientes", { selector: "dt" }).nextSibling).toHaveTextContent("2");
    expect(screen.getByRole("button", { name: "María Flores" })).toBeInTheDocument();
    expect(screen.getByText("OSDE")).toBeInTheDocument();
    expect(screen.getByText("Sin obra social")).toBeInTheDocument();
  });

  it("filtra por nombre o por DNI", () => {
    datos["/pacientes"] = pacientes;
    renderizar("paciente");

    fireEvent.change(screen.getByLabelText("Buscar paciente"), { target: { value: "4098" } });
    expect(screen.getByRole("button", { name: "Juan Rodríguez" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "María Flores" })).not.toBeInTheDocument();
    expect(screen.getByText("1 resultado")).toBeInTheDocument();
  });

  it("sin resultados ofrece limpiar la búsqueda", () => {
    datos["/pacientes"] = pacientes;
    renderizar("paciente");

    fireEvent.change(screen.getByLabelText("Buscar paciente"), { target: { value: "zzz" } });
    fireEvent.click(screen.getByRole("button", { name: "Limpiar búsqueda" }));
    expect(screen.getByRole("button", { name: "María Flores" })).toBeInTheDocument();
  });

  it("la secretaria puede registrar y dar turno; el médico no", () => {
    datos["/pacientes"] = pacientes;
    renderizar("paciente", "SECRETARIA");
    expect(screen.getByRole("button", { name: "+ Registrar paciente" })).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Dar turno" })).toHaveLength(2);
    cleanup();

    renderizar("paciente", "MEDICO");
    expect(screen.queryByRole("button", { name: "+ Registrar paciente" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Dar turno" })).not.toBeInTheDocument();
  });

  it("el médico tiene un acceso directo a la historia clínica de cada paciente", () => {
    datos["/pacientes"] = [
      { ...pacientes[0], ultimaConsulta: new Date().toISOString() },
      { ...pacientes[1], ultimaConsulta: null },
    ];
    renderizar("paciente", "MEDICO");

    expect(screen.getByText(/Abrí la historia clínica de un paciente/)).toBeInTheDocument();
    expect(screen.getByText("Atendidos este mes").nextSibling).toHaveTextContent("1");
    expect(screen.getByRole("columnheader", { name: "Última consulta" })).toBeInTheDocument();
    expect(screen.getByText("Sin consultas")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Historia clínica de María Flores" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Ver perfil/ })).not.toBeInTheDocument();
  });

  it("la secretaria no ve la última consulta (dato clínico)", () => {
    datos["/pacientes"] = pacientes;
    renderizar("paciente", "SECRETARIA");
    expect(screen.queryByRole("columnheader", { name: "Última consulta" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Historia clínica/ })).not.toBeInTheDocument();
  });

  it("sin pacientes muestra el estado vacío con la acción", () => {
    datos["/pacientes"] = [];
    renderizar("paciente");
    expect(screen.getByText("Todavía no hay pacientes registrados.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Registrar el primer paciente" })).toBeInTheDocument();
  });
});

describe("Cartilla de médicos", () => {
  it("muestra especialidad y matrícula, sin columnas de paciente", () => {
    datos["/medicos"] = [
      { id: 1, usuarioId: 20, especialidad: "Traumatología", matricula: "MP-123", usuario: { id: 20, nombre: "Carlos", apellido: "Gómez", email: "c@x.com" } },
    ];
    renderizar("medico");

    expect(screen.getByRole("heading", { name: "Profesionales" })).toBeInTheDocument();
    expect(screen.getByText("Traumatología")).toBeInTheDocument();
    expect(screen.getByText("MP-123")).toBeInTheDocument();
    expect(screen.queryByRole("columnheader", { name: "Obra social" })).not.toBeInTheDocument();
  });

  it("el paciente pide turno con el médico desde la cartilla", () => {
    datos["/medicos"] = [
      { id: 1, usuarioId: 20, especialidad: "Traumatología", matricula: "MP-123", usuario: { id: 20, nombre: "Carlos", apellido: "Gómez", email: "c@x.com" } },
    ];
    renderizar("medico", "PACIENTE");
    expect(screen.getByRole("button", { name: "Pedir turno con Carlos Gómez" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Atención" })).toBeInTheDocument();
    cleanup();

    renderizar("medico", "SECRETARIA");
    expect(screen.queryByRole("button", { name: /Pedir turno/ })).not.toBeInTheDocument();
  });
});
