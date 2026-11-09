import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";

vi.mock("../services/api", () => ({ apiFetch: vi.fn() }));

import { apiFetch } from "../services/api";
import { useHistoriaClinica } from "./useHistoriaClinica";

const historia = (alergias: string[] = []) => ({
  paciente: { id: 4, nombre: "Ana", apellido: "Pérez", dni: "1" },
  medicoResponsable: null,
  alergias,
  antecedentes: [],
  entradas: [],
});

describe("useHistoriaClinica", () => {
  beforeEach(() => {
    vi.mocked(apiFetch).mockReset();
  });

  it("sin paciente no pide nada ni queda cargando", () => {
    const { result } = renderHook(() => useHistoriaClinica(null));

    expect(result.current.loading).toBe(false);
    expect(result.current.historia).toBeNull();
    expect(apiFetch).not.toHaveBeenCalled();
  });

  it("pide la historia del paciente y la entrega al terminar de cargar", async () => {
    vi.mocked(apiFetch).mockResolvedValue(historia(["Polen"]));

    const { result } = renderHook(() => useHistoriaClinica(4));
    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(apiFetch).toHaveBeenCalledWith("/pacientes/4/historia-clinica");
    expect(result.current.historia?.alergias).toEqual(["Polen"]);
    expect(result.current.error).toBeNull();
  });

  it("si la API falla deja la historia en null y expone el mensaje del error", async () => {
    vi.mocked(apiFetch).mockImplementation(async () => {
      throw new Error("Paciente no encontrado");
    });

    const { result } = renderHook(() => useHistoriaClinica(4));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.historia).toBeNull();
    const mensaje = result.current.error?.message;
    expect(mensaje).toBe("Paciente no encontrado");
  });

  it("agregarEntrada hace POST y reemplaza la historia con la respuesta", async () => {
    vi.mocked(apiFetch).mockResolvedValueOnce(historia());
    const { result } = renderHook(() => useHistoriaClinica(4));
    await waitFor(() => expect(result.current.loading).toBe(false));

    vi.mocked(apiFetch).mockResolvedValueOnce(historia(["Actualizada"]));
    const datos = { diagnostico: "Gripe", evolucion: "Mejora", observaciones: "" };
    await act(async () => {
      await result.current.agregarEntrada(datos);
    });

    const [ruta, opciones] = vi.mocked(apiFetch).mock.calls[1];
    expect(ruta).toBe("/pacientes/4/historia-clinica/entradas");
    expect(opciones?.method).toBe("POST");
    expect(JSON.parse(opciones!.body as string)).toEqual(datos);
    expect(result.current.historia?.alergias).toEqual(["Actualizada"]);
  });

  it("actualizarListas hace PUT con alergias y antecedentes", async () => {
    vi.mocked(apiFetch).mockResolvedValueOnce(historia());
    const { result } = renderHook(() => useHistoriaClinica(4));
    await waitFor(() => expect(result.current.loading).toBe(false));

    vi.mocked(apiFetch).mockResolvedValueOnce(historia(["Polen"]));
    await act(async () => {
      await result.current.actualizarListas({ alergias: ["Polen"], antecedentes: ["Asma"] });
    });

    const [ruta, opciones] = vi.mocked(apiFetch).mock.calls[1];
    expect(ruta).toBe("/pacientes/4/historia-clinica");
    expect(opciones?.method).toBe("PUT");
    expect(JSON.parse(opciones!.body as string)).toEqual({ alergias: ["Polen"], antecedentes: ["Asma"] });
    expect(result.current.historia?.alergias).toEqual(["Polen"]);
  });

  it("agregarEntrada sin paciente no hace ningún pedido", async () => {
    const { result } = renderHook(() => useHistoriaClinica(null));

    await act(async () => {
      await result.current.agregarEntrada({ diagnostico: "x", evolucion: "y", observaciones: "" });
    });

    expect(apiFetch).not.toHaveBeenCalled();
  });
});
