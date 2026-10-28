import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { NuevaEntradaForm } from "./NuevaEntradaForm";

afterEach(cleanup);

describe("NuevaEntradaForm (HU-004)", () => {
  it("no envía sin diagnóstico ni evolución y marca los campos", async () => {
    const onGuardar = vi.fn();
    render(<NuevaEntradaForm onGuardar={onGuardar} />);

    fireEvent.click(screen.getByRole("button", { name: "Guardar consulta" }));

    expect(await screen.findByText("El diagnóstico es obligatorio")).toBeInTheDocument();
    expect(screen.getByText("La evolución es obligatoria")).toBeInTheDocument();
    expect(onGuardar).not.toHaveBeenCalled();
  });

  it("envía los datos y limpia el formulario", async () => {
    const onGuardar = vi.fn().mockResolvedValue(undefined);
    render(<NuevaEntradaForm onGuardar={onGuardar} />);

    fireEvent.change(screen.getByLabelText("Diagnóstico"), { target: { value: "Esguince" } });
    fireEvent.change(screen.getByLabelText("Evolución e indicaciones"), { target: { value: "Reposo" } });
    fireEvent.click(screen.getByRole("button", { name: "Guardar consulta" }));

    await waitFor(() =>
      expect(onGuardar).toHaveBeenCalledWith({ diagnostico: "Esguince", evolucion: "Reposo", observaciones: "" })
    );
    await waitFor(() => expect(screen.getByLabelText("Diagnóstico")).toHaveValue(""));
  });

  it("muestra el error del back si no se pudo guardar", async () => {
    const onGuardar = vi.fn().mockRejectedValue(new Error("Paciente no encontrado"));
    render(<NuevaEntradaForm onGuardar={onGuardar} />);

    fireEvent.change(screen.getByLabelText("Diagnóstico"), { target: { value: "Esguince" } });
    fireEvent.change(screen.getByLabelText("Evolución e indicaciones"), { target: { value: "Reposo" } });
    fireEvent.click(screen.getByRole("button", { name: "Guardar consulta" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Paciente no encontrado");
  });
});
