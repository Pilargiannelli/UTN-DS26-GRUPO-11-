import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";

vi.mock("../services/api", () => ({ apiFetch: vi.fn() }));

import { apiFetch } from "../services/api";
import { useFetch } from "./useFetch";

describe("useFetch", () => {
  beforeEach(() => {
    vi.mocked(apiFetch).mockClear();
  });

  it("arranca cargando y al resolver entrega los datos", async () => {
    vi.mocked(apiFetch).mockResolvedValue([{ id: 1 }]);

    const { result } = renderHook(() => useFetch<{ id: number }[]>("/medicos"));
    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toEqual([{ id: 1 }]);
    expect(result.current.error).toBeNull();
    expect(apiFetch).toHaveBeenCalledWith("/medicos");
  });

  it("si la API falla guarda el error y deja data en null", async () => {
    vi.mocked(apiFetch).mockImplementation(async () => {
      throw new Error("500");
    });

    const { result } = renderHook(() => useFetch("/medicos"));

    await waitFor(() => expect(result.current.loading).toBe(false));
    const mensaje = result.current.error?.message;
    expect(mensaje).toBe("500");
    expect(result.current.data).toBeNull();
  });
});
