import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { BuscadorSelect } from "./BuscadorSelect";

afterEach(cleanup);

const opciones = [
  { value: "1", etiqueta: "Ana Pérez", detalle: "DNI 111" },
  { value: "2", etiqueta: "Beto Gómez", detalle: "DNI 222" },
];

function Envoltorio({ onChange = vi.fn() }: { onChange?: (v: string) => void }) {
  const [value, setValue] = useState("");
  return (
    <BuscadorSelect
      ariaLabel="Paciente"
      placeholder="Seleccione un paciente"
      opciones={opciones}
      value={value}
      onChange={(v) => { setValue(v); onChange(v); }}
    />
  );
}

describe("BuscadorSelect", () => {
  it("filtra por nombre, ignorando tildes y mayúsculas, y también por DNI", () => {
    render(<Envoltorio />);
    const entrada = screen.getByRole("combobox", { name: "Paciente" });

    fireEvent.focus(entrada);
    fireEvent.change(entrada, { target: { value: "PEREZ" } });
    expect(screen.getAllByRole("option")).toHaveLength(1);
    expect(screen.getByRole("option", { name: /Ana Pérez/ })).toBeInTheDocument();

    fireEvent.change(entrada, { target: { value: "222" } });
    expect(screen.getByRole("option", { name: /Beto Gómez/ })).toBeInTheDocument();

    fireEvent.change(entrada, { target: { value: "zzz" } });
    expect(screen.getByText("Sin resultados")).toBeInTheDocument();
  });

  it("elige una opción y la cruz la quita", () => {
    const onChange = vi.fn();
    render(<Envoltorio onChange={onChange} />);
    const entrada = screen.getByRole("combobox", { name: "Paciente" });

    fireEvent.focus(entrada);
    fireEvent.click(screen.getByRole("option", { name: /Beto Gómez/ }));
    expect(onChange).toHaveBeenLastCalledWith("2");
    expect(entrada).toHaveValue("Beto Gómez");

    fireEvent.click(screen.getByRole("button", { name: "Quitar paciente" }));
    expect(onChange).toHaveBeenLastCalledWith("");
    expect(screen.queryByRole("button", { name: "Quitar paciente" })).not.toBeInTheDocument();
  });

  it("permite elegir con el teclado", () => {
    const onChange = vi.fn();
    render(<Envoltorio onChange={onChange} />);
    const entrada = screen.getByRole("combobox", { name: "Paciente" });

    fireEvent.focus(entrada);
    fireEvent.keyDown(entrada, { key: "ArrowDown" });
    fireEvent.keyDown(entrada, { key: "Enter" });
    expect(onChange).toHaveBeenLastCalledWith("2");
  });

  it("bloqueado: muestra lo elegido pero no se puede cambiar ni quitar", () => {
    render(
      <BuscadorSelect ariaLabel="Paciente" placeholder="Buscar" opciones={opciones} value="2" onChange={vi.fn()} bloqueado />
    );
    const entrada = screen.getByRole("combobox", { name: "Paciente" });
    expect(entrada).toHaveValue("Beto Gómez");
    expect(entrada).toBeDisabled();
    expect(screen.queryByRole("button", { name: "Quitar paciente" })).not.toBeInTheDocument();
  });
});
