import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useEdad } from "./useEdad";

describe("useEdad", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-15T12:00:00"));
  });
  afterEach(() => vi.useRealTimers());

  it("devuelve null si no hay fecha de nacimiento", () => {
    const { result } = renderHook(() => useEdad(""));

    expect(result.current).toBeNull();
  });

  it("calcula la edad cuando ya cumplió años este año", () => {
    const { result } = renderHook(() => useEdad("1990-03-10T12:00:00"));

    expect(result.current).toBe(36);
  });

  it("resta un año si todavía no cumplió este año", () => {
    const { result } = renderHook(() => useEdad("1990-12-25T12:00:00"));

    expect(result.current).toBe(35);
  });

  it("el día del cumpleaños ya cuenta el año nuevo", () => {
    const { result } = renderHook(() => useEdad("1990-06-15T12:00:00"));

    expect(result.current).toBe(36);
  });

  it("un día antes del cumpleaños todavía no lo cuenta", () => {
    const { result } = renderHook(() => useEdad("1990-06-16T12:00:00"));

    expect(result.current).toBe(35);
  });
});
