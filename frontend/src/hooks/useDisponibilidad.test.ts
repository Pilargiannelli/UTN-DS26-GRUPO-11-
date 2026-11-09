import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";

vi.mock("../services/api", () => ({ apiFetch: vi.fn() }));

import { apiFetch } from "../services/api";
import { useDisponibilidad } from "./useDisponibilidad";
import { claveFecha } from "../utils/horarios";

const lunes = new Date(2099, 0, 5);
const martes = new Date(2099, 0, 6);

describe("useDisponibilidad", () => {
  beforeEach(() => {
    vi.mocked(apiFetch).mockReset();
  });

  it("sin médico elegido no pide nada y no queda cargando", () => {
    const { result } = renderHook(() => useDisponibilidad("", [lunes]));

    expect(result.current.cargando).toBe(false);
    expect(result.current.ocupadosPorDia).toEqual({});
    expect(apiFetch).not.toHaveBeenCalled();
  });

  it("sin días tampoco pide nada", () => {
    const { result } = renderHook(() => useDisponibilidad("3", []));

    expect(result.current.cargando).toBe(false);
    expect(apiFetch).not.toHaveBeenCalled();
  });

  it("agrupa los horarios ocupados por día", async () => {
    vi.mocked(apiFetch).mockResolvedValue([
      new Date(2099, 0, 5, 10, 0).toISOString(),
      new Date(2099, 0, 5, 11, 30).toISOString(),
      new Date(2099, 0, 6, 9, 0).toISOString(),
    ]);

    const { result } = renderHook(() => useDisponibilidad("3", [lunes, martes]));
    expect(result.current.cargando).toBe(true);

    await waitFor(() => expect(result.current.cargando).toBe(false));
    expect([...result.current.ocupadosPorDia[claveFecha(lunes)]].sort()).toEqual(["10:00", "11:30"]);
    expect([...result.current.ocupadosPorDia[claveFecha(martes)]]).toEqual(["09:00"]);
  });

  it("pide un solo rango que va del primer día hasta el día siguiente al último", async () => {
    vi.mocked(apiFetch).mockResolvedValue([]);

    renderHook(() => useDisponibilidad("3", [lunes, martes]));

    await waitFor(() => expect(apiFetch).toHaveBeenCalledTimes(1));
    const ruta = vi.mocked(apiFetch).mock.calls[0][0];
    const query = new URLSearchParams(ruta.split("?")[1]);
    expect(ruta.startsWith("/turnos/ocupados?")).toBe(true);
    expect(query.get("medicoId")).toBe("3");
    expect(query.get("desde")).toBe(lunes.toISOString());
    expect(new Date(query.get("hasta")!).getTime()).toBe(new Date(2099, 0, 7).getTime());
  });

  it("si la API falla no bloquea ningún horario (el back igual rechaza con 409)", async () => {
    vi.mocked(apiFetch).mockImplementation(async () => {
      throw new Error("500");
    });

    const { result } = renderHook(() => useDisponibilidad("3", [lunes]));

    await waitFor(() => expect(result.current.cargando).toBe(false));
    expect(result.current.ocupadosPorDia).toEqual({});
  });

  it("cambiar el valor de recargar vuelve a pedir los horarios", async () => {
    vi.mocked(apiFetch).mockResolvedValue([]);
    const { rerender } = renderHook(({ n }) => useDisponibilidad("3", [lunes], n), { initialProps: { n: 0 } });
    await waitFor(() => expect(apiFetch).toHaveBeenCalledTimes(1));

    rerender({ n: 1 });

    await waitFor(() => expect(apiFetch).toHaveBeenCalledTimes(2));
  });
});
