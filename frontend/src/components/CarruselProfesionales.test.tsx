import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { CarruselProfesionales } from "./CarruselProfesionales";

const profesionales = ["Ana", "Beto", "Carla", "Dani", "Eva", "Fede"].map((nombre) => ({ nombre, cargo: "Cardiología" }));

const central = (contenedor: HTMLElement) => contenedor.querySelector(".central h3")?.textContent;

beforeEach(() => vi.useFakeTimers());
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("CarruselProfesionales", () => {
  it("muestra el primero al centro y las flechas lo cambian", () => {
    const { container } = render(<CarruselProfesionales profesionales={profesionales} />);
    expect(central(container)).toBe("Ana");

    fireEvent.click(screen.getByRole("button", { name: "Profesional siguiente" }));
    expect(central(container)).toBe("Beto");

    fireEvent.click(screen.getByRole("button", { name: "Profesional anterior" }));
    fireEvent.click(screen.getByRole("button", { name: "Profesional anterior" }));
    expect(central(container)).toBe("Fede");
  });

  it("avanza solo, hacia la derecha: la que entra viene de la izquierda", () => {
    const { container } = render(<CarruselProfesionales profesionales={profesionales} />);

    act(() => {
      vi.advanceTimersByTime(4500);
    });
    expect(central(container)).toBe("Fede");

    act(() => {
      vi.advanceTimersByTime(4500);
    });
    expect(central(container)).toBe("Eva");
  });

  it("se detiene mientras el mouse está encima", () => {
    const { container } = render(<CarruselProfesionales profesionales={profesionales} />);

    fireEvent.mouseEnter(container.querySelector(".landing-carrusel")!);
    act(() => {
      vi.advanceTimersByTime(14000);
    });
    expect(central(container)).toBe("Ana");

    fireEvent.mouseLeave(container.querySelector(".landing-carrusel")!);
    act(() => {
      vi.advanceTimersByTime(4500);
    });
    expect(central(container)).toBe("Fede");
  });
});
