import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { IconoEspecialidad } from "./IconoEspecialidad";

const ESPECIALIDADES = [
  "Nutrición", "Cardiología", "Cirugía", "Otorrinolaringología", "Ecografías", "Traumatología", "Odontología",
  "Ortodoncia y Ortopedia", "Oftalmología", "Psiquiatría", "Ginecología", "Reumatología", "Pediatría",
  "Fonoaudiología", "Medicina General",
];

describe("IconoEspecialidad", () => {
  it.each(ESPECIALIDADES)("%s tiene su propio dibujo", (nombre) => {
    const { container } = render(<IconoEspecialidad nombre={nombre} />);

    const svg = container.querySelector("svg")!;
    expect(svg.children.length).toBeGreaterThan(0);
  });

  it("es decorativo: el lector de pantalla lo ignora", () => {
    const { container } = render(<IconoEspecialidad nombre="Cardiología" />);

    expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  });

  it("una especialidad sin ícono no rompe: dibuja un svg vacío", () => {
    const { container } = render(<IconoEspecialidad nombre="Especialidad inventada" />);

    expect(container.querySelector("svg")!.children).toHaveLength(0);
  });

  it("especialidades distintas no comparten el mismo dibujo", () => {
    const html = ESPECIALIDADES.map((n) => render(<IconoEspecialidad nombre={n} />).container.innerHTML);

    expect(new Set(html).size).toBe(ESPECIALIDADES.length);
  });
});
