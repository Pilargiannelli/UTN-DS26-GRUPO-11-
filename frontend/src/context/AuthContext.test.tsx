import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";

vi.mock("../services/api", () => ({ apiFetch: vi.fn() }));

import { apiFetch } from "../services/api";
import { AuthProvider } from "./AuthContext";
import { useAuth } from "../hooks/useAuth";

const paciente = { id: 1, nombre: "Ana", rol: "PACIENTE" };

// Componente de prueba que expone el contexto como texto y botones
function Sonda() {
  const auth = useAuth();
  return (
    <div>
      <span data-testid="cargando">{String(auth.cargando)}</span>
      <span data-testid="rol">{auth.rol ?? "sin-rol"}</span>
      <span data-testid="auth">{String(auth.estaAutenticado)}</span>
      <span data-testid="es-paciente">{String(auth.tieneRol("PACIENTE"))}</span>
      <button onClick={() => auth.login({ token: "tok", usuario: paciente } as never)}>login</button>
      <button onClick={() => auth.logout()}>logout</button>
    </div>
  );
}

function renderProvider() {
  return render(
    <AuthProvider>
      <Sonda />
    </AuthProvider>
  );
}

describe("AuthProvider", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.mocked(apiFetch).mockClear();
  });

  it("sin token termina de cargar sin usuario y sin llamar a la API", async () => {
    renderProvider();

    await waitFor(() => expect(screen.getByTestId("cargando")).toHaveTextContent("false"));
    expect(screen.getByTestId("rol")).toHaveTextContent("sin-rol");
    expect(screen.getByTestId("auth")).toHaveTextContent("false");
    expect(apiFetch).not.toHaveBeenCalled();
  });

  it("con token guardado rehidrata la sesión pidiendo /auth/yo", async () => {
    localStorage.setItem("token", "tok");
    vi.mocked(apiFetch).mockResolvedValue(paciente);

    renderProvider();

    await waitFor(() => expect(screen.getByTestId("rol")).toHaveTextContent("PACIENTE"));
    expect(apiFetch).toHaveBeenCalledWith("/auth/yo");
    expect(screen.getByTestId("auth")).toHaveTextContent("true");
    expect(screen.getByTestId("cargando")).toHaveTextContent("false");
  });

  it("si /auth/yo falla (token vencido) cierra la sesión y borra el token", async () => {
    localStorage.setItem("token", "vencido");
    vi.mocked(apiFetch).mockRejectedValue(new Error("401"));

    renderProvider();

    await waitFor(() => expect(screen.getByTestId("cargando")).toHaveTextContent("false"));
    expect(localStorage.getItem("token")).toBeNull();
    expect(screen.getByTestId("auth")).toHaveTextContent("false");
  });

  it("login guarda el token y el usuario; logout borra ambos", async () => {
    renderProvider();
    await waitFor(() => expect(screen.getByTestId("cargando")).toHaveTextContent("false"));

    act(() => screen.getByText("login").click());
    expect(localStorage.getItem("token")).toBe("tok");
    expect(JSON.parse(localStorage.getItem("usuario")!)).toEqual(paciente);
    expect(screen.getByTestId("es-paciente")).toHaveTextContent("true");

    act(() => screen.getByText("logout").click());
    expect(localStorage.getItem("token")).toBeNull();
    expect(localStorage.getItem("usuario")).toBeNull();
    expect(screen.getByTestId("auth")).toHaveTextContent("false");
  });

  it("el evento 'sesion-expirada' de la capa de API cierra la sesión", async () => {
    localStorage.setItem("token", "tok");
    vi.mocked(apiFetch).mockResolvedValue(paciente);
    renderProvider();
    await waitFor(() => expect(screen.getByTestId("auth")).toHaveTextContent("true"));

    act(() => {
      window.dispatchEvent(new Event("sesion-expirada"));
    });

    expect(screen.getByTestId("auth")).toHaveTextContent("false");
    expect(localStorage.getItem("token")).toBeNull();
  });
});
