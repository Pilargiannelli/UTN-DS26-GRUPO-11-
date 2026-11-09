import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

vi.mock("../services/api", () => ({ apiFetch: vi.fn() }));

import { apiFetch } from "../services/api";
import { NewPasswordForm } from "./CambiarPasswordForm";

function completar(actual: string, nueva: string, repetir: string) {
  fireEvent.change(screen.getByLabelText("Contraseña actual"), { target: { value: actual } });
  fireEvent.change(screen.getByLabelText("Nueva contraseña"), { target: { value: nueva } });
  fireEvent.change(screen.getByLabelText("Repetir nueva contraseña"), { target: { value: repetir } });
}

describe("NewPasswordForm", () => {
  beforeEach(() => {
    vi.mocked(apiFetch).mockClear();
  });

  it("el botón arranca deshabilitado hasta que el usuario escribe algo", () => {
    render(<NewPasswordForm onListo={vi.fn()} />);

    expect(screen.getByRole("button", { name: /Cambiar contraseña/ })).toBeDisabled();
  });

  it("con una contraseña nueva débil muestra el error y no llama a la API", async () => {
    render(<NewPasswordForm onListo={vi.fn()} />);

    completar("Vieja1234", "corta", "corta");
    fireEvent.click(screen.getByRole("button", { name: /Cambiar contraseña/ }));

    expect(await screen.findByText("La contraseña debe tener al menos 8 caracteres")).toBeInTheDocument();
    expect(apiFetch).not.toHaveBeenCalled();
  });

  it("si la repetición no coincide lo marca y no llama a la API", async () => {
    render(<NewPasswordForm onListo={vi.fn()} />);

    completar("Vieja1234", "Nueva1234", "Otra12345");
    fireEvent.click(screen.getByRole("button", { name: /Cambiar contraseña/ }));

    expect(await screen.findByText("Las nuevas contraseñas no coinciden")).toBeInTheDocument();
    expect(apiFetch).not.toHaveBeenCalled();
  });

  it("con datos válidos hace PATCH /auth/password con los nombres que espera el back y avisa onListo", async () => {
    vi.mocked(apiFetch).mockResolvedValue(undefined);
    const onListo = vi.fn();
    render(<NewPasswordForm onListo={onListo} />);

    completar("Vieja1234", "Nueva1234", "Nueva1234");
    fireEvent.click(screen.getByRole("button", { name: /Cambiar contraseña/ }));

    await waitFor(() => expect(onListo).toHaveBeenCalledTimes(1));
    const [ruta, opciones] = vi.mocked(apiFetch).mock.calls[0];
    expect(ruta).toBe("/auth/password");
    expect(opciones?.method).toBe("PATCH");
    expect(JSON.parse(opciones!.body as string)).toEqual({ passwordActual: "Vieja1234", passwordNueva: "Nueva1234" });
  });

  it("si el back rechaza la contraseña actual muestra su mensaje y no avisa onListo", async () => {
    vi.mocked(apiFetch).mockImplementation(async () => {
      throw new Error("La contraseña actual es incorrecta");
    });
    const onListo = vi.fn();
    render(<NewPasswordForm onListo={onListo} />);

    completar("Mala12345", "Nueva1234", "Nueva1234");
    fireEvent.click(screen.getByRole("button", { name: /Cambiar contraseña/ }));

    expect(await screen.findByRole("alert")).toHaveTextContent("La contraseña actual es incorrecta");
    expect(onListo).not.toHaveBeenCalled();
  });
});
