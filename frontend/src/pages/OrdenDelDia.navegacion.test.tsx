import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AuthContext, type AuthContextType } from "../context/AuthContextBase";

vi.mock("../components/Layout/Layout", () => ({ default: ({ children }: { children: React.ReactNode }) => <div>{children}</div> }));
vi.mock("../hooks/useFetch", () => ({ useFetch: vi.fn() }));

import { useFetch } from "../hooks/useFetch";
import OrdenDelDia from "./OrdenDelDia";

// Miércoles 10 de junio de 2026, 12:00 (solo se congela Date: los timers de testing-library siguen reales)
const AHORA = new Date(2026, 5, 10, 12, 0, 0);

const turno = (id: number, fecha: Date, estado: string, paciente = "Ana") => ({
  id,
  estado,
  fechaHora: fecha.toISOString(),
  medicoId: 1,
  pacienteId: id,
  paciente: { id, usuario: { nombre: paciente, apellido: "Test" } },
});

type Respuesta = { data: unknown; loading?: boolean; error?: Error | null };

function responder(porUrl: Record<string, Respuesta>) {
  vi.mocked(useFetch).mockImplementation(((url: string) => {
    const r = porUrl[url] ?? { data: [] };
    return { data: r.data, loading: r.loading ?? false, error: r.error ?? null };
  }) as never);
}

function renderAgenda(rol: "MEDICO" | "SECRETARIA") {
  const auth = { tieneRol: (r: string) => r === rol } as unknown as AuthContextType;
  render(
    <AuthContext.Provider value={auth}>
      <MemoryRouter>
        <OrdenDelDia />
      </MemoryRouter>
    </AuthContext.Provider>
  );
}

const titulo = () => screen.getByRole("heading", { level: 2 }).textContent;
const elegirFecha = (valor: string) => {
  const entrada = document.querySelector<HTMLInputElement>('input[type="date"]')!;
  fireEvent.change(entrada, { target: { value: valor } });
};

