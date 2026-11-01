import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AuthContext } from "../context/AuthContextBase";
import type { AuthContextType } from "../context/AuthContextBase";
import type { RolUsuario } from "../types/UsuarioSesion";
import OrdenDelDia from "./OrdenDelDia";

// Un turno hoy a las 10:00 con cada médico
const hoy = new Date();
hoy.setHours(10, 0, 0, 0);
const turno = (id: number, medicoId: number, paciente: string) => ({
  id, estado: "Pendiente", fechaHora: hoy.toISOString(), medicoId, pacienteId: id,
  medico: { id: medicoId, especialidad: "Clínica", matricula: "M", usuario: { nombre: "X", apellido: "Y", email: "x@y" } },
  paciente: { id, usuario: { nombre: paciente, apellido: "Test", email: `${id}@x` } },
});
const respuestas: Record<string, unknown> = {
  "/turnos": [turno(1, 1, "Ana"), turno(2, 2, "Beto")],
  "/medicos": [
    { id: 2, especialidad: "Pediatría", usuario: { nombre: "Laura", apellido: "Sosa" } },
    { id: 1, especialidad: "Cardiología", usuario: { nombre: "Carlos", apellido: "Gómez" } },
  ],
};
vi.mock("../hooks/useFetch", () => ({
  useFetch: (url: string) => ({ data: respuestas[url] ?? [], loading: false, error: null }),
}));

afterEach(cleanup);

function renderizar(rol: RolUsuario) {
  const contexto: AuthContextType = {
    usuario: { id: 9, username: "x", nombre: "X", apellido: "Y", dni: "1", email: "x@y.com", fotoPerfil: null, rol },
    rol,
    cargando: false,
    estaAutenticado: true,
    setUsuario: vi.fn(),
    tieneRol: (r) => r === rol,
    login: vi.fn(),
    logout: vi.fn(),
  };
  return render(
    <AuthContext.Provider value={contexto}>
      <MemoryRouter>
        <OrdenDelDia />
      </MemoryRouter>
    </AuthContext.Provider>
  );
}

// El fin de semana la agenda arranca en el lunes: solo se prueba un día hábil
const esHabil = hoy.getDay() >= 1 && hoy.getDay() <= 5;

describe("Agenda", () => {
  it("la secretaria elige el médico y ve solo sus turnos", () => {
    renderizar("SECRETARIA");
    const selector = screen.getByRole("combobox", { name: "Médico" });
    // Arranca con el primero por apellido (Gómez)
    expect(selector).toHaveValue("Carlos Gómez");
    expect(screen.getByText("Cardiología")).toBeInTheDocument();
    if (!esHabil) return;
    expect(screen.getByText("Ana Test")).toBeInTheDocument();
    expect(screen.queryByText("Beto Test")).not.toBeInTheDocument();

    fireEvent.focus(selector);
    fireEvent.change(selector, { target: { value: "sosa" } });
    fireEvent.click(screen.getByRole("option", { name: /Laura Sosa/ }));
    expect(selector).toHaveValue("Laura Sosa");
    expect(screen.getByText("Beto Test")).toBeInTheDocument();
    expect(screen.queryByText("Ana Test")).not.toBeInTheDocument();
  });

  it("al borrar el nombre del médico, la especialidad queda", () => {
    renderizar("SECRETARIA");
    const selector = screen.getByRole("combobox", { name: "Médico" });

    fireEvent.focus(selector);
    fireEvent.change(selector, { target: { value: "" } });

    expect(selector).toHaveValue("");
    expect(screen.getAllByText("Cardiología").length).toBeGreaterThan(0);
    // Sin elegir otro, sigue seleccionado el mismo médico (con su cruz para quitarlo)
    expect(screen.getByRole("button", { name: "Quitar médico" })).toBeInTheDocument();
  });

  it("la cruz quita el médico y la agenda no muestra turnos", () => {
    if (!esHabil) return;
    renderizar("SECRETARIA");
    fireEvent.click(screen.getByRole("button", { name: "Quitar médico" }));

    expect(screen.getByRole("combobox", { name: "Médico" })).toHaveValue("");
    expect(screen.queryByText("Cardiología")).not.toBeInTheDocument();
    expect(screen.getByText("Buscá y elegí un médico para ver su agenda.")).toBeInTheDocument();
    expect(screen.queryByText("Ana Test")).not.toBeInTheDocument();
  });

  it("el médico ve su agenda sin selector", () => {
    renderizar("MEDICO");
    expect(screen.queryByRole("combobox", { name: "Médico" })).not.toBeInTheDocument();
    expect(screen.getByText("Mis turnos")).toBeInTheDocument();
  });

  it("cada turno lleva a la ficha del paciente", () => {
    if (!esHabil) return;
    renderizar("SECRETARIA");
    expect(screen.getByRole("link", { name: /Ana Test/ })).toHaveAttribute("href", "/pacientes/1");
  });
});
