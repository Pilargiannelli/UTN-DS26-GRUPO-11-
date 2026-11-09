import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthContext, type AuthContextType } from "../context/AuthContextBase";

vi.mock("../hooks/useFetch", () => ({
  useFetch: vi.fn(() => ({ data: [{ id: 1, nombre: "OSDE" }], loading: false, error: null })),
}));
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
import { RegistroPacienteForm } from "./RegistroPacienteForm";

function Destino({ texto }: { texto: string }) {
  return <p>{texto} {JSON.stringify(useLocation().state)}</p>;
}

function renderForm(modo: "secretaria" | "autoregistro", rol = "SECRETARIA") {
  const auth = { tieneRol: (r: string) => r === rol } as unknown as AuthContextType;
  render(
    <AuthContext.Provider value={auth}>
      <MemoryRouter initialEntries={["/formulario"]}>
        <Routes>
          <Route path="/formulario" element={<RegistroPacienteForm modo={modo} />} />
          <Route path="/login" element={<Destino texto="pantalla login" />} />
          <Route path="/buscar-paciente" element={<Destino texto="pantalla buscar paciente" />} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  );
}

const escribir = (label: string, valor: string) => fireEvent.change(screen.getByLabelText(label), { target: { value: valor } });

function completarDatosBasicos() {
  escribir("Nombre", "Ana");
  escribir("Apellido", "Pérez");
  escribir("DNI", "30123456");
  escribir("Email", "ana@imos.test");
  escribir("Teléfono", "5492344555555");
  fireEvent.change(screen.getByLabelText("Fecha de nacimiento"), { target: { value: "1990-03-05" } });
  const [sexo] = screen.getAllByRole("combobox");
  fireEvent.change(sexo, { target: { value: "Femenino" } });
}

function elegirObraSocial(nombre: string) {
  fireEvent.change(screen.getAllByRole("combobox")[1], { target: { value: nombre } });
}

