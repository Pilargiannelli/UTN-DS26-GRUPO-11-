import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { AuthContext, type AuthContextType } from "../context/AuthContextBase";

vi.mock("../services/api", () => ({ apiFetch: vi.fn() }));

import { apiFetch } from "../services/api";
import Login from "./Login";

function renderLogin({ autenticado = false, ruta = "/login" } = {}) {
  const login = vi.fn();
  const auth = { estaAutenticado: autenticado, login, usuario: null, rol: null, cargando: false } as unknown as AuthContextType;

  render(
    <AuthContext.Provider value={auth}>
      <MemoryRouter initialEntries={[ruta]}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/home" element={<p>pantalla home</p>} />
          <Route path="/crear-cuenta" element={<p>pantalla crear cuenta</p>} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  );
  return { login };
}

function completar(email: string, password: string) {
  fireEvent.change(screen.getByLabelText("Email"), { target: { value: email } });
  fireEvent.change(screen.getByLabelText("Contraseña"), { target: { value: password } });
  fireEvent.click(screen.getByRole("button", { name: "Ingresar" }));
}

describe("Login", () => {
  beforeEach(() => {
    vi.mocked(apiFetch).mockClear();
  });

  it("muestra el formulario con email, contraseña y el link para crear cuenta", () => {
    renderLogin();

    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Contraseña")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Ingresar" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Crear cuenta" })).toHaveAttribute("href", "/crear-cuenta");
  });

  it("un usuario ya autenticado es redirigido a /home", () => {
    renderLogin({ autenticado: true });

    expect(screen.getByText("pantalla home")).toBeInTheDocument();
    expect(screen.queryByLabelText("Email")).not.toBeInTheDocument();
  });

  it("con ?expired=true avisa que la sesión expiró", () => {
    renderLogin({ ruta: "/login?expired=true" });

    expect(screen.getByRole("status")).toHaveTextContent("Tu sesión expiró");
  });

  it("sin ?expired no muestra ese aviso", () => {
    renderLogin();

    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("con un email mal formado muestra el error y no llama a la API", async () => {
    renderLogin();

    completar("no-es-un-mail", "Clave1234");

    expect(await screen.findByText("El email no es válido")).toBeInTheDocument();
    expect(apiFetch).not.toHaveBeenCalled();
  });

  it("con la contraseña vacía pide la contraseña y no llama a la API", async () => {
    renderLogin();

    completar("ana@imos.test", "");

    expect(await screen.findByText("La contraseña es obligatoria")).toBeInTheDocument();
    expect(apiFetch).not.toHaveBeenCalled();
  });

  it("con datos válidos hace POST /auth/login y guarda la sesión", async () => {
    const sesion = { token: "tok", usuario: { id: 1, rol: "PACIENTE" } };
    vi.mocked(apiFetch).mockResolvedValue(sesion);
    const { login } = renderLogin();

    completar("ana@imos.test", "Clave1234");

    await waitFor(() => expect(login).toHaveBeenCalledWith(sesion));
    const [ruta, opciones] = vi.mocked(apiFetch).mock.calls[0];
    expect(ruta).toBe("/auth/login");
    expect(opciones?.method).toBe("POST");
    expect(JSON.parse(opciones!.body as string)).toEqual({ email: "ana@imos.test", password: "Clave1234" });
    expect(await screen.findByRole("button", { name: "Autenticado" })).toBeDisabled();
  });

  it("si la API rechaza las credenciales muestra el mensaje y permite reintentar", async () => {
    vi.mocked(apiFetch).mockImplementation(async () => {
      throw new Error("Email o contraseña incorrectos");
    });
    const { login } = renderLogin();

    completar("ana@imos.test", "Mala1234");

    expect(await screen.findByRole("alert")).toHaveTextContent("Email o contraseña incorrectos");
    expect(login).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Ingresar" })).toBeEnabled();
  });

  it("el ojito alterna entre mostrar y ocultar la contraseña", () => {
    renderLogin();
    const campo = screen.getByLabelText("Contraseña");
    expect(campo).toHaveAttribute("type", "password");

    fireEvent.click(screen.getByRole("button", { name: "Mostrar contraseña" }));
    expect(campo).toHaveAttribute("type", "text");

    fireEvent.click(screen.getByRole("button", { name: "Ocultar contraseña" }));
    expect(campo).toHaveAttribute("type", "password");
  });
});
