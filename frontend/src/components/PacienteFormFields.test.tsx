import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AuthContext, type AuthContextType } from "../context/AuthContextBase";

vi.mock("../hooks/useFetch", () => ({
  useFetch: vi.fn(() => ({ data: [{ id: 1, nombre: "OSDE" }, { id: 2, nombre: "Swiss Medical" }], loading: false, error: null })),
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
import { PacienteFormFields } from "./PacienteFormFields";

const usuario = (cobertura?: unknown) =>
  ({
    id: 3,
    nombre: "Ana",
    apellido: "Pérez",
    dni: "30111222",
    email: "ana@imos.test",
    paciente: {
      id: 9,
      telefono: "5492344555555",
      sexo: "Femenino",
      fechaNacimiento: "1990-03-05T00:00:00.000Z",
      coberturas: cobertura ? [cobertura] : [],
    },
  }) as never;

const conOSDE = { nroAfiliado: "A-1", plan: "210", obraSocial: { id: 1, nombre: "OSDE" } };

function renderForm(u = usuario(), rol = "MEDICO") {
  const onSave = vi.fn();
  const onCancel = vi.fn();
  const auth = { tieneRol: (r: string) => r === rol } as unknown as AuthContextType;
  render(
    <AuthContext.Provider value={auth}>
      <PacienteFormFields usuario={u} onSave={onSave} onCancel={onCancel} />
    </AuthContext.Provider>
  );
  return { onSave, onCancel };
}

const guardar = () => screen.getByRole("button", { name: /Guardar cambios/ });
const cambiar = (label: string, valor: string) => fireEvent.change(screen.getByLabelText(label), { target: { value: valor } });

describe("PacienteFormFields (editar paciente)", () => {
  beforeEach(() => {
    vi.mocked(apiFetch).mockReset();
  });

  it("precarga los datos del paciente y deja Guardar deshabilitado", () => {
    renderForm();

    expect(screen.getByLabelText("Nombre")).toHaveValue("Ana");
    expect(screen.getByLabelText("Apellido")).toHaveValue("Pérez");
    expect(screen.getByLabelText("DNI")).toHaveValue("30111222");
    expect(screen.getByLabelText("Email")).toHaveValue("ana@imos.test");
    expect(screen.getByLabelText("Teléfono")).toHaveValue("5492344555555");
    expect(guardar()).toBeDisabled();
  });

  it("sin cobertura arranca en 'Sin obra social' con afiliado y plan bloqueados", () => {
    renderForm();

    expect(screen.getAllByRole("combobox")[1]).toHaveValue("Sin obra social");
    expect(screen.getByLabelText("Nro. afiliado")).toBeDisabled();
    expect(screen.getByLabelText("Plan")).toBeDisabled();
  });

  it("con cobertura precarga obra social, afiliado y plan editables", () => {
    renderForm(usuario(conOSDE));

    expect(screen.getAllByRole("combobox")[1]).toHaveValue("OSDE");
    expect(screen.getByLabelText("Nro. afiliado")).toHaveValue("A-1");
    expect(screen.getByLabelText("Plan")).toHaveValue("210");
    expect(screen.getByLabelText("Plan")).toBeEnabled();
  });

  it("cambiar algo habilita Guardar y muestra Descartar", async () => {
    renderForm();

    cambiar("Nombre", "Anita");

    await waitFor(() => expect(guardar()).toBeEnabled());
    expect(screen.getByRole("button", { name: "Descartar cambios" })).toBeInTheDocument();
  });

  it("Descartar cambios avisa al padre", async () => {
    const { onCancel } = renderForm();
    cambiar("Nombre", "Anita");

    fireEvent.click(await screen.findByRole("button", { name: "Descartar cambios" }));

    expect(onCancel).toHaveBeenCalled();
  });

  it("un DNI inválido marca el error y no llama a la API", async () => {
    renderForm();
    cambiar("DNI", "12");

    fireEvent.click(await waitFor(() => { expect(guardar()).toBeEnabled(); return guardar(); }));

    expect(await screen.findByText("El DNI debe tener 7 u 8 números")).toBeInTheDocument();
    expect(apiFetch).not.toHaveBeenCalled();
  });

  it("guardar hace PUT /pacientes/:id con los datos y avisa con el usuario actualizado", async () => {
    vi.mocked(apiFetch).mockResolvedValue({
      id: 9,
      telefono: "5492344555555",
      sexo: "Femenino",
      fechaNacimiento: "1990-03-05T00:00:00.000Z",
      coberturas: [],
      usuario: { id: 3, username: "ana", nombre: "Anita", apellido: "Pérez", email: "ana@imos.test", dni: "30111222" },
    });
    const { onSave } = renderForm();
    cambiar("Nombre", "Anita");

    fireEvent.click(await waitFor(() => { expect(guardar()).toBeEnabled(); return guardar(); }));

    await waitFor(() => expect(onSave).toHaveBeenCalled());
    const [ruta, opciones] = vi.mocked(apiFetch).mock.calls[0];
    expect(ruta).toBe("/pacientes/9");
    expect(opciones?.method).toBe("PUT");
    const body = JSON.parse(opciones!.body as string);
    expect(body).toMatchObject({ nombre: "Anita", dni: "30111222", sexo: "Femenino", fechaNacimiento: "1990-03-05" });
    expect(body).not.toHaveProperty("cobertura");
    expect(onSave.mock.calls[0][0].nombre).toBe("Anita");
  });

  it("con obra social envía la cobertura con el id de la obra social", async () => {
    vi.mocked(apiFetch).mockResolvedValue({ id: 9, coberturas: [], usuario: {} });
    renderForm(usuario(conOSDE));
    cambiar("Plan", "310");

    fireEvent.click(await waitFor(() => { expect(guardar()).toBeEnabled(); return guardar(); }));

    await waitFor(() => expect(apiFetch).toHaveBeenCalled());
    const body = JSON.parse(vi.mocked(apiFetch).mock.calls[0][1]!.body as string);
    expect(body.cobertura).toEqual({ obraSocialId: 1, nroAfiliado: "A-1", plan: "310" });
  });

  // Regresión: antes, handleMayus pisaba el onChange del formulario y editar solo el plan o el
  // afiliado no marcaba cambios, así que Guardar quedaba deshabilitado
  it("editar solo el plan (o solo el afiliado) habilita Guardar, y lo guarda en mayúsculas", async () => {
    vi.mocked(apiFetch).mockResolvedValue({ id: 9, coberturas: [], usuario: {} });
    renderForm(usuario(conOSDE));
    expect(guardar()).toBeDisabled();

    cambiar("Nro. afiliado", "ab-77");

    await waitFor(() => expect(guardar()).toBeEnabled());
    expect(screen.getByLabelText("Nro. afiliado")).toHaveValue("AB-77");
    fireEvent.click(guardar());
    await waitFor(() => expect(apiFetch).toHaveBeenCalled());
    expect(JSON.parse(vi.mocked(apiFetch).mock.calls[0][1]!.body as string).cobertura.nroAfiliado).toBe("AB-77");
  });

  it("un error del back por campo se marca en ese campo y arriba figura el mensaje", async () => {
    vi.mocked(apiFetch).mockImplementation(async () => {
      throw new ApiError("Datos inválidos", 400, [{ campo: "email", mensaje: "El email ya se encuentra registrado" }]);
    });
    const { onSave } = renderForm();
    cambiar("Nombre", "Anita");

    fireEvent.click(await waitFor(() => { expect(guardar()).toBeEnabled(); return guardar(); }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Datos inválidos");
    expect(screen.getByText("El email ya se encuentra registrado")).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
  });

  it("solo la secretaria puede agregar una obra social nueva", () => {
    renderForm(usuario(), "SECRETARIA");
    expect(screen.getByRole("button", { name: /Agregar obra social/ })).toBeInTheDocument();
  });

  it("el médico no ve el botón de agregar obra social", () => {
    renderForm(usuario(), "MEDICO");

    expect(screen.queryByRole("button", { name: /Agregar obra social/ })).not.toBeInTheDocument();
  });
});