describe("RegistroPacienteForm", () => {
  beforeEach(() => {
    vi.mocked(apiFetch).mockReset();
    vi.mocked(apiFetch).mockResolvedValue({});
  });

  it("modo secretaria: no pide contraseña y avisa que la inicial es el DNI", () => {
    renderForm("secretaria");

    expect(screen.queryByLabelText("Contraseña")).not.toBeInTheDocument();
    expect(screen.getByText(/DNI como contraseña inicial/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Registrar paciente" })).toBeInTheDocument();
  });

  it("modo autoregistro: pide contraseña y repetirla", () => {
    renderForm("autoregistro", "PACIENTE");

    expect(screen.getByLabelText("Contraseña")).toBeInTheDocument();
    expect(screen.getByLabelText("Repetir contraseña")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Crear cuenta" })).toBeInTheDocument();
  });

  it("ofrece las obras sociales del back más 'Sin obra social'", () => {
    renderForm("secretaria");

    const opciones = Array.from((screen.getAllByRole("combobox")[1] as HTMLSelectElement).options).map((o) => o.value);
    expect(opciones).toEqual(["", "Sin obra social", "OSDE"]);
  });

  it("solo la secretaria puede agregar una obra social nueva", () => {
    renderForm("secretaria", "SECRETARIA");
    expect(screen.getByRole("button", { name: /Agregar obra social/ })).toBeInTheDocument();
  });

  it("en el autoregistro no se puede agregar una obra social", () => {
    renderForm("autoregistro", "PACIENTE");

    expect(screen.queryByRole("button", { name: /Agregar obra social/ })).not.toBeInTheDocument();
  });

  it("enviar vacío marca los campos obligatorios y no llama a la API", async () => {
    renderForm("secretaria");

    fireEvent.click(screen.getByRole("button", { name: "Registrar paciente" }));

    expect(await screen.findByText("Por favor, ingrese el nombre del paciente")).toBeInTheDocument();
    expect(screen.getByText("El DNI debe tener 7 u 8 números")).toBeInTheDocument();
    expect(apiFetch).not.toHaveBeenCalled();
  });

  it("'Sin obra social' completa y bloquea número de afiliado y plan", async () => {
    renderForm("secretaria");

    elegirObraSocial("Sin obra social");

    await waitFor(() => expect(screen.getByLabelText("Número de afiliado")).toBeDisabled());
    expect(screen.getByLabelText("Plan")).toBeDisabled();
  });

  it("secretaria sin obra social: POST /pacientes sin cobertura y vuelve al listado avisando", async () => {
    renderForm("secretaria");
    completarDatosBasicos();
    elegirObraSocial("Sin obra social");

    fireEvent.click(screen.getByRole("button", { name: "Registrar paciente" }));

    expect(await screen.findByText(/pantalla buscar paciente/)).toHaveTextContent('{"pacienteCreado":true}');
    const [ruta, opciones] = vi.mocked(apiFetch).mock.calls[0];
    expect(ruta).toBe("/pacientes");
    expect(opciones?.method).toBe("POST");
    const body = JSON.parse(opciones!.body as string);
    expect(body).toMatchObject({
      nombre: "Ana",
      apellido: "Pérez",
      dni: "30123456",
      email: "ana@imos.test",
      telefono: "5492344555555",
      sexo: "Femenino",
      fechaNacimiento: "1990-03-05",
    });
    expect(body).not.toHaveProperty("cobertura");
    expect(body).not.toHaveProperty("password");
  });

  it("con obra social manda la cobertura con el id, el afiliado y el plan en mayúsculas", async () => {
    renderForm("secretaria");
    completarDatosBasicos();
    elegirObraSocial("OSDE");
    await waitFor(() => expect(screen.getByLabelText("Plan")).toBeEnabled());
    escribir("Número de afiliado", "a-123");
    fireEvent.blur(screen.getByLabelText("Número de afiliado"));
    escribir("Plan", "210");
    fireEvent.blur(screen.getByLabelText("Plan"));

    fireEvent.click(screen.getByRole("button", { name: "Registrar paciente" }));

    await waitFor(() => expect(apiFetch).toHaveBeenCalled());
    const body = JSON.parse(vi.mocked(apiFetch).mock.calls[0][1]!.body as string);
    expect(body.cobertura).toEqual({ obraSocialId: 1, nroAfiliado: "A-123", plan: "210" });
  });

  // Regresión: antes, enviar con Enter estando en el campo Plan (sin salir de él) fallaba con
  // "ingrese el plan" aunque estuviera completo
  it("enviar con Enter sin salir del campo Plan funciona igual", async () => {
    renderForm("secretaria");
    completarDatosBasicos();
    elegirObraSocial("OSDE");
    await waitFor(() => expect(screen.getByLabelText("Plan")).toBeEnabled());
    escribir("Número de afiliado", "a-123");
    fireEvent.blur(screen.getByLabelText("Número de afiliado"));
    escribir("Plan", "210"); // sin blur: como apretar Enter con el cursor en el campo

    fireEvent.submit(screen.getByRole("button", { name: "Registrar paciente" }).closest("form")!);

    await waitFor(() => expect(apiFetch).toHaveBeenCalled());
    expect(screen.queryByText("Por favor, ingrese el plan")).not.toBeInTheDocument();
    expect(JSON.parse(vi.mocked(apiFetch).mock.calls[0][1]!.body as string).cobertura).toEqual({ obraSocialId: 1, nroAfiliado: "A-123", plan: "210" });
  });

  it("el número de afiliado se escribe en mayúsculas", async () => {
    renderForm("secretaria");
    elegirObraSocial("OSDE");
    await waitFor(() => expect(screen.getByLabelText("Plan")).toBeEnabled());

    escribir("Número de afiliado", "ab-1");

    expect(screen.getByLabelText("Número de afiliado")).toHaveValue("AB-1");
  });

  it("autoregistro: POST /auth/registro con la contraseña y va al login avisando", async () => {
    renderForm("autoregistro", "PACIENTE");
    completarDatosBasicos();
    elegirObraSocial("Sin obra social");
    escribir("Contraseña", "Clave1234");
    escribir("Repetir contraseña", "Clave1234");

    fireEvent.click(screen.getByRole("button", { name: "Crear cuenta" }));

    expect(await screen.findByText(/pantalla login/)).toHaveTextContent('{"registroExitoso":true}');
    const [ruta, opciones] = vi.mocked(apiFetch).mock.calls[0];
    expect(ruta).toBe("/auth/registro");
    expect(JSON.parse(opciones!.body as string).password).toBe("Clave1234");
  });

  it("autoregistro: contraseñas que no coinciden no se envían", async () => {
    renderForm("autoregistro", "PACIENTE");
    completarDatosBasicos();
    elegirObraSocial("Sin obra social");
    escribir("Contraseña", "Clave1234");
    escribir("Repetir contraseña", "Otra12345");

    fireEvent.click(screen.getByRole("button", { name: "Crear cuenta" }));

    expect(await screen.findByText("Las contraseñas no coinciden")).toBeInTheDocument();
    expect(apiFetch).not.toHaveBeenCalled();
  });

  it("autoregistro: una contraseña débil muestra qué regla falta", async () => {
    renderForm("autoregistro", "PACIENTE");
    completarDatosBasicos();
    elegirObraSocial("Sin obra social");
    escribir("Contraseña", "corta");
    escribir("Repetir contraseña", "corta");

    fireEvent.click(screen.getByRole("button", { name: "Crear cuenta" }));

    expect(await screen.findByText("La contraseña debe tener al menos 8 caracteres")).toBeInTheDocument();
    expect(apiFetch).not.toHaveBeenCalled();
  });

  it("si el back responde 409 (DNI repetido) muestra el mensaje y no navega", async () => {
    vi.mocked(apiFetch).mockImplementation(async () => {
      throw new ApiError("El DNI ya se encuentra registrado", 409);
    });
    renderForm("secretaria");
    completarDatosBasicos();
    elegirObraSocial("Sin obra social");

    fireEvent.click(screen.getByRole("button", { name: "Registrar paciente" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("El DNI ya se encuentra registrado");
    expect(screen.queryByText(/pantalla buscar paciente/)).not.toBeInTheDocument();
  });

  it("si el back responde 400 con detalle por campo lo marca en ese campo", async () => {
    vi.mocked(apiFetch).mockImplementation(async () => {
      throw new ApiError("Datos inválidos", 400, [{ campo: "dni", mensaje: "DNI inválido para el back" }]);
    });
    renderForm("secretaria");
    completarDatosBasicos();
    elegirObraSocial("Sin obra social");

    fireEvent.click(screen.getByRole("button", { name: "Registrar paciente" }));

    expect(await screen.findByText("DNI inválido para el back")).toBeInTheDocument();
  });
});
