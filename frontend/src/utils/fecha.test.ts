import { describe, it, expect } from "vitest";
import { parseFechaHora, formatearChipFecha, formatearHora, formatearFechaLarga } from "./fecha";

// Sin "Z": se interpreta en hora local, así el test no depende de la zona horaria
const ISO = "2026-03-05T09:07:00";

describe("fecha", () => {
  it("parseFechaHora devuelve un Date con la fecha y hora del string", () => {
    const d = parseFechaHora(ISO);

    expect(d).toBeInstanceOf(Date);
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(2);
    expect(d.getDate()).toBe(5);
  });

  it("formatearChipFecha devuelve el día con dos dígitos y el mes abreviado", () => {
    expect(formatearChipFecha(ISO)).toEqual({ dia: "05", mes: "mar" });
  });

  it("formatearChipFecha abrevia diciembre como dic", () => {
    expect(formatearChipFecha("2026-12-24T10:00:00")).toEqual({ dia: "24", mes: "dic" });
  });

  it("formatearHora completa con ceros a la izquierda", () => {
    expect(formatearHora(ISO)).toBe("09:07");
  });

  it("formatearHora muestra las horas de la tarde en formato 24 h", () => {
    expect(formatearHora("2026-03-05T18:30:00")).toBe("18:30");
  });

  it("formatearFechaLarga incluye día, mes en letras y año", () => {
    const texto = formatearFechaLarga(ISO);

    expect(texto).toContain("2026");
    expect(texto).toMatch(/marzo/i);
  });
});
