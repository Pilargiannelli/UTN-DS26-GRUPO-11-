import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ListaEditable } from "./ListaEditable";

function renderLista(items: string[], onGuardar = vi.fn().mockResolvedValue(undefined)) {
  render(<ListaEditable titulo="Alergias" items={items} tono="alerta" vacio="Sin alergias registradas" onGuardar={onGuardar} />);
  return onGuardar;
}

const editar = () => fireEvent.click(screen.getByRole("button", { name: "Editar alergias" }));
const escribir = (texto: string) => {
  const campo = screen.getByPlaceholderText("Escribí y apretá Enter");
  fireEvent.change(campo, { target: { value: texto } });
  return campo;
};

describe("ListaEditable", () => {
  it("muestra los items como etiquetas", () => {
    renderLista(["Penicilina", "Polen"]);

    expect(screen.getAllByRole("listitem").map((li) => li.textContent)).toEqual(["Penicilina", "Polen"]);
  });

  it("sin items muestra el texto de lista vacía", () => {
    renderLista([]);

    expect(screen.getByText("Sin alergias registradas")).toBeInTheDocument();
  });

  it("en modo lectura no se pueden quitar items ni agregar", () => {
    renderLista(["Penicilina"]);

    expect(screen.queryByRole("button", { name: "Quitar Penicilina" })).not.toBeInTheDocument();
    expect(screen.queryByPlaceholderText("Escribí y apretá Enter")).not.toBeInTheDocument();
  });

  it("agrega un item con el botón Agregar y limpia el campo", () => {
    renderLista(["Penicilina"]);
    editar();

    const campo = escribir("  Polen  ");
    fireEvent.click(screen.getByRole("button", { name: "Agregar" }));

    expect(screen.getByText("Polen")).toBeInTheDocument();
    expect(campo).toHaveValue("");
  });

  it("agrega un item al apretar Enter", () => {
    renderLista([]);
    editar();

    fireEvent.keyDown(escribir("Látex"), { key: "Enter" });

    expect(screen.getByText("Látex")).toBeInTheDocument();
  });

  it("no agrega duplicados ni vacíos (sin distinguir mayúsculas)", () => {
    renderLista(["Polen"]);
    editar();

    escribir("polen");
    fireEvent.click(screen.getByRole("button", { name: "Agregar" }));
    escribir("   ");
    fireEvent.click(screen.getByRole("button", { name: "Agregar" }));

    expect(screen.getAllByRole("listitem")).toHaveLength(1);
  });

  it("quita un item con su X", () => {
    renderLista(["Penicilina", "Polen"]);
    editar();

    fireEvent.click(screen.getByRole("button", { name: "Quitar Penicilina" }));

    expect(screen.queryByText("Penicilina")).not.toBeInTheDocument();
    expect(screen.getByText("Polen")).toBeInTheDocument();
  });

  it("Guardar envía la lista editada y sale del modo edición", async () => {
    const onGuardar = renderLista(["Penicilina"]);
    editar();
    escribir("Polen");
    fireEvent.click(screen.getByRole("button", { name: "Agregar" }));

    fireEvent.click(screen.getByRole("button", { name: "Guardar" }));

    await waitFor(() => expect(screen.queryByRole("button", { name: "Guardar" })).not.toBeInTheDocument());
    expect(onGuardar).toHaveBeenCalledWith(["Penicilina", "Polen"]);
  });

  it("si el guardado falla muestra el error y sigue editando", async () => {
    const onGuardar = vi.fn().mockRejectedValue(new Error("Error de red"));
    renderLista(["Penicilina"], onGuardar);
    editar();

    fireEvent.click(screen.getByRole("button", { name: "Guardar" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Error de red");
    expect(screen.getByRole("button", { name: "Guardar" })).toBeEnabled();
  });

  it("Descartar vuelve a la lista original sin guardar", () => {
    const onGuardar = renderLista(["Penicilina"]);
    editar();
    fireEvent.click(screen.getByRole("button", { name: "Quitar Penicilina" }));

    fireEvent.click(screen.getByRole("button", { name: "Descartar" }));

    expect(screen.getByText("Penicilina")).toBeInTheDocument();
    expect(onGuardar).not.toHaveBeenCalled();
  });
});
