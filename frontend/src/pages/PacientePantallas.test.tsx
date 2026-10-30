import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AuthContext } from "../context/AuthContextBase";
import type { AuthContextType } from "../context/AuthContextBase";
import type { Turno } from "../types/Turno";
import MisTurnos from "./MisTurnos";
import PedirTurno from "./PedirTurno";
import { HomePaciente } from "../components/HomePaciente";
import DetalleTurno from "./DetalleTurno";
import { Route, Routes } from "react-router-dom";

// Un turno de hace unos días (con su consulta) y uno a futuro
const haceDias = new Date();
haceDias.setDate(haceDias.getDate() - 3);
haceDias.setHours(10, 0, 0, 0);
const turno = (id: number, fecha: Date, estado: Turno["estado"]): Turno => ({
  id, estado, fechaHora: fecha.toISOString(), idWhatsapp: null, pagoValidado: false,
  medicoId: 1, pacienteId: 15, secretariaId: null,
  medico: { id: 1, especialidad: "Cardiología", matricula: "MP-1", usuario: { nombre: "Carlos", apellido: "Gómez", email: "c@x" } },
  paciente: { id: 15, usuario: { nombre: "María", apellido: "Flores", email: "m@x" } },
});

const respuestas: Record<string, unknown> = {
  "/turnos": [turno(1, haceDias, "Confirmado"), turno(2, new Date(2099, 2, 16, 10), "Pendiente")],
  "/turnos/1": turno(1, haceDias, "Confirmado"),
  "/turnos/2": turno(2, new Date(2099, 2, 16, 10), "Pendiente"),
  "/especialidades": ["Cardiología", "Pediatría"],
  "/medicos": [
    { id: 1, especialidad: "Cardiología", matricula: "MP-1", usuario: { nombre: "Carlos", apellido: "Gómez" } },
    { id: 2, especialidad: "Pediatría", matricula: "MP-2", usuario: { nombre: "Laura", apellido: "Sosa" } },
  ],
};
vi.mock("../hooks/useFetch", () => ({
  useFetch: (url: string) => ({ data: respuestas[url] ?? null, loading: false, error: null }),
}));

const historia = {
  paciente: { id: 15, nombre: "María", apellido: "Flores", dni: "1" },
  medicoResponsable: "Carlos Gómez",
  alergias: ["Penicilina"],
  antecedentes: [],
  entradas: [{
    id: 7, historiaClinicaId: 1, fecha: haceDias.toISOString(),
    diagnostico: "Hipertensión leve", evolucion: "Caminar 30 minutos por día", observaciones: "Control en un mes",
  }],
};
vi.mock("../services/api", () => ({
  apiFetch: vi.fn((url: string) => Promise.resolve(url.includes("historia-clinica") ? historia : null)),
  ApiError: class extends Error {},
}));

afterEach(cleanup);

function renderizar(ui: React.ReactNode, ruta = "/") {
  const contexto: AuthContextType = {
    usuario: {
      id: 10, username: "maria", nombre: "María", apellido: "Flores", dni: "1", email: "m@x", fotoPerfil: null, rol: "PACIENTE",
      paciente: {
        id: 15, fechaNacimiento: "1990-01-01", sexo: "Femenino", telefono: "1",
        coberturas: [{ nroAfiliado: "OS-1", plan: "210", obraSocial: { id: 1, nombre: "OSDE" } }],
      },
    },
    rol: "PACIENTE",
    cargando: false,
    estaAutenticado: true,
    setUsuario: vi.fn(),
    tieneRol: (r) => r === "PACIENTE",
    login: vi.fn(),
    logout: vi.fn(),
  };
  return render(
    <AuthContext.Provider value={contexto}>
      <MemoryRouter initialEntries={[ruta]}>{ui}</MemoryRouter>
    </AuthContext.Provider>
  );
}

describe("Mis turnos (paciente)", () => {
  it("separa próximos e historial, y en el historial muestra lo que indicó el médico", async () => {
    renderizar(<MisTurnos />);
    expect(screen.getByRole("tab", { name: "Próximos (1)" })).toBeInTheDocument();
    expect(screen.getByText("Por confirmar", { selector: "span" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: /Historial/ }));
    expect(await screen.findByText("Caminar 30 minutos por día")).toBeInTheDocument();
    expect(screen.getByText("Hipertensión leve")).toBeInTheDocument();
    expect(screen.getByText("Atendido")).toBeInTheDocument();
    expect(screen.getByText(/Penicilina/)).toBeInTheDocument();
  });
});

describe("Pedir turno", () => {
  it("desde la cartilla llega con el profesional y la especialidad ya elegidos", () => {
    renderizar(<PedirTurno />, "/pedir-turno?medico=2");
    expect(screen.getByRole("button", { name: "Pediatría" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: /Laura Sosa/ })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Confirmar turno" })).toBeDisabled();
  });

  it("al elegir una especialidad con un solo profesional, lo elige solo", () => {
    renderizar(<PedirTurno />, "/pedir-turno");
    fireEvent.click(screen.getByRole("button", { name: "Cardiología" }));
    const resumen = screen.getByRole("complementary", { name: "Resumen del turno" });
    expect(resumen).toHaveTextContent("Carlos Gómez");
    expect(resumen).toHaveTextContent("OSDE · Plan 210");
  });
});

describe("Inicio del paciente", () => {
  it("muestra su última consulta, la cobertura y los accesos con los nombres del menú", async () => {
    renderizar(<HomePaciente />);
    expect(await screen.findByText("Caminar 30 minutos por día")).toBeInTheDocument();
    expect(screen.getByText("OSDE")).toBeInTheDocument();
    for (const nombre of [/^Pedir turno/, /^Mis turnos/, /^Médicos/]) {
      expect(screen.getByRole("link", { name: nombre })).toBeInTheDocument();
    }
  });
});

describe("Detalle del turno", () => {
  const detalle = (id: number) =>
    renderizar(<Routes><Route path="/turnos/:id" element={<DetalleTurno />} /></Routes>, `/turnos/${id}`);

  it("un turno atendido muestra las etapas completas y el resultado de la consulta", async () => {
    detalle(1);
    expect(await screen.findByText("Caminar 30 minutos por día")).toBeInTheDocument();
    expect(screen.getByRole("list", { name: "Estado del turno" })).toHaveTextContent("SolicitadoConfirmadoAtendido");
    expect(screen.getByRole("link", { name: "Pedir turno con Carlos" })).toHaveAttribute("href", "/pedir-turno?medico=1");
  });

  it("un turno por confirmar se puede cancelar", () => {
    detalle(2);
    expect(screen.getAllByText("Por confirmar").length).toBeGreaterThan(0);
    expect(screen.getByRole("link", { name: "Cancelar turno" })).toHaveAttribute("href", "/turnos/2/cancelar");
  });
});
