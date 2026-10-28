import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { AgregarObraSocial } from "./AgregarObraSocial";
import { apiFetch } from "../services/api";

vi.mock("../services/api", () => ({ apiFetch: vi.fn() }));

afterEach(() => {
  cleanup();
  vi.mocked(apiFetch).mockReset();
});

const abrir = () => fireEvent.click(screen.getByRole("button", { name: "+ Agregar obra social" }));
const escribir = (nombre: string) =>
  fireEvent.change(screen.getByLabelText("Nombre de la obra social nueva"), { target: { value: nombre } });

describe("AgregarObraSocial", () => {
  it("no llama a la API si el nombre está vacío", () => {
    render(<AgregarObraSocial onCreada={vi.fn()} />);
    abrir();
    fireEvent.click(screen.getByRole("button", { name: "Agregar" }));

    expect(screen.getByRole("alert")).toHaveTextContent("Escribí el nombre de la obra social");
    expect(apiFetch).not.toHaveBeenCalled();
  });

  it("crea la obra social y avisa cuál se creó", async () => {
    vi.mocked(apiFetch).mockResolvedValue({ id: 7, nombre: "IOMA" });
    const onCreada = vi.fn();
    render(<AgregarObraSocial onCreada={onCreada} />);
    abrir();
    escribir("  IOMA ");
    fireEvent.click(screen.getByRole("button", { name: "Agregar" }));

    await waitFor(() => expect(onCreada).toHaveBeenCalledWith({ id: 7, nombre: "IOMA" }));
    expect(apiFetch).toHaveBeenCalledWith("/obras-sociales", expect.objectContaining({ body: JSON.stringify({ nombre: "IOMA" }) }));
    // Se cierra y vuelve a mostrar el link
    expect(screen.getByRole("button", { name: "+ Agregar obra social" })).toBeInTheDocument();
  });

  it("muestra el error del back si ya existe", async () => {
    vi.mocked(apiFetch).mockRejectedValue(new Error("Ya existe un registro con ese valor único"));
    render(<AgregarObraSocial onCreada={vi.fn()} />);
    abrir();
    escribir("OSDE");
    fireEvent.click(screen.getByRole("button", { name: "Agregar" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Ya existe un registro con ese valor único");
  });
});
