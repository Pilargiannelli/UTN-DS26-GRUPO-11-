import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

vi.mock("../../services/api", () => ({
  apiFetch: vi.fn(),
  ApiError: class ApiError extends Error {
    status: number;
    detalles: { campo: string; mensaje: string }[];
    constructor(message: string, status: number, detalles: { campo: string; mensaje: string }[] = []) {
      super(message);
      this.status = status;
      this.detalles = detalles;
    }
  },
}));

import { apiFetch, ApiError } from "../../services/api";
import { DatosCuentaForm } from "./DatosCuentaForm";

const usuario = (rol = "PACIENTE") =>
  ({ id: 1, rol, nombre: "Ana", apellido: "Pérez", email: "ana@imos.test", dni: "30111222" }) as never;

function renderForm(rol = "PACIENTE", onGuardado = vi.fn()) {
  render(<DatosCuentaForm usuario={usuario(rol)} onGuardado={onGuardado} />);
  return onGuardado;
}

const guardar = () => screen.getByRole("button", { name: /Guardar cambios/ });
const cambiar = (label: string, valor: string) => fireEvent.change(screen.getByLabelText(label), { target: { value: valor } });

describe("DatosCuentaForm", () => {
  beforeEach(() => {
    vi.mocked(apiFetch).mockReset();
  });

  it("arranca con los datos del usuario y Guardar deshabilitado (sin cambios)", () => {
    renderForm();

    expect(screen.getByLabelText("Nombre")).toHaveValue("Ana");
    expect(screen.getByLabelText("Apellido")).toHaveValue("Pérez");
    expect(screen.getByLabelText("Email")).toHaveValue("ana@imos.test");
    expect(guardar()).toBeDisabled();
  });

  it("muestra el DNI deshabilitado para el paciente", () => {
    renderForm("PACIENTE");

    expect(screen.getByLabelText("DNI")).toBeDisabled();
  });

  it("no muestra el DNI en la cuenta de la secretaria", () => {
    renderForm("SECRETARIA");

    expect(screen.queryByLabelText("DNI")).not.toBeInTheDocument();
  });

  it("al cambiar algo habilita Guardar y aparece Descartar", async () => {
    renderForm();

    cambiar("Nombre", "Anita");

    await waitFor(() => expect(guardar()).toBeEnabled());
    expect(screen.getByRole("button", { name: "Descartar cambios" })).toBeInTheDocument();
  });

  it("Descartar vuelve a los datos originales", async () => {
    renderForm();
    cambiar("Nombre", "Anita");

    fireEvent.click(await screen.findByRole("button", { name: "Descartar cambios" }));

    await waitFor(() => expect(screen.getByLabelText("Nombre")).toHaveValue("Ana"));
  });

  it("un nombre vacío muestra el error y no llama a la API", async () => {
    renderForm();
    cambiar("Nombre", "");

    fireEvent.click(await waitFor(() => { expect(guardar()).toBeEnabled(); return guardar(); }));

    expect(await screen.findByText("El nombre es obligatorio")).toBeInTheDocument();
    expect(apiFetch).not.toHaveBeenCalled();
  });

  it("un email inválido muestra el error y no llama a la API", async () => {
    renderForm();
    cambiar("Email", "no-es-mail");

    fireEvent.click(await waitFor(() => { expect(guardar()).toBeEnabled(); return guardar(); }));

    expect(await screen.findByText("El email no es válido")).toBeInTheDocument();
    expect(apiFetch).not.toHaveBeenCalled();
  });

  it("con datos válidos hace PATCH /auth/yo y avisa con el usuario actualizado", async () => {
    const actualizado = { ...(usuario() as object), nombre: "Anita" };
    vi.mocked(apiFetch).mockResolvedValue(actualizado);
    const onGuardado = renderForm();
    cambiar("Nombre", "Anita");

    fireEvent.click(await waitFor(() => { expect(guardar()).toBeEnabled(); return guardar(); }));

    await waitFor(() => expect(onGuardado).toHaveBeenCalledWith(actualizado));
    const [ruta, opciones] = vi.mocked(apiFetch).mock.calls[0];
    expect(ruta).toBe("/auth/yo");
    expect(opciones?.method).toBe("PATCH");
    expect(JSON.parse(opciones!.body as string)).toEqual({ nombre: "Anita", apellido: "Pérez", email: "ana@imos.test" });
  });

  it("un 409 por email repetido se muestra en el campo email", async () => {
    vi.mocked(apiFetch).mockImplementation(async () => {
      throw new ApiError("El email ya se encuentra registrado", 409);
    });
    const onGuardado = renderForm();
    cambiar("Email", "otro@imos.test");

    fireEvent.click(await waitFor(() => { expect(guardar()).toBeEnabled(); return guardar(); }));

    expect(await screen.findByText("El email ya se encuentra registrado")).toBeInTheDocument();
    expect(onGuardado).not.toHaveBeenCalled();
  });

  it("un error genérico se muestra arriba del formulario", async () => {
    vi.mocked(apiFetch).mockImplementation(async () => {
      throw new Error("Sin conexión");
    });
    renderForm();
    cambiar("Nombre", "Anita");

    fireEvent.click(await waitFor(() => { expect(guardar()).toBeEnabled(); return guardar(); }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Sin conexión");
  });
});
