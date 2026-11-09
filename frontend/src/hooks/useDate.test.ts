import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useDate } from "./useDate";

// Arma un <form> real con tres inputs día/mes/año, como el DateInput
function armarForm(valores: { day: string; month: string; year: string }) {
  const form = document.createElement("form");
  const inputs = {} as Record<"day" | "month" | "year", HTMLInputElement>;
  for (const campo of ["day", "month", "year"] as const) {
    const input = document.createElement("input");
    input.name = `fecha.${campo}`;
    input.value = valores[campo];
    form.appendChild(input);
    inputs[campo] = input;
  }
  return inputs;
}

const evento = (input: HTMLInputElement) => ({ target: input }) as never;

describe("useDate", () => {
  describe("handleDayChange", () => {
    it("recorta el día al máximo del mes (31 de abril -> 30)", () => {
      const f = armarForm({ day: "31", month: "4", year: "2026" });
      const { result } = renderHook(() => useDate("fecha"));

      result.current.handleDayChange(evento(f.day));

      expect(f.day.value).toBe("30");
    });

    it("febrero tiene 29 días en año bisiesto y 28 si no", () => {
      const bisiesto = armarForm({ day: "30", month: "2", year: "2024" });
      const comun = armarForm({ day: "30", month: "2", year: "2026" });
      const { result } = renderHook(() => useDate("fecha"));

      result.current.handleDayChange(evento(bisiesto.day));
      result.current.handleDayChange(evento(comun.day));

      expect(bisiesto.day.value).toBe("29");
      expect(comun.day.value).toBe("28");
    });

    it("el año 1900 no es bisiesto pero el 2000 sí", () => {
      const a = armarForm({ day: "29", month: "2", year: "1900" });
      const b = armarForm({ day: "29", month: "2", year: "2000" });
      const { result } = renderHook(() => useDate("fecha"));

      result.current.handleDayChange(evento(a.day));
      result.current.handleDayChange(evento(b.day));

      expect(a.day.value).toBe("28");
      expect(b.day.value).toBe("29");
    });

    it("un día '00' completo se corrige a '01'", () => {
      const f = armarForm({ day: "00", month: "5", year: "2026" });
      const { result } = renderHook(() => useDate("fecha"));

      result.current.handleDayChange(evento(f.day));

      expect(f.day.value).toBe("01");
    });

    it("un valor no numérico se deja como está", () => {
      const f = armarForm({ day: "ab", month: "5", year: "2026" });
      const { result } = renderHook(() => useDate("fecha"));

      result.current.handleDayChange(evento(f.day));

      expect(f.day.value).toBe("ab");
    });
  });

  describe("handleMonthChange", () => {
    it("un mes mayor a 12 se corrige a 12", () => {
      const f = armarForm({ day: "", month: "15", year: "2026" });
      const { result } = renderHook(() => useDate("fecha"));

      result.current.handleMonthChange(evento(f.month));

      expect(f.month.value).toBe("12");
    });

    it("un mes '00' se corrige a '01'", () => {
      const f = armarForm({ day: "", month: "00", year: "2026" });
      const { result } = renderHook(() => useDate("fecha"));

      result.current.handleMonthChange(evento(f.month));

      expect(f.month.value).toBe("01");
    });

    it("si el día ya cargado no existe en el mes nuevo, lo ajusta", () => {
      const f = armarForm({ day: "31", month: "04", year: "2026" });
      const { result } = renderHook(() => useDate("fecha"));

      result.current.handleMonthChange(evento(f.month));

      expect(f.day.value).toBe("30");
    });
  });

  describe("handleYearChange", () => {
    it("pasar a un año no bisiesto ajusta el 29 de febrero a 28", () => {
      const f = armarForm({ day: "29", month: "2", year: "2025" });
      const { result } = renderHook(() => useDate("fecha"));

      result.current.handleYearChange(evento(f.year));

      expect(f.day.value).toBe("28");
    });

    it("un año incompleto (menos de 4 dígitos) no cambia nada", () => {
      const f = armarForm({ day: "29", month: "2", year: "20" });
      const { result } = renderHook(() => useDate("fecha"));

      result.current.handleYearChange(evento(f.year));

      expect(f.day.value).toBe("29");
    });
  });
});
