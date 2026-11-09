import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AuthContext, type AuthContextType } from "../context/AuthContextBase";

vi.mock("../components/CarruselProfesionales", () => ({
  CarruselProfesionales: ({ profesionales }: { profesionales: unknown[] }) => <p>carrusel con {profesionales.length} profesionales</p>,
}));

import Landing from "./Landing";

function renderLanding(rol: string | null) {
  const auth = { estaAutenticado: rol !== null, rol } as unknown as AuthContextType;
  return render(
    <AuthContext.Provider value={auth}>
      <MemoryRouter>
        <Landing />
      </MemoryRouter>
    </AuthContext.Provider>
  );
}

describe("Landing (pública)", () => {
  beforeEach(() => {
    window.scrollTo = vi.fn() as never;
  });

  it("muestra el mensaje de bienvenida y las secciones del menú", () => {
    renderLanding(null);

    expect(screen.getByRole("heading", { level: 1, name: "La confianza de sentirte cuidado" })).toBeInTheDocument();
    const menu = screen.getByRole("navigation", { name: "Secciones" });
    for (const seccion of ["Inicio", "Especialidades", "Profesionales", "Contacto"]) {
      expect(menu).toHaveTextContent(seccion);
    }
  });

  it("lista las 15 especialidades", () => {
    renderLanding(null);

    const lista = screen.getAllByRole("listitem");
    expect(lista).toHaveLength(15);
    expect(screen.getByText("Cardiología")).toBeInTheDocument();
    expect(screen.getByText("Medicina General")).toBeInTheDocument();
  });

  it("pasa los 19 profesionales al carrusel", () => {
    renderLanding(null);

    expect(screen.getByText("carrusel con 19 profesionales")).toBeInTheDocument();
  });

  it("muestra dirección, horario y teléfono de contacto", () => {
    renderLanding(null);

    expect(screen.getByText(/Almafuerte 3157/)).toBeInTheDocument();
    expect(screen.getByText(/Lunes a viernes/)).toBeInTheDocument();
    expect(screen.getByText("02344 43-1919")).toBeInTheDocument();
  });

  describe("según la sesión", () => {
    it("invitado: ofrece Crear cuenta, Ingresar y Agendar turno (que lleva a crear cuenta)", () => {
      renderLanding(null);

      expect(screen.getByRole("link", { name: "Crear cuenta" })).toHaveAttribute("href", "/crear-cuenta");
      expect(screen.getByRole("link", { name: "Ingresar" })).toHaveAttribute("href", "/login");
      expect(screen.getByRole("link", { name: "Agendar turno" })).toHaveAttribute("href", "/crear-cuenta");
    });

    it("paciente: Agendar turno va a pedir-turno y puede ir al portal; sin Crear cuenta ni Ingresar", () => {
      renderLanding("PACIENTE");

      expect(screen.getByRole("link", { name: "Agendar turno" })).toHaveAttribute("href", "/pedir-turno");
      expect(screen.getByRole("link", { name: "Ingresar al portal" })).toHaveAttribute("href", "/home");
      expect(screen.queryByRole("link", { name: "Crear cuenta" })).not.toBeInTheDocument();
      expect(screen.queryByRole("link", { name: "Ingresar" })).not.toBeInTheDocument();
    });

    it.each(["MEDICO", "SECRETARIA"])("%s: ofrece ir a su panel", (rol) => {
      renderLanding(rol);

      expect(screen.getByRole("link", { name: "Ir a mi panel" })).toHaveAttribute("href", "/home");
      expect(screen.queryByRole("link", { name: "Agendar turno" })).not.toBeInTheDocument();
    });
  });

  it("'Inicio' sube al principio de la página sin recargar", () => {
    renderLanding(null);

    fireEvent.click(screen.getByRole("link", { name: "Inicio" }));

    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: "smooth" });
    expect(window.location.hash).toBe("#inicio");
  });

  describe("sección actual de la barra", () => {
    // jsdom no tiene layout: se simula en qué posición de la pantalla está cada sección
    function posicionar(tops: Record<string, number>) {
      vi.spyOn(Element.prototype, "getBoundingClientRect").mockImplementation(function (this: Element) {
        return { top: tops[this.id] ?? 0 } as DOMRect;
      });
    }
    const actual = () =>
      screen.getByRole("navigation", { name: "Secciones" }).querySelector('[aria-current="location"]');
    const hacerScroll = () => act(() => void window.dispatchEvent(new Event("scroll")));

    beforeEach(() => {
      Object.defineProperty(document.documentElement, "scrollHeight", { value: 5000, configurable: true });
      Object.defineProperty(window, "scrollY", { value: 0, configurable: true });
    });
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("arriba de todo está marcada Inicio", () => {
      posicionar({ inicio: 0, especialidades: 800, profesionales: 1600, contacto: 2400 });
      renderLanding(null);

      expect(actual()).toHaveTextContent("Inicio");
    });

    it("al pasar por una sección queda marcada esa sección", () => {
      posicionar({ inicio: -700, especialidades: 50, profesionales: 900, contacto: 1700 });
      renderLanding(null);

      hacerScroll();

      expect(actual()).toHaveTextContent("Especialidades");
    });

    it("al llegar al final de la página queda marcada la última sección", () => {
      posicionar({ inicio: -3000, especialidades: -2000, profesionales: -1000, contacto: 400 });
      renderLanding(null);
      Object.defineProperty(window, "scrollY", { value: 5000, configurable: true });

      hacerScroll();

      expect(actual()).toHaveTextContent("Contacto");
    });
  });

  it("el pie muestra el año actual", () => {
    renderLanding(null);

    expect(screen.getByText(new RegExp(`© ${new Date().getFullYear()} Clínica IMOS`))).toBeInTheDocument();
  });
});

