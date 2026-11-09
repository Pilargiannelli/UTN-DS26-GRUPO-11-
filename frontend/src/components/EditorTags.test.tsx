import { describe, it, expect, vi } from "vitest";
import { createRef } from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { EditorTags } from "./EditorTags";
import type { EditorTagsRef } from "../types/EditorTagsProps";

// Como el hook real: el MEDICO ve el contenido, cualquier otro rol no ve nada
const comoMedico = (config: { medico: React.ReactNode }) => config.medico;
const comoOtroRol = () => null;

function renderEditor(tags: string[], { useRolView = comoMedico, onPreGuardar = vi.fn(), ref = undefined as React.Ref<EditorTagsRef> | undefined } = {}) {
  render(<EditorTags ref={ref} titulo="Alergias" tagsIniciales={tags} useRolView={useRolView} onPreGuardar={onPreGuardar} />);
  return onPreGuardar;
}

describe("EditorTags", () => {
  it("muestra el título y las etiquetas", () => {
    renderEditor(["Polen", "Látex"]);

    expect(screen.getByText("Alergias")).toBeInTheDocument();
    expect(screen.getByText("Polen")).toBeInTheDocument();
    expect(screen.getByText("Látex")).toBeInTheDocument();
  });

  it("sin etiquetas avisa que no hay registros", () => {
    renderEditor([]);

    expect(screen.getByText("No hay registros cargados.")).toBeInTheDocument();
  });

  it("un rol distinto de MEDICO no ve el botón Editar", () => {
    renderEditor(["Polen"], { useRolView: comoOtroRol });

    expect(screen.queryByRole("button", { name: "Editar" })).not.toBeInTheDocument();
  });

  it("al editar aparecen el campo para agregar y se pueden quitar etiquetas", () => {
    renderEditor(["Polen"]);
    expect(screen.queryByRole("button", { name: "×" })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Editar" }));

    expect(screen.getByPlaceholderText("Agregar nuevo...")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "×" })).toBeInTheDocument();
  });

  it("agrega una etiqueta sin espacios sobrantes y no agrega vacías", () => {
    renderEditor([]);
    fireEvent.click(screen.getByRole("button", { name: "Editar" }));
    const campo = screen.getByPlaceholderText("Agregar nuevo...");

    fireEvent.change(campo, { target: { value: "   " } });
    fireEvent.click(screen.getByRole("button", { name: "+" }));
    expect(screen.getByText("No hay registros cargados.")).toBeInTheDocument();

    fireEvent.change(campo, { target: { value: "  Polen  " } });
    fireEvent.click(screen.getByRole("button", { name: "+" }));
    expect(screen.getByText("Polen")).toBeInTheDocument();
    expect(campo).toHaveValue("");
  });

  it("Guardar Cambios entrega la lista editada", () => {
    const onPreGuardar = renderEditor(["Polen", "Látex"]);
    fireEvent.click(screen.getByRole("button", { name: "Editar" }));
    fireEvent.click(screen.getAllByRole("button", { name: "×" })[0]);

    fireEvent.click(screen.getByRole("button", { name: /Guardar Cambios/ }));

    expect(onPreGuardar).toHaveBeenCalledWith(["Látex"]);
  });

  it("Cancelar descarta los cambios y sale de la edición", () => {
    renderEditor(["Polen"]);
    fireEvent.click(screen.getByRole("button", { name: "Editar" }));
    fireEvent.click(screen.getByRole("button", { name: "×" }));

    fireEvent.click(screen.getByRole("button", { name: /Cancelar/ }));

    expect(screen.getByText("Polen")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Editar" })).toBeInTheDocument();
  });

  it("el padre puede cerrar la edición con finalizarEdicionExitosamente", () => {
    const ref = createRef<EditorTagsRef>();
    renderEditor(["Polen"], { ref });
    fireEvent.click(screen.getByRole("button", { name: "Editar" }));

    act(() => ref.current!.finalizarEdicionExitosamente());

    expect(screen.getByRole("button", { name: "Editar" })).toBeInTheDocument();
    expect(screen.queryByPlaceholderText("Agregar nuevo...")).not.toBeInTheDocument();
  });
});
