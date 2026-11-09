import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthContext, type AuthContextType } from "../context/AuthContextBase";

vi.mock("../services/api", () => ({
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

import { apiFetch, ApiError } from "../services/api";
import { RegistroMedicoForm } from "./RegistroMedicoForm";

function Destino({ texto }: { texto: string }) {
  return <p>{texto} {JSON.stringify(useLocation().state)}</p>;
}

function renderForm(rol = "SECRETARIA") {
  const auth = { tieneRol: (r: string) => r === rol } as unknown as AuthContextType;
  render(
    <AuthContext.Provider value={auth}>
      <MemoryRouter initialEntries={["/formulario"]}>
        <Routes>
          <Route path="/formulario" element={<RegistroMedicoForm />} />
          <Route path="/buscar-medico" element={<Destino texto="pantalla buscar medico" />} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  );
}

const escribir = (label: string, valor: string) => fireEvent.change(screen.getByLabelText(label), { target: { value: valor } });

function completarDatosMedico() {
  escribir("Nombre", "Carlos");
  escribir("Apellido", "Gómez");
  escribir("DNI", "30123456");
  escribir("Teléfono", "549221456789");
  escribir("Email", "medico@clinica.com");
  escribir("Especialidad", "Cardiología");
  escribir("Matrícula", "mp-12345");
}

describe("RegistroMedicoForm", () => {
  beforeEach(() => {
    vi.mocked(apiFetch).mockReset();
    vi.mocked(apiFetch).mockResolvedValue({});
  });

  it("renderiza el formulario con los campos de médico y el aviso de contraseña inicial", () => {
    renderForm();

    expect(screen.getByLabelText("Nombre")).toBeInTheDocument();
    expect(screen.getByLabelText("Apellido")).toBeInTheDocument();
    expect(screen.getByLabelText("DNI")).toBeInTheDocument();
    expect(screen.getByLabelText("Teléfono")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Especialidad")).toBeInTheDocument();
    expect(screen.getByLabelText("Matrícula")).toBeInTheDocument();
    expect(screen.getByText(/DNI como contraseña inicial/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Registrar médico" })).toBeInTheDocument();
  });

  it("enviar vacío marca los campos obligatorios y no llama a la API", async () => {
    renderForm();

    fireEvent.click(screen.getByRole("button", { name: "Registrar médico" }));

    expect(await screen.findByText("Por favor, ingrese el nombre del médico")).toBeInTheDocument();
    expect(screen.getByText("El DNI debe tener 7 u 8 números")).toBeInTheDocument();
    expect(apiFetch).not.toHaveBeenCalled();
  });

  it("completa los datos, hace POST /medicos y vuelve al listado avisando", async () => {
    renderForm();
    completarDatosMedico();

    fireEvent.click(screen.getByRole("button", { name: "Registrar médico" }));

    expect(await screen.findByText(/pantalla buscar medico/)).toHaveTextContent('{"medicoCreado":true}');
    const [ruta, opciones] = vi.mocked(apiFetch).mock.calls[0];
    expect(ruta).toBe("/medicos");
    expect(opciones?.method).toBe("POST");
    const body = JSON.parse(opciones!.body as string);
    expect(body).toMatchObject({
      nombre: "Carlos",
      apellido: "Gómez",
      dni: "30123456",
      telefono: "549221456789",
      email: "medico@clinica.com",
      especialidad: "Cardiología",
      matricula: "MP-12345", // Comprueba que la función conMayusculas formateó correctamente
    });
  });

  it("la matrícula se escribe en mayúsculas automáticamente", async () => {
    renderForm();
    escribir("Matrícula", "mp-9999");

    expect(screen.getByLabelText("Matrícula")).toHaveValue("MP-9999");
  });

  it("si el back responde 409 (DNI o matrícula repetida) muestra el mensaje y no navega", async () => {
    vi.mocked(apiFetch).mockImplementation(async () => {
      throw new ApiError("El DNI ya se encuentra registrado", 409);
    });
    renderForm();
    completarDatosMedico();

    fireEvent.click(screen.getByRole("button", { name: "Registrar médico" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("El DNI ya se encuentra registrado");
    expect(screen.queryByText(/pantalla buscar medico/)).not.toBeInTheDocument();
  });

  it("si el back responde 400 con detalle por campo lo marca en ese campo", async () => {
    vi.mocked(apiFetch).mockImplementation(async () => {
      throw new ApiError("Datos inválidos", 400, [{ campo: "matricula", mensaje: "Matrícula inválida" }]);
    });
    renderForm();
    completarDatosMedico();

    fireEvent.click(screen.getByRole("button", { name: "Registrar médico" }));

    expect(await screen.findByText("Matrícula inválida")).toBeInTheDocument();
  });
});