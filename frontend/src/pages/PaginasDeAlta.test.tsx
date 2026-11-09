import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

vi.mock("../components/RegistroPacienteForm", () => ({
  RegistroPacienteForm: ({ modo }: { modo: string }) => <p>formulario en modo {modo}</p>,
}));
vi.mock("../components/RegistroPacienteForm.tsx", () => ({
  RegistroPacienteForm: ({ modo }: { modo: string }) => <p>formulario en modo {modo}</p>,
}));
vi.mock("../components/Layout/Layout.tsx", () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

import AutoregistroPaciente from "./AutoregistroPaciente";
import RegistroPaciente from "./RegistroPaciente";

describe("AutoregistroPaciente (pública)", () => {
  it("muestra el formulario en modo autoregistro y un link para iniciar sesión", () => {
    render(
      <MemoryRouter>
        <AutoregistroPaciente />
      </MemoryRouter>
    );

    expect(screen.getByRole("heading", { name: "Crear cuenta" })).toBeInTheDocument();
    expect(screen.getByText("formulario en modo autoregistro")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Iniciá sesión" })).toHaveAttribute("href", "/login");
  });
});

describe("RegistroPaciente (secretaria)", () => {
  it("muestra el formulario en modo secretaria y el botón para volver al listado", () => {
    render(
      <MemoryRouter>
        <RegistroPaciente />
      </MemoryRouter>
    );

    expect(screen.getByRole("heading", { name: "Registrar paciente" })).toBeInTheDocument();
    expect(screen.getByText("formulario en modo secretaria")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Volver" })).toBeInTheDocument();
  });
});
