import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ConsultaModal } from "./ConsultaModal";

const entrada = {
  id: 1,
  historiaClinicaId: 1,
  fecha: new Date(2026, 5, 10, 12).toISOString(),
  diagnostico: "Hipertensión leve",
  evolucion: "Caminar 30 minutos por día",
  observaciones: "Control en un mes",
};

describe("ConsultaModal", () => {
  it("muestra diagnóstico, evolución, observaciones y la fecha en letras", () => {
    render(<ConsultaModal entrada={entrada} onCerrar={vi.fn()} />);

    expect(screen.getByText("Hipertensión leve")).toBeInTheDocument();
    expect(screen.getByText("Caminar 30 minutos por día")).toBeInTheDocument();
    expect(screen.getByText("Control en un mes")).toBeInTheDocument();
    expect(screen.getByText(/10 de junio de 2026/)).toBeInTheDocument();
  });

  it("sin observaciones muestra un guion", () => {
    render(<ConsultaModal entrada={{ ...entrada, observaciones: "" }} onCerrar={vi.fn()} />);

    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("el botón Cerrar avisa al padre", () => {
    const onCerrar = vi.fn();
    render(<ConsultaModal entrada={entrada} onCerrar={onCerrar} />);

    fireEvent.click(screen.getAllByRole("button", { name: "Cerrar" }).at(-1)!);

    expect(onCerrar).toHaveBeenCalled();
  });

  it("es solo lectura: no tiene campos para editar", () => {
    render(<ConsultaModal entrada={entrada} onCerrar={vi.fn()} />);

    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });
});
