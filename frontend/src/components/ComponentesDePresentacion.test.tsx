import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

vi.mock("../hooks/useFetch", () => ({ useFetch: vi.fn() }));

import { useFetch } from "../hooks/useFetch";
import { EncabezadoPagina } from "./EncabezadoPagina";
import { ConsultaCard } from "./ConsultaCard";
import ListaReservados from "./ListaReservados";
import { IndicacionesMedico } from "./Paciente/IndicacionesMedico";
import { TurnoPacienteCard } from "./Paciente/TurnoPacienteCard";
import { ProximosTurnosPaciente } from "./Perfil/ProximosTurnosPaciente";
import { DatosPerfil } from "./Perfil/DatosPerfil";
import type { EntradaClinica } from "../types/HistoriaClinica";

const entrada = (extra: Partial<EntradaClinica> = {}): EntradaClinica => ({
  id: 1,
  historiaClinicaId: 1,
  fecha: new Date(2026, 5, 10, 12).toISOString(),
  diagnostico: "Hipertensión leve",
  evolucion: "Caminar 30 minutos",
  observaciones: "Control en un mes",
  ...extra,
});

describe("EncabezadoPagina", () => {
  it("solo con título muestra el h1 y nada más", () => {
    const { container } = render(<EncabezadoPagina titulo="Mis turnos" />);

    expect(screen.getByRole("heading", { level: 1, name: "Mis turnos" })).toBeInTheDocument();
    expect(container.querySelector(".encabezado-pagina-lateral")).toBeNull();
  });

  it("muestra etiqueta, descripción, datos y acción cuando se los pasan", () => {
    render(
      <EncabezadoPagina
        titulo="Mis turnos"
        etiqueta="Mi salud"
        descripcion="Tus próximos turnos"
        datos={[{ valor: 3, texto: "Próximos turnos" }]}
        accion={<button>Pedir turno</button>}
      />
    );

    expect(screen.getByText("Mi salud")).toBeInTheDocument();
    expect(screen.getByText("Tus próximos turnos")).toBeInTheDocument();
    expect(screen.getByText("Próximos turnos")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Pedir turno" })).toBeInTheDocument();
  });

  it("un dato con valor 0 igual se muestra", () => {
    render(<EncabezadoPagina titulo="X" datos={[{ valor: 0, texto: "Por confirmar" }]} />);

    expect(screen.getByText("0")).toBeInTheDocument();
  });
});

describe("ConsultaCard", () => {
  it("muestra fecha, diagnóstico, evolución y observaciones", () => {
    render(<ConsultaCard entrada={entrada()} />);

    expect(screen.getByText("10/06/2026")).toBeInTheDocument();
    expect(screen.getByText("Hipertensión leve")).toBeInTheDocument();
    expect(screen.getByText("Caminar 30 minutos")).toBeInTheDocument();
    expect(screen.getByText("Control en un mes")).toBeInTheDocument();
  });

  it("sin observaciones no dibuja ese bloque", () => {
    render(<ConsultaCard entrada={entrada({ observaciones: "" })} />);

    expect(screen.queryByText("Observaciones:")).not.toBeInTheDocument();
  });

  it("muestra el médico solo si se lo pasan", () => {
    const { rerender } = render(<ConsultaCard entrada={entrada()} />);
    expect(screen.queryByText("Médico:")).not.toBeInTheDocument();

    rerender(<ConsultaCard entrada={entrada()} medico="Carlos Gómez" />);
    expect(screen.getByText("Carlos Gómez")).toBeInTheDocument();
  });
});

describe("ListaReservados", () => {
  it("lista los turnos con su estado", () => {
    render(<ListaReservados />);

    expect(screen.getByText("Lista de Turnos Reservados")).toBeInTheDocument();
    expect(screen.getByText("Juan Pérez")).toBeInTheDocument();
    expect(screen.getAllByText("Confirmado")).toHaveLength(2);
  });

  it("los turnos cancelados no ofrecen el botón Cancelar", () => {
    render(<ListaReservados />);

    // 4 turnos, 1 cancelado => 3 botones Cancelar y 4 Ver Detalle
    expect(screen.getAllByRole("button", { name: "Cancelar" })).toHaveLength(3);
    expect(screen.getAllByRole("button", { name: "Ver Detalle" })).toHaveLength(4);
  });
});

describe("IndicacionesMedico", () => {
  it("muestra diagnóstico, evolución y observaciones con el título por defecto", () => {
    render(<IndicacionesMedico consulta={entrada()} />);

    expect(screen.getByRole("region", { name: "Lo que te indicó el médico" })).toBeInTheDocument();
    expect(screen.getByText("Hipertensión leve")).toBeInTheDocument();
    expect(screen.getByText("Control en un mes")).toBeInTheDocument();
  });

  it("acepta un título propio y oculta observaciones vacías", () => {
    render(<IndicacionesMedico consulta={entrada({ observaciones: "" })} titulo="Resultado" />);

    expect(screen.getByRole("heading", { name: "Resultado" })).toBeInTheDocument();
    expect(screen.queryByText("Observaciones")).not.toBeInTheDocument();
  });
});

describe("TurnoPacienteCard", () => {
  const turno = (estado: string, fecha: Date) =>
    ({
      id: 7,
      estado,
      fechaHora: fecha.toISOString(),
      medico: { id: 1, especialidad: "Cardiología", usuario: { nombre: "Carlos", apellido: "Gómez" } },
    }) as never;

  const futuro = new Date(2099, 2, 5, 10, 30);
  const pasado = new Date(2000, 2, 5, 10, 30);

  function renderCard(t: unknown, consulta?: EntradaClinica) {
    render(
      <MemoryRouter>
        <TurnoPacienteCard turno={t as never} consulta={consulta} />
      </MemoryRouter>
    );
  }

  it("muestra especialidad, horario, médico y estado", () => {
    renderCard(turno("Pendiente", futuro));

    expect(screen.getByText("Cardiología · 10:30 h")).toBeInTheDocument();
    expect(screen.getByText("Con Carlos Gómez")).toBeInTheDocument();
    expect(screen.getByText("Por confirmar")).toBeInTheDocument();
  });

  it("un turno por confirmar se puede cancelar y siempre se puede ver el detalle", () => {
    renderCard(turno("Pendiente", futuro));

    expect(screen.getByRole("link", { name: "Cancelar turno" })).toHaveAttribute("href", "/turnos/7/cancelar");
    expect(screen.getByRole("link", { name: /Ver detalle del turno/ })).toHaveAttribute("href", "/turnos/7");
  });

  it("un turno confirmado no ofrece cancelar", () => {
    renderCard(turno("Confirmado", futuro));

    expect(screen.queryByRole("link", { name: "Cancelar turno" })).not.toBeInTheDocument();
  });

  it("un turno pasado sin consulta avisa que no hay indicaciones", () => {
    renderCard(turno("Confirmado", pasado));

    expect(screen.getByText("Finalizado")).toBeInTheDocument();
    expect(screen.getByText(/Sin indicaciones registradas/)).toBeInTheDocument();
  });

  it("un turno pasado con consulta figura como atendido y muestra las indicaciones", () => {
    renderCard(turno("Confirmado", pasado), entrada());

    expect(screen.getByText("Atendido")).toBeInTheDocument();
    expect(screen.getByText("Hipertensión leve")).toBeInTheDocument();
  });
});

describe("ProximosTurnosPaciente", () => {
  beforeEach(() => {
    vi.mocked(useFetch).mockReset();
  });

  const turno = (id: number, pacienteId: number, estado: string, fecha: Date) => ({
    id,
    pacienteId,
    estado,
    fechaHora: fecha.toISOString(),
    medico: { especialidad: "Pediatría", usuario: { nombre: "Laura", apellido: "Sosa" } },
  });

  it("mientras carga muestra un spinner", () => {
    vi.mocked(useFetch).mockReturnValue({ data: null, loading: true, error: null });

    render(<ProximosTurnosPaciente pacienteId={1} />);

    expect(screen.getByRole("status", { name: "Cargando turnos" })).toBeInTheDocument();
  });

  it("si falla muestra el motivo", () => {
    vi.mocked(useFetch).mockReturnValue({ data: null, loading: false, error: new Error("sin conexión") });

    render(<ProximosTurnosPaciente pacienteId={1} />);

    expect(screen.getByText(/No se pudieron cargar los turnos: sin conexión/)).toBeInTheDocument();
  });

  it("muestra solo los turnos futuros, no cancelados, de ese paciente", () => {
    vi.mocked(useFetch).mockReturnValue({
      data: [
        turno(1, 1, "Pendiente", new Date(2099, 0, 5, 9)),
        turno(2, 2, "Pendiente", new Date(2099, 0, 5, 10)),
        turno(3, 1, "Cancelado", new Date(2099, 0, 5, 11)),
        turno(4, 1, "Confirmado", new Date(2000, 0, 5, 12)),
      ] as never,
      loading: false,
      error: null,
    });

    render(<ProximosTurnosPaciente pacienteId={1} />);

    expect(screen.getAllByRole("listitem")).toHaveLength(1);
    expect(screen.getByText("Pendiente")).toBeInTheDocument();
  });

  it("sin turnos próximos lo dice", () => {
    vi.mocked(useFetch).mockReturnValue({ data: [], loading: false, error: null });

    render(<ProximosTurnosPaciente pacienteId={1} />);

    expect(screen.getByText("No tiene turnos próximos.")).toBeInTheDocument();
  });
});

describe("DatosPerfil", () => {
  it("muestra cada par etiqueta/valor", () => {
    render(<DatosPerfil datos={[["DNI", "30111222"], ["Teléfono", <b key="t">2344111111</b>]]} />);

    expect(screen.getByText("DNI")).toBeInTheDocument();
    expect(screen.getByText("30111222")).toBeInTheDocument();
    expect(screen.getByText("2344111111")).toBeInTheDocument();
  });
});
