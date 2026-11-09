import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import type { ReactNode } from "react";
import { MemoryRouter } from "react-router-dom";
import { AuthContext, type AuthContextType } from "../context/AuthContextBase";

const navigate = vi.fn();
vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-router-dom")>()),
  useNavigate: () => navigate,
}));

import { useLogout } from "./useLogout";

describe("useLogout", () => {
  const setUsuario = vi.fn();
  const wrapper = ({ children }: { children: ReactNode }) => (
    <AuthContext.Provider value={{ setUsuario } as unknown as AuthContextType}>
      <MemoryRouter>{children}</MemoryRouter>
    </AuthContext.Provider>
  );

  beforeEach(() => {
    vi.useFakeTimers();
    navigate.mockClear();
    setUsuario.mockClear();
    localStorage.setItem("token", "abc");
  });
  afterEach(() => {
    vi.useRealTimers();
    localStorage.clear();
  });

  it("no hace nada hasta que pasan 500 ms (da tiempo a mostrar la despedida)", () => {
    const { result } = renderHook(() => useLogout(), { wrapper });

    act(() => result.current.logout());
    act(() => vi.advanceTimersByTime(499));

    expect(localStorage.getItem("token")).toBe("abc");
    expect(setUsuario).not.toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();
  });

  it("a los 500 ms borra el token, limpia el usuario y vuelve a la landing", () => {
    const { result } = renderHook(() => useLogout(), { wrapper });

    act(() => result.current.logout());
    act(() => vi.advanceTimersByTime(500));

    expect(localStorage.getItem("token")).toBeNull();
    expect(setUsuario).toHaveBeenCalledWith(null);
    expect(navigate).toHaveBeenCalledWith("/");
  });
});
