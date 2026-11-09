import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { CarruselProfesionales, type Profesional } from "./CarruselProfesionales";

const lista: Profesional[] = ["Ana Pérez", "Beto Ríos", "Cora Sosa", "Dani Paz", "Eli Luna"].map((nombre, i) => ({
  nombre,
  cargo: `Cargo ${i}`,
}));

const central = (c: HTMLElement) => c.querySelector(".central h3")?.textContent;

describe("CarruselProfesionales: navegación y fotos", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("la flecha 'anterior' da la vuelta al principio de la lista", () => {
    const { container } = render(<CarruselProfesionales profesionales={lista} />);
    expect(central(container)).toBe("Ana Pérez");

    fireEvent.click(screen.getByRole("button", { name: "Profesional anterior" }));

    expect(central(container)).toBe("Eli Luna");
  });

  it("la flecha 'siguiente' da la vuelta al final de la lista", () => {
    const { container } = render(<CarruselProfesionales profesionales={lista} />);

    for (let i = 0; i < 5; i++) fireEvent.click(screen.getByRole("button", { name: "Profesional siguiente" }));

    expect(central(container)).toBe("Ana Pérez");
  });

  it("hacer click en una tarjeta vecina la trae al centro", () => {
    const { container } = render(<CarruselProfesionales profesionales={lista} />);

    fireEvent.click(screen.getByText("Beto Ríos"));

    expect(central(container)).toBe("Beto Ríos");
  });

  it("solo la tarjeta central es accesible para el lector de pantalla", () => {
    const { container } = render(<CarruselProfesionales profesionales={lista} />);

    const tarjetas = container.querySelectorAll("article");
    expect(tarjetas[0]).not.toHaveAttribute("aria-hidden");
    expect(tarjetas[1]).toHaveAttribute("aria-hidden", "true");
  });

  it("avanza solo cada 4,5 segundos", () => {
    const { container } = render(<CarruselProfesionales profesionales={lista} />);

    act(() => vi.advanceTimersByTime(4500));

    // avanza hacia la derecha: entra la anterior por la izquierda
    expect(central(container)).toBe("Eli Luna");
  });

  it("no avanza si la pestaña del navegador está oculta", () => {
    const { container } = render(<CarruselProfesionales profesionales={lista} />);
    vi.spyOn(document, "hidden", "get").mockReturnValue(true);

    act(() => vi.advanceTimersByTime(9000));

    expect(central(container)).toBe("Ana Pérez");
    vi.restoreAllMocks();
  });

  it("al sacar el mouse reanuda el avance automático", () => {
    const { container } = render(<CarruselProfesionales profesionales={lista} />);
    const region = screen.getByRole("region", { name: "Profesionales" });

    fireEvent.mouseEnter(region);
    act(() => vi.advanceTimersByTime(9000));
    expect(central(container)).toBe("Ana Pérez");

    fireEvent.mouseLeave(region);
    act(() => vi.advanceTimersByTime(4500));
    expect(central(container)).toBe("Eli Luna");
  });

  it("al perder el foco reanuda el avance automático", () => {
    const { container } = render(<CarruselProfesionales profesionales={lista} />);
    const region = screen.getByRole("region", { name: "Profesionales" });

    fireEvent.mouseEnter(region);
    fireEvent.blur(region);
    act(() => vi.advanceTimersByTime(4500));

    expect(central(container)).toBe("Eli Luna");
  });

  it("al desmontar deja de avanzar (no queda ningún temporizador)", () => {
    const { unmount } = render(<CarruselProfesionales profesionales={lista} />);

    unmount();

    expect(vi.getTimerCount()).toBe(0);
  });

  describe("fotos", () => {
    const foto = (f: Profesional["foto"]) => {
      const { container } = render(<CarruselProfesionales profesionales={[{ nombre: "Zeta Cero", cargo: "X", foto: f }]} />);
      return container.querySelector(".landing-prof-foto") as HTMLElement;
    };

    it("una ruta de imagen propia se usa tal cual", () => {
      expect(foto("/profesionales/ana.jpg").style.backgroundImage).toContain("/profesionales/ana.jpg");
    });

    it("sin foto ni archivo propio usa la imagen genérica", () => {
      expect(foto(undefined).style.backgroundImage).toContain("/SinFoto.png");
    });

    it("un recorte sin hoja sale de /profesionales.webp", () => {
      expect(foto({ x: 56, y: 189, w: 310, h: 257 }).style.backgroundImage).toContain("/profesionales.webp");
    });

    it("un recorte de la hoja del equipo sale de /equipo-medico.webp", () => {
      expect(foto({ hoja: "equipo", x: 60, y: 14, w: 269, h: 154 }).style.backgroundImage).toContain("/equipo-medico.webp");
    });

    it("un recorte de la hoja más alto que ancho se ajusta a la proporción de la tarjeta", () => {
      const el = foto({ hoja: "equipo", x: 0, y: 0, w: 100, h: 400 });

      expect(el.style.aspectRatio.replace(/\s/g, "")).toBe(`100/${100 / (310 / 257)}`);
    });
  });
});