describe("Landing: aparición de secciones (IntersectionObserver)", () => {
  type Callback = (entradas: Partial<IntersectionObserverEntry>[]) => void;
  let callback: Callback;
  const observar = vi.fn();
  const desconectar = vi.fn();
  const dejarDeObservar = vi.fn();

  beforeEach(() => {
    window.scrollTo = vi.fn() as never;
    observar.mockClear();
    desconectar.mockClear();
    dejarDeObservar.mockClear();
    class FalsoObserver {
      constructor(cb: Callback) {
        callback = cb;
      }
      observe = observar;
      disconnect = desconectar;
      unobserve = dejarDeObservar;
    }
    vi.stubGlobal("IntersectionObserver", FalsoObserver);
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("marca la página y observa los contenidos de cada bloque", () => {
    const { container } = renderLanding(null);

    expect(container.querySelector(".landing-page")).toHaveClass("con-reveal");
    expect(observar).toHaveBeenCalled();
    expect(container.querySelector(".landing-bloque > section > *")).toHaveClass("landing-revelar");
  });

  it("un bloque que entra en pantalla pasa a visible y se deja de observar", () => {
    const { container } = renderLanding(null);
    const bloque = container.querySelector(".landing-revelar") as HTMLElement;

    act(() => callback([{ target: bloque, isIntersecting: true, boundingClientRect: { top: 50 } as DOMRect }]));

    expect(bloque).toHaveClass("visible");
    expect(bloque).not.toHaveClass("instantaneo");
    expect(dejarDeObservar).toHaveBeenCalledWith(bloque);
  });

  it("un bloque que ya quedó arriba se muestra sin animar", () => {
    const { container } = renderLanding(null);
    const bloque = container.querySelector(".landing-revelar") as HTMLElement;

    act(() => callback([{ target: bloque, isIntersecting: false, boundingClientRect: { top: -200 } as DOMRect }]));

    expect(bloque).toHaveClass("visible", "instantaneo");
  });

  it("un bloque que todavía no llegó (abajo) no se toca", () => {
    const { container } = renderLanding(null);
    const bloque = container.querySelector(".landing-revelar") as HTMLElement;

    act(() => callback([{ target: bloque, isIntersecting: false, boundingClientRect: { top: 900 } as DOMRect }]));

    expect(bloque).not.toHaveClass("visible");
  });

  it("al salir de la página deja todo como estaba", () => {
    const { container, unmount } = renderLanding(null);
    const bloque = container.querySelector(".landing-revelar") as HTMLElement;

    unmount();

    expect(desconectar).toHaveBeenCalled();
    expect(bloque).not.toHaveClass("landing-revelar");
  });
});
