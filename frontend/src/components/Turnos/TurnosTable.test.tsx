import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import { AuthContext } from "../../context/AuthContextBase";
import type { AuthContextType } from "../../context/AuthContextBase";
import type { EstadoTurno, Turno } from "../../types/Turno";
import type { RolUsuario } from "../../types/UsuarioSesion";
import TurnosTable from "./TurnosTable";

afterEach(cleanup);

const turno = (id: number, fechaHora: string, estado: EstadoTurno, paciente: string): Turno => ({
  id,
  estado,
  fechaHora,
  idWhatsapp: null,
  pagoValidado: false,
  medicoId: 1,
  pacienteId: id,
  secretariaId: null,
  medico: { id: 1, especialidad: "Traumatología", matricula: "MP-1", usuario: { nombre: "Carlos", apellido: "Gómez", email: "c@x.com" } },
  paciente: { id, usuario: { nombre: paciente, apellido: "Test", email: `${id}@x.com` } },
});

function renderizar(turnos: Turno[], rol: RolUsuario = "SECRETARIA") {
  const contexto: AuthContextType = {
    usuario: null,
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
      <TurnosTable
        turnos={turnos}
        onNuevoTurno={vi.fn()}
        onTurnoActualizado={vi.fn()}
        verAnteriores={false}
        onToggleAnteriores={vi.fn()}
      />
    </AuthContext.Provider>
  );
}

const turnos = [
  turno(1, "2099-03-14T13:00:00.000Z", "Pendiente", "Ana"),
  turno(2, "2099-03-14T14:00:00.000Z", "Confirmado", "Beto"),
  turno(3, "2099-03-15T13:00:00.000Z", "Pendiente", "Carla"),
  turno(4, "2099-03-14T15:00:00.000Z", "Cancelado", "Dani"),
];

describe("TurnosTable (agenda)", () => {
  it("agrupa los turnos activos por día", () => {
    renderizar(turnos);
    // Dos días con turnos activos -> dos títulos de día
    expect(screen.getAllByRole("columnheader").filter((th) => th.getAttribute("scope") === "colgroup")).toHaveLength(2);
  });

  it("los cancelados no aparecen en la agenda, sino en su propia sección", () => {
    renderizar(turnos);
    const agenda = screen.getAllByRole("table")[0];
    expect(within(agenda).queryByText("Dani Test")).not.toBeInTheDocument();

    expect(screen.getByText("Cancelados (1)")).toBeInTheDocument();
    const seccionCancelados = screen.getAllByRole("table")[1];
    expect(within(seccionCancelados).getByText("Dani Test")).toBeInTheDocument();
  });

  it("el médico no ve la columna Médico (son todos suyos)", () => {
    renderizar(turnos, "MEDICO");
    expect(screen.queryByRole("columnheader", { name: "Médico" })).not.toBeInTheDocument();
  });
});
