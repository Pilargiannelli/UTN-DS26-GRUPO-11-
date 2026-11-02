import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { AuthContext } from "../../context/AuthContextBase";
import type { AuthContextType } from "../../context/AuthContextBase";
import type { UsuarioSesion } from "../../types/UsuarioSesion";
import NuevoTurnoModal from "./NuevoTurnoModal";

vi.mock("../SelectorTurno", () => ({ SelectorTurno: ({ medicoId }: { medicoId: string }) => <p>Médico del horario: {medicoId}</p> }));
vi.mock("../../hooks/useFetch", () => ({
  useFetch: (url: string) => ({
    data:
      url === "/medicos"
        ? [
            { id: 1, especialidad: "Cardiología", usuario: { nombre: "Carlos", apellido: "Gómez" } },
            { id: 2, especialidad: "Traumatología", usuario: { nombre: "Mauricio", apellido: "Castellani" } },
          ]
        : [{ id: 7, usuario: { nombre: "María", apellido: "Flores", dni: "35123456" } }],
    loading: false,
    error: null,
  }),
}));

afterEach(cleanup);

const sesion = (rol: UsuarioSesion["rol"], medico?: UsuarioSesion["medico"]): AuthContextType => ({
  usuario: { id: 9, username: "x", nombre: "X", apellido: "Y", dni: "1", email: "x@y.com", fotoPerfil: null, rol, medico },
  rol,
  cargando: false,
  estaAutenticado: true,
  setUsuario: vi.fn(),
  tieneRol: (r) => r === rol,
  login: vi.fn(),
  logout: vi.fn(),
});

const renderizar = (contexto: AuthContextType) =>
  render(
    <AuthContext.Provider value={contexto}>
      <NuevoTurnoModal show onClose={vi.fn()} onAgregar={vi.fn()} pacienteIdInicial={7} />
    </AuthContext.Provider>
  );

describe("Nuevo turno: médico", () => {
  it("un médico da turnos solo en su agenda: queda elegido y bloqueado", () => {
    renderizar(sesion("MEDICO", { id: 2, especialidad: "Traumatología", matricula: "MP-1" }));

    const medico = screen.getByRole("combobox", { name: "Médico" });
    expect(medico).toHaveValue("Dr./Dra. Mauricio Castellani");
    expect(medico).toBeDisabled();
    expect(screen.queryByRole("button", { name: "Quitar médico" })).not.toBeInTheDocument();
    expect(screen.getByText("Médico del horario: 2")).toBeInTheDocument();
  });

  it("la secretaria elige el médico libremente", () => {
    renderizar(sesion("SECRETARIA"));

    const medico = screen.getByRole("combobox", { name: "Médico" });
    expect(medico).toHaveValue("");
    expect(medico).toBeEnabled();
  });
});
