import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import type { ReactNode } from "react";
import { AuthContext, type AuthContextType } from "../context/AuthContextBase";
import { useAuth } from "./useAuth";
import { useRolView } from "./useRolView";
import { usePerfilRolView } from "./usePerfilRolView";
import { useDateInput } from "./useDateInput";
import { stringToDateInput, dateInputToString } from "./useDateTransform";
import { useMayus } from "./useMayus";
import { useUsuarioSeleccionado } from "./useUsuarioSeleccionado";
import { useToast } from "./useToast";

function authCon(rol: string | null): AuthContextType {
  return { rol, usuario: null, cargando: false, estaAutenticado: !!rol } as unknown as AuthContextType;
}

const conAuth = (rol: string | null) => ({ children }: { children: ReactNode }) => (
  <AuthContext.Provider value={authCon(rol)}>{children}</AuthContext.Provider>
);

describe("useAuth", () => {
  it("fuera de un AuthProvider tira un error claro", () => {
    expect(() => renderHook(() => useAuth())).toThrow("useAuth debe usarse dentro de AuthProvider");
  });

  it("dentro de un provider devuelve el contexto", () => {
    const { result } = renderHook(() => useAuth(), { wrapper: conAuth("MEDICO") });

    expect(result.current.rol).toBe("MEDICO");
  });
});

describe("useRolView", () => {
  const vistas = { MEDICO: "vista médico", PACIENTE: "vista paciente" };

  it("devuelve la vista que corresponde al rol", () => {
    const { result } = renderHook(() => useRolView(vistas), { wrapper: conAuth("PACIENTE") });

    expect(result.current).toBe("vista paciente");
  });

  it("devuelve null si el rol no tiene vista", () => {
    const { result } = renderHook(() => useRolView(vistas), { wrapper: conAuth("SECRETARIA") });

    expect(result.current).toBeNull();
  });

  it("devuelve null sin sesión", () => {
    const { result } = renderHook(() => useRolView(vistas), { wrapper: conAuth(null) });

    expect(result.current).toBeNull();
  });
});

describe("usePerfilRolView", () => {
  const vistas = { SECRETARIA: { PACIENTE: "secretaria ve paciente" }, MEDICO: { PACIENTE: "médico ve paciente" } };
  const perfilPaciente = { rol: "PACIENTE" } as never;

  it("combina el rol de quien mira con el rol del perfil mirado", () => {
    const { result } = renderHook(() => usePerfilRolView(perfilPaciente, vistas), { wrapper: conAuth("MEDICO") });

    expect(result.current).toBe("médico ve paciente");
  });

  it("devuelve null si falta el perfil, las vistas o la sesión", () => {
    expect(renderHook(() => usePerfilRolView(undefined, vistas), { wrapper: conAuth("MEDICO") }).result.current).toBeNull();
    expect(renderHook(() => usePerfilRolView(perfilPaciente, undefined), { wrapper: conAuth("MEDICO") }).result.current).toBeNull();
    expect(renderHook(() => usePerfilRolView(perfilPaciente, vistas), { wrapper: conAuth(null) }).result.current).toBeNull();
  });

  it("devuelve null si el rol que mira no tiene vista definida", () => {
    const { result } = renderHook(() => usePerfilRolView(perfilPaciente, vistas), { wrapper: conAuth("PACIENTE") });

    expect(result.current).toBeNull();
  });
});

describe("useDateInput", () => {
  const evento = (value: string) => ({ target: { value } }) as unknown as React.ChangeEvent<HTMLInputElement> & React.FocusEvent<HTMLInputElement>;

  it("onChange saca todo lo que no sea dígito", () => {
    const { result } = renderHook(() => useDateInput(2));
    const e = evento("1a/2 b");

    result.current.onChange(e);

    expect(e.target.value).toBe("12");
  });

  it("onBlur rellena con ceros a la izquierda hasta el largo máximo", () => {
    const { result } = renderHook(() => useDateInput(4));
    const e = evento("7");

    result.current.onBlur(e);

    expect(e.target.value).toBe("0007");
  });

  it("onBlur no toca un campo vacío", () => {
    const { result } = renderHook(() => useDateInput(2));
    const e = evento("");

    result.current.onBlur(e);

    expect(e.target.value).toBe("");
  });
});