describe("Agenda del médico: navegación y resumen", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"], now: AHORA });
    vi.mocked(useFetch).mockReset();
    responder({ "/turnos": { data: [] } });
  });
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it("arranca en el día de hoy, marcado como 'Hoy', con el botón Hoy deshabilitado", () => {
    renderAgenda("MEDICO");

    expect(titulo()).toContain("Miércoles, 10 de junio de 2026");
    expect(screen.getAllByText("Hoy").length).toBeGreaterThanOrEqual(2);
    expect(screen.getByRole("button", { name: "Hoy" })).toBeDisabled();
  });

  it("Día siguiente y Día anterior se mueven de a un día hábil", () => {
    renderAgenda("MEDICO");

    fireEvent.click(screen.getByRole("button", { name: "Día siguiente" }));
    expect(titulo()).toContain("Jueves, 11 de junio");

    fireEvent.click(screen.getByRole("button", { name: "Día anterior" }));
    fireEvent.click(screen.getByRole("button", { name: "Día anterior" }));
    expect(titulo()).toContain("Martes, 9 de junio");
  });

  it("del viernes pasa al lunes (saltea el fin de semana), y del lunes vuelve al viernes", () => {
    renderAgenda("MEDICO");
    elegirFecha("2026-06-12");
    expect(titulo()).toContain("Viernes, 12 de junio");

    fireEvent.click(screen.getByRole("button", { name: "Día siguiente" }));
    expect(titulo()).toContain("Lunes, 15 de junio");

    fireEvent.click(screen.getByRole("button", { name: "Día anterior" }));
    expect(titulo()).toContain("Viernes, 12 de junio");
  });

  it("elegir un sábado en el calendario pasa al lunes siguiente", () => {
    renderAgenda("MEDICO");

    elegirFecha("2026-06-13");

    expect(titulo()).toContain("Lunes, 15 de junio");
  });

  it("un valor vacío del calendario no cambia nada", () => {
    renderAgenda("MEDICO");

    elegirFecha("");

    expect(titulo()).toContain("Miércoles, 10 de junio");
  });

  it("'Hoy' vuelve al día actual desde otra fecha", () => {
    renderAgenda("MEDICO");
    elegirFecha("2026-06-18");
    expect(screen.getByRole("button", { name: "Hoy" })).toBeEnabled();

    fireEvent.click(screen.getByRole("button", { name: "Hoy" }));

    expect(titulo()).toContain("Miércoles, 10 de junio");
  });

  it("el botón con la fecha abre el calendario del navegador", () => {
    const showPicker = vi.fn();
    Object.defineProperty(HTMLInputElement.prototype, "showPicker", { value: showPicker, configurable: true });
    renderAgenda("MEDICO");

    fireEvent.click(screen.getByRole("button", { name: "Elegir una fecha en el calendario" }));

    expect(showPicker).toHaveBeenCalledTimes(1);
    // @ts-expect-error: se limpia el método simulado
    delete HTMLInputElement.prototype.showPicker;
  });

  it("sin showPicker (navegadores viejos) hace click en el campo de fecha", () => {
    renderAgenda("MEDICO");
    const entrada = document.querySelector<HTMLInputElement>('input[type="date"]')!;
    const click = vi.spyOn(entrada, "click");

    fireEvent.click(screen.getByRole("button", { name: "Elegir una fecha en el calendario" }));

    expect(click).toHaveBeenCalled();
  });

  describe("vista semanal", () => {
    it("muestra de lunes a viernes de la semana y navega de a semanas", () => {
      renderAgenda("MEDICO");

      fireEvent.click(screen.getByRole("button", { name: "Semana" }));
      expect(titulo()).toContain("8 – 12 de junio de 2026");
      expect(screen.getByRole("button", { name: "Semana" })).toHaveAttribute("aria-pressed", "true");

      fireEvent.click(screen.getByRole("button", { name: "Semana siguiente" }));
      expect(titulo()).toContain("15 – 19 de junio de 2026");

      fireEvent.click(screen.getByRole("button", { name: "Semana anterior" }));
      fireEvent.click(screen.getByRole("button", { name: "Semana anterior" }));
      expect(titulo()).toContain("1 – 5 de junio de 2026");
    });

    it("una semana que cruza de mes muestra los dos meses", () => {
      renderAgenda("MEDICO");
      elegirFecha("2026-06-30");

      fireEvent.click(screen.getByRole("button", { name: "Semana" }));

      expect(titulo()).toContain("29 de junio – 3 de julio de 2026");
    });

    it("se puede volver a la vista diaria", () => {
      renderAgenda("MEDICO");
      fireEvent.click(screen.getByRole("button", { name: "Semana" }));

      fireEvent.click(screen.getByRole("button", { name: "Día" }));

      expect(screen.getByRole("button", { name: "Día" })).toHaveAttribute("aria-pressed", "true");
      expect(titulo()).toContain("Miércoles, 10 de junio");
    });
  });

  describe("turnos y resumen", () => {
    it("sin turnos el día lo dice", () => {
      renderAgenda("MEDICO");

      expect(screen.getByText("No tenés turnos este día")).toBeInTheDocument();
    });

    it("cuenta turnos de hoy, de la semana y por confirmar, sin contar los cancelados", () => {
      responder({
        "/turnos": {
          data: [
            turno(1, new Date(2026, 5, 10, 14), "Pendiente"),
            turno(2, new Date(2026, 5, 10, 15), "Confirmado"),
            turno(3, new Date(2026, 5, 11, 9), "Reprogramado"),
            turno(4, new Date(2026, 5, 11, 10), "Cancelado"),
            turno(5, new Date(2026, 5, 20, 10), "Pendiente"),
          ],
        },
      });
      renderAgenda("MEDICO");

      const dato = (texto: string) => screen.getByText(texto).nextElementSibling;
      expect(dato("Turnos hoy")).toHaveTextContent("2");
      expect(dato("Esta semana")).toHaveTextContent("3");
      expect(dato("Por confirmar")).toHaveTextContent("3");
    });

    it("cada turno del día es un link con hora, paciente y estado, a la ficha del paciente", () => {
      responder({ "/turnos": { data: [turno(7, new Date(2026, 5, 10, 14, 30), "Confirmado", "Beto")] } });
      renderAgenda("MEDICO");

      const link = screen.getByRole("link", { name: "14:30, Beto Test, Confirmado" });
      expect(link).toHaveAttribute("href", "/pacientes/7");
    });

    it("la leyenda explica los cuatro estados", () => {
      renderAgenda("MEDICO");

      const leyenda = screen.getByRole("list", { name: "Estados de turno" });
      for (const estado of ["Confirmado", "Pendiente", "Reprogramado", "Cancelado"]) expect(leyenda).toHaveTextContent(estado);
    });

    it("mientras carga muestra un spinner y no el resumen", () => {
      responder({ "/turnos": { data: null, loading: true } });
      renderAgenda("MEDICO");

      expect(screen.getByRole("status", { name: "Cargando agenda" })).toBeInTheDocument();
      expect(screen.queryByText("Turnos hoy")).not.toBeInTheDocument();
    });

    it("si falla muestra el motivo", () => {
      responder({ "/turnos": { data: null, error: new Error("sin conexión") } });
      renderAgenda("MEDICO");

      expect(screen.getByRole("alert")).toHaveTextContent("No se pudo cargar la agenda: sin conexión");
    });
  });

  describe("la secretaria", () => {
    it("mientras cargan los médicos muestra un spinner", () => {
      responder({ "/medicos": { data: null, loading: true }, "/turnos": { data: [] } });
      renderAgenda("SECRETARIA");

      expect(screen.getByRole("status", { name: "Cargando agenda" })).toBeInTheDocument();
    });

    it("si no hay médicos cargados lo avisa", () => {
      responder({ "/medicos": { data: [] }, "/turnos": { data: [] } });
      renderAgenda("SECRETARIA");

      expect(screen.getByRole("alert")).toHaveTextContent("No hay médicos cargados.");
    });

    it("si falla la carga de médicos muestra el error", () => {
      responder({ "/medicos": { data: null, error: new Error("500") }, "/turnos": { data: [] } });
      renderAgenda("SECRETARIA");

      expect(screen.getByRole("alert")).toHaveTextContent("No se pudo cargar la agenda: 500");
    });

    it("con médicos, la descripción habla de elegir un médico", () => {
      responder({
        "/medicos": { data: [{ id: 1, especialidad: "Cardiología", usuario: { nombre: "Carlos", apellido: "Gómez" } }] },
        "/turnos": { data: [] },
      });
      renderAgenda("SECRETARIA");

      expect(screen.getByText(/Elegí un médico para ver sus turnos por horario/)).toBeInTheDocument();
      expect(screen.getByText("Agenda del consultorio")).toBeInTheDocument();
    });
  });
});
