import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Paginador } from "./Paginador";
import { FiltroPeriodo } from "./FiltroPeriodo";
import { ETIQUETAS_PERIODO, type Periodo } from "../../utils/periodos";

describe("Paginador", () => {
  it("muestra el rango visible y la página actual", () => {
    render(<Paginador pagina={2} tamanio={8} total={23} onCambiar={vi.fn()} />);

    expect(screen.getByText("Mostrando 9–16 de 23")).toBeInTheDocument();
    expect(screen.getByText("Página 2 de 3")).toBeInTheDocument();
  });

  it("en la última página recorta el 'hasta' al total", () => {
    render(<Paginador pagina={3} tamanio={8} total={23} onCambiar={vi.fn()} />);

    expect(screen.getByText("Mostrando 17–23 de 23")).toBeInTheDocument();
  });

  it("sin resultados muestra 0–0 de 0 y página 1 de 1", () => {
    render(<Paginador pagina={1} tamanio={8} total={0} onCambiar={vi.fn()} />);

    expect(screen.getByText("Mostrando 0–0 de 0")).toBeInTheDocument();
    expect(screen.getByText("Página 1 de 1")).toBeInTheDocument();
  });

  it("en la primera página no se puede retroceder", () => {
    render(<Paginador pagina={1} tamanio={8} total={23} onCambiar={vi.fn()} />);

    expect(screen.getByRole("button", { name: "Página anterior" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Página siguiente" })).toBeEnabled();
  });

  it("en la última página no se puede avanzar", () => {
    render(<Paginador pagina={3} tamanio={8} total={23} onCambiar={vi.fn()} />);

    expect(screen.getByRole("button", { name: "Página siguiente" })).toBeDisabled();
  });

  it("pide la página anterior o la siguiente al hacer click", () => {
    const onCambiar = vi.fn();
    render(<Paginador pagina={2} tamanio={8} total={23} onCambiar={onCambiar} />);

    fireEvent.click(screen.getByRole("button", { name: "Página anterior" }));
    fireEvent.click(screen.getByRole("button", { name: "Página siguiente" }));

    expect(onCambiar).toHaveBeenNthCalledWith(1, 1);
    expect(onCambiar).toHaveBeenNthCalledWith(2, 3);
  });
});

describe("FiltroPeriodo", () => {
  const periodos = ["todo", "personalizado"] as Periodo[];

  function renderFiltro(valor: Periodo, extra = {}) {
    const props = { onCambiar: vi.fn(), onDesde: vi.fn(), onHasta: vi.fn(), ...extra };
    render(<FiltroPeriodo periodos={periodos} valor={valor} desde="" hasta="" {...props} />);
    return props;
  }

  it("marca como presionado solo el período activo", () => {
    renderFiltro("todo");

    expect(screen.getByRole("button", { name: ETIQUETAS_PERIODO.todo })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: ETIQUETAS_PERIODO.personalizado })).toHaveAttribute("aria-pressed", "false");
  });

  it("avisa qué período se eligió", () => {
    const { onCambiar } = renderFiltro("todo");

    fireEvent.click(screen.getByRole("button", { name: ETIQUETAS_PERIODO.personalizado }));

    expect(onCambiar).toHaveBeenCalledWith("personalizado");
  });

  it("solo con 'personalizado' aparecen las fechas Desde y Hasta", () => {
    const { unmount } = render(
      <FiltroPeriodo periodos={periodos} valor="todo" onCambiar={vi.fn()} desde="" hasta="" onDesde={vi.fn()} onHasta={vi.fn()} />
    );
    expect(screen.queryByLabelText("Desde")).not.toBeInTheDocument();
    unmount();

    renderFiltro("personalizado");
    expect(screen.getByLabelText("Desde")).toBeInTheDocument();
    expect(screen.getByLabelText("Hasta")).toBeInTheDocument();
  });

  it("cambiar las fechas avisa con el valor nuevo", () => {
    const { onDesde, onHasta } = renderFiltro("personalizado");

    fireEvent.change(screen.getByLabelText("Desde"), { target: { value: "2026-06-01" } });
    fireEvent.change(screen.getByLabelText("Hasta"), { target: { value: "2026-06-30" } });

    expect(onDesde).toHaveBeenCalledWith("2026-06-01");
    expect(onHasta).toHaveBeenCalledWith("2026-06-30");
  });
});