describe("useDateTransform", () => {
  it("stringToDateInput separa YYYY-MM-DD en día, mes y año", () => {
    expect(stringToDateInput("1990-03-05")).toEqual({ day: "05", month: "03", year: "1990" });
  });

  it("dateInputToString lo vuelve a juntar", () => {
    expect(dateInputToString({ day: "05", month: "03", year: "1990" })).toBe("1990-03-05");
  });

  it("ida y vuelta devuelve la misma fecha", () => {
    expect(dateInputToString(stringToDateInput("2026-12-31"))).toBe("2026-12-31");
  });
});

describe("useMayus", () => {
  it("pasa a mayúsculas lo que se escribe en el input", () => {
    const { result } = renderHook(() => useMayus());
    const e = { target: { value: "ana pérez" } } as unknown as React.ChangeEvent<HTMLInputElement>;

    result.current(e);

    expect(e.target.value).toBe("ANA PÉREZ");
  });
});

describe("useUsuarioSeleccionado", () => {
  beforeEach(() => localStorage.clear());

  it("arranca sin usuario si no hay nada guardado", () => {
    const { result } = renderHook(() => useUsuarioSeleccionado());

    expect(result.current.usuarioSeleccionado).toBeUndefined();
  });

  it("recupera el usuario guardado en localStorage", () => {
    localStorage.setItem("usuarioSeleccionado", JSON.stringify({ id: 3 }));

    const { result } = renderHook(() => useUsuarioSeleccionado());

    expect(result.current.usuarioSeleccionado).toEqual({ id: 3 });
  });

  it("si lo guardado está corrupto no rompe y arranca sin usuario", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    localStorage.setItem("usuarioSeleccionado", "{no-es-json");

    const { result } = renderHook(() => useUsuarioSeleccionado());

    expect(result.current.usuarioSeleccionado).toBeUndefined();
    vi.restoreAllMocks();
  });

  it("seleccionarUsuario lo guarda y limpiarUsuario lo borra", () => {
    const { result } = renderHook(() => useUsuarioSeleccionado());

    act(() => result.current.seleccionarUsuario({ id: 9 } as never));
    expect(result.current.usuarioSeleccionado).toEqual({ id: 9 });
    expect(JSON.parse(localStorage.getItem("usuarioSeleccionado")!)).toEqual({ id: 9 });

    act(() => result.current.limpiarUsuario());
    expect(result.current.usuarioSeleccionado).toBeUndefined();
    expect(localStorage.getItem("usuarioSeleccionado")).toBeNull();
  });
});

describe("useToast", () => {
  const wrapperConEstado = (state: unknown) => ({ children }: { children: ReactNode }) => (
    <MemoryRouter initialEntries={[{ pathname: "/login", state }]}>{children}</MemoryRouter>
  );

  it("con el estado de navegación correspondiente muestra el toast", async () => {
    const { result } = renderHook(() => useToast(), { wrapper: wrapperConEstado({ registroExitoso: true }) });

    await waitFor(() => expect(result.current.showToast).toBe(true));
  });

  it("sin estado de navegación no muestra nada", async () => {
    const { result } = renderHook(() => useToast(), { wrapper: wrapperConEstado(undefined) });

    await new Promise((r) => setTimeout(r, 20));

    expect(result.current.showToast).toBe(false);
  });

  it("acepta una clave distinta", async () => {
    const { result } = renderHook(() => useToast("otraClave"), { wrapper: wrapperConEstado({ otraClave: true }) });

    await waitFor(() => expect(result.current.showToast).toBe(true));
  });

  it("una clave que no coincide no lo activa", async () => {
    const { result } = renderHook(() => useToast("otraClave"), { wrapper: wrapperConEstado({ registroExitoso: true }) });

    await new Promise((r) => setTimeout(r, 20));

    expect(result.current.showToast).toBe(false);
  });
});
