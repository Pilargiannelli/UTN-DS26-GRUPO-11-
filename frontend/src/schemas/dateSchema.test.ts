import { describe, it, expect } from "vitest";
import { dateInputSchema } from "./dateSchema";

describe("dateInputSchema", () => {
  it("acepta una fecha pasada válida", () => {
    expect(dateInputSchema.safeParse({ day: "15", month: "3", year: "1990" }).success).toBe(true);
  });

  it("rechaza una fecha futura", () => {
    const anio = String(new Date().getFullYear() + 1);

    const r = dateInputSchema.safeParse({ day: "1", month: "1", year: anio });

    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.issues[0].path).toEqual(["year"]);
  });

  it("rechaza un día inexistente como 31 de febrero", () => {
    expect(dateInputSchema.safeParse({ day: "31", month: "2", year: "2000" }).success).toBe(false);
  });

  it("rechaza un año que no tiene 4 dígitos", () => {
    const r = dateInputSchema.safeParse({ day: "10", month: "5", year: "99" });

    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.issues[0].message).toBe("El año debe tener 4 dígitos");
  });

  it("pide cada campo vacío con su mensaje", () => {
    const r = dateInputSchema.safeParse({ day: "", month: "", year: "" });

    expect(r.success).toBe(false);
    if (!r.success) {
      const mensajes = r.error.issues.map((i) => i.message);
      expect(mensajes).toContain("El día es requerido");
      expect(mensajes).toContain("El mes es requerido");
      expect(mensajes).toContain("El año es requerido");
    }
  });
});
