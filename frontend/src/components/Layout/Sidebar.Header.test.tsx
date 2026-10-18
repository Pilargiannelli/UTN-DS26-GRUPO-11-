import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AuthContext } from "../../context/AuthContextBase";
import type { AuthContextType } from "../../context/AuthContextBase";
import type { RolUsuario, UsuarioSesion } from "../../types/UsuarioSesion";
import Header from "./Header";
import { Sidebar } from "./Sidebar";

afterEach(cleanup);

function crearUsuario(rol: RolUsuario): UsuarioSesion {
  return {
    id: 1,
    username: rol.toLowerCase(),
    nombre: "Juan",
    apellido: "Perez",
    dni: "12345678",
    email: `${rol.toLowerCase()}@test.com`,
    fotoPerfil: null,
    rol,
  };
}

function renderizarHeader(usuario: UsuarioSesion | null) {
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
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    </AuthContext.Provider>
  );
}

// El menú es un Offcanvas: sus links sólo existen en el DOM una vez abierto.
const abrirMenu = () => fireEvent.click(screen.getByRole("button", { name: "☰" }));

describe("Sidebar", () => {
  const items = [
    { label: "Inicio", href: "/home" },
    { label: "Agenda", href: "/orden-del-dia" },
  ];

  it("no muestra los links hasta abrir el menú", () => {
    render(<Sidebar items={items} />);

    expect(screen.queryByText("Inicio")).not.toBeInTheDocument();
  });

  it("muestra un link por cada item, con su href, al abrir el menú", () => {
    render(<Sidebar items={items} />);
    abrirMenu();

    expect(screen.getByRole("link", { name: "Inicio" })).toHaveAttribute("href", "/home");
    expect(screen.getByRole("link", { name: "Agenda" })).toHaveAttribute("href", "/orden-del-dia");
  });
});

describe("Header según el rol", () => {
  it("invitado: muestra 'Ingresar' y no muestra el menú lateral", () => {
    renderizarHeader(null);

    expect(screen.getByRole("link", { name: "Ingresar" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "☰" })).not.toBeInTheDocument();
    expect(screen.queryByText("+ Nueva Obra Social")).not.toBeInTheDocument();
  });

  it("SECRETARIA: sidebar administrativo y link '+ Nueva Obra Social'", () => {
    renderizarHeader(crearUsuario("SECRETARIA"));
    abrirMenu();

    expect(screen.getByRole("link", { name: "Gestión de Turnos" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Pacientes" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Médicos" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Historial Clínico" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "+ Nueva Obra Social" })).toHaveAttribute(
      "href",
      "/obras-sociales/nueva"
    );
  });

  it("MEDICO: sidebar con Agenda e Historial Clínico, sin 'Médicos' ni 'Nueva Obra Social'", () => {
    renderizarHeader(crearUsuario("MEDICO"));
    abrirMenu();

    expect(screen.getByRole("link", { name: "Gestión de Turnos" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Agenda" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Historial Clínico" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Médicos" })).not.toBeInTheDocument();
    expect(screen.queryByText("+ Nueva Obra Social")).not.toBeInTheDocument();
  });

  it("PACIENTE: sidebar reducido (sólo Inicio) y sin 'Nueva Obra Social'", () => {
    renderizarHeader(crearUsuario("PACIENTE"));
    abrirMenu();

    expect(screen.getByRole("link", { name: "Inicio" })).toHaveAttribute("href", "/home");
    expect(screen.queryByRole("link", { name: "Gestión de Turnos" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Pacientes" })).not.toBeInTheDocument();
    expect(screen.queryByText("+ Nueva Obra Social")).not.toBeInTheDocument();
  });

  it("usuario autenticado: saluda por nombre y no muestra 'Ingresar'", () => {
    renderizarHeader(crearUsuario("MEDICO"));

    expect(screen.getByText("Juan")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Ingresar" })).not.toBeInTheDocument();
  });
});
