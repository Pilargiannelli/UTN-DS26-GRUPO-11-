import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

vi.mock("../components/Layout/Layout.tsx", () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock("../hooks/useTurnosPaciente", () => ({ useTurnosPaciente: vi.fn() }));
vi.mock("../hooks/useMiHistoria", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../hooks/useMiHistoria")>()),
  useMiHistoria: vi.fn(),
}));

import { useTurnosPaciente } from "../hooks/useTurnosPaciente";
import { useMiHistoria } from "../hooks/useMiHistoria";
import MisTurnos from "./MisTurnos";

const turno = (id: number, fecha: Date, estado: string) => ({
  id,
  estado,
  fechaHora: fecha.toISOString(),
  medico: { id: 1, especialidad: "Cardiología", usuario: { nombre: "Carlos", apellido: "Gómez" } },
});

function renderMisTurnos({
  turnos = [] as unknown[],
  loading = false,
  error = null as Error | null,
  historia = null as unknown,
  ruta = "/mis-turnos",
} = {}) {
  vi.mocked(useTurnosPaciente).mockReturnValue({ misTurnos: turnos, loading, error } as never);
  vi.mocked(useMiHistoria).mockReturnValue({ historia, loading: false, error: null } as never);
  render(
    <MemoryRouter initialEntries={[ruta]}>
      <MisTurnos />
    </MemoryRouter>
  );
}

const FUTURO_1 = new Date(2099, 2, 5, 10, 0);
const FUTURO_2 = new Date(2099, 2, 6, 10, 0);
const PASADO = new Date(2000, 2, 5, 10, 0);

describe("MisTurnos: estados de la pantalla", () => {
  beforeEach(() => {
    vi.mocked(useTurnosPaciente).mockReset();
    vi.mocked(useMiHistoria).mockReset();
  });

  it("mientras carga muestra el spinner y no las pestañas", () => {
    renderMisTurnos({ loading: true });

    expect(screen.getByRole("status", { name: "Cargando turnos" })).toBeInTheDocument();
    expect(screen.queryByRole("tab")).not.toBeInTheDocument();
  });

  it("si falla la carga muestra el mensaje de error", () => {
    renderMisTurnos({ error: new Error("No se pudo conectar") });

    expect(screen.getByRole("alert")).toHaveTextContent("No se pudo conectar");
  });

  it("sin turnos invita a pedir uno", () => {
    renderMisTurnos();

    expect(screen.getByText("No tenés turnos agendados.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Pedir un turno" })).toHaveAttribute("href", "/pedir-turno");
  });

  it("cuenta los próximos y deja los cancelados y pasados en el historial", () => {
    renderMisTurnos({
      turnos: [
        turno(1, FUTURO_1, "Pendiente"),
        turno(2, FUTURO_2, "Confirmado"),
        turno(3, FUTURO_2, "Cancelado"),
        turno(4, PASADO, "Confirmado"),
      ],
    });

    expect(screen.getByRole("tab", { name: "Próximos (2)" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Historial (2)" })).toBeInTheDocument();
  });

  it("avisa que los turnos por confirmar se pueden cancelar solo si hay alguno sin confirmar", () => {
    renderMisTurnos({ turnos: [turno(1, FUTURO_1, "Pendiente")] });
    expect(screen.getByText(/Los turnos por confirmar se pueden cancelar desde acá/)).toBeInTheDocument();
  });

  it("si todos los próximos están confirmados no muestra esa nota", () => {
    renderMisTurnos({ turnos: [turno(1, FUTURO_1, "Confirmado")] });

    expect(screen.queryByText(/Los turnos por confirmar se pueden cancelar desde acá/)).not.toBeInTheDocument();
  });

  it("el historial sin consultas dice que todavía no hay anteriores", () => {
    renderMisTurnos({ ruta: "/mis-turnos?ver=historial" });

    expect(screen.getByText("Todavía no tenés consultas anteriores.")).toBeInTheDocument();
  });

  it("con ?ver=historial abre esa pestaña y muestra las alergias registradas", () => {
    renderMisTurnos({
      ruta: "/mis-turnos?ver=historial",
      historia: { alergias: ["Penicilina", "Polen"], entradas: [], medicoResponsable: null },
    });

    expect(screen.getByText(/Penicilina, Polen/)).toBeInTheDocument();
  });

  it("cambiar de pestaña muestra los turnos del historial", () => {
    renderMisTurnos({ turnos: [turno(3, FUTURO_2, "Cancelado")] });
    expect(screen.getByText("No tenés turnos agendados.")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: "Historial (1)" }));

    expect(screen.queryByText("No tenés turnos agendados.")).not.toBeInTheDocument();
    expect(screen.getByText(/Cardiología/)).toBeInTheDocument();
  });

  it("una consulta registrada sin turno aparece en el historial como 'Atendido'", () => {
    renderMisTurnos({
      ruta: "/mis-turnos?ver=historial",
      historia: {
        alergias: [],
        medicoResponsable: "Carlos Gómez",
        entradas: [{ id: 9, fecha: PASADO.toISOString(), diagnostico: "Gripe", evolucion: "Reposo", observaciones: "" }],
      },
    });

    expect(screen.getByText("Atendido")).toBeInTheDocument();
    expect(screen.getByText("Con Carlos Gómez")).toBeInTheDocument();
  });
});
