import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AuthContext } from "../../context/AuthContextBase";
import type { AuthContextType } from "../../context/AuthContextBase";
import type { RolUsuario, UsuarioSesion } from "../../types/UsuarioSesion";
import Header from "./Header";
import { Sidebar } from "./Sidebar";
import { MenuLateral } from "./MenuLateral";
import { menuPorRol } from "./menuPorRol";

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
const abrirMenu = () => fireEvent.click(screen.getByRole("button", { name: "Abrir menú" }));

describe("Sidebar (menú desplegable del celular)", () => {
  const items = [
    { label: "Inicio", href: "/home" },
    { label: "Agenda", href: "/orden-del-dia" },
  ];
  const renderizarSidebar = () => render(<MemoryRouter><Sidebar items={items} /></MemoryRouter>);

  it("no muestra los links hasta abrir el menú", () => {
    renderizarSidebar();

    expect(screen.queryByText("Inicio")).not.toBeInTheDocument();
  });

  it("muestra un link por cada item, con su href, al abrir el menú", () => {
    renderizarSidebar();
    abrirMenu();

    expect(screen.getByRole("link", { name: "Inicio" })).toHaveAttribute("href", "/home");
    expect(screen.getByRole("link", { name: "Agenda" })).toHaveAttribute("href", "/orden-del-dia");
  });
});

describe("MenuLateral (fijo en pantallas grandes)", () => {
  it("marca como activo el link de la página actual", () => {
    render(
      <MemoryRouter initialEntries={["/mis-turnos"]}>
        <MenuLateral items={menuPorRol.PACIENTE} />
      </MemoryRouter>
    );

    expect(screen.getByRole("link", { name: "Mis turnos" })).toHaveClass("active");
    expect(screen.getByRole("link", { name: "Inicio" })).not.toHaveClass("active");
  });
});

describe("Header según el rol", () => {
  it("invitado: muestra 'Ingresar' y no muestra el menú", () => {
    renderizarHeader(null);

    expect(screen.getByRole("link", { name: "Ingresar" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Abrir menú" })).not.toBeInTheDocument();
  });

  it("SECRETARIA: menú administrativo con 'Nueva obra social' y sin historia clínica", () => {
    renderizarHeader(crearUsuario("SECRETARIA"));
    abrirMenu();

    expect(screen.getByRole("link", { name: "Gestión de turnos" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Pacientes" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Médicos" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Historia clínica" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Nueva obra social" })).toHaveAttribute("href", "/obras-sociales/nueva");
  });

  it("MEDICO: menú con Agenda e Historia clínica, sin 'Médicos' ni 'Nueva obra social'", () => {
    renderizarHeader(crearUsuario("MEDICO"));
    abrirMenu();

    expect(screen.getByRole("link", { name: "Gestión de turnos" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Agenda" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Historia clínica" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Médicos" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Nueva obra social" })).not.toBeInTheDocument();
  });

  it("PACIENTE: menú con sus turnos y sin pantallas del personal", () => {
    renderizarHeader(crearUsuario("PACIENTE"));
    abrirMenu();

    expect(screen.getByRole("link", { name: "Inicio" })).toHaveAttribute("href", "/home");
    expect(screen.getByRole("link", { name: "Mis turnos" })).toHaveAttribute("href", "/mis-turnos");
    expect(screen.getByRole("link", { name: "Pedir turno" })).toHaveAttribute("href", "/pedir-turno");
    expect(screen.getByRole("link", { name: "Mi cuenta" })).toHaveAttribute("href", "/mi-cuenta");
    expect(screen.queryByRole("link", { name: "Gestión de turnos" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Pacientes" })).not.toBeInTheDocument();
  });

  it("usuario autenticado: saluda por nombre y no muestra 'Ingresar'", () => {
    renderizarHeader(crearUsuario("MEDICO"));

    expect(screen.getByText("Juan")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Ingresar" })).not.toBeInTheDocument();
  });
});
