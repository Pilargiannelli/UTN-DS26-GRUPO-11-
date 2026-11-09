import { describe, it, expect } from "vitest";
import { entradaCreateSchema, historiaUpdateSchema } from "./historiaClinica.validation";

describe("entradaCreateSchema", () => {
  const valida = { diagnostico: "Gripe", evolucion: "Mejora", observaciones: "Reposo" };

  it("acepta una entrada completa", () => {
    expect(entradaCreateSchema.safeParse(valida).success).toBe(true);
  });

  it("rechaza diagnóstico vacío o solo espacios", () => {
    const r = entradaCreateSchema.safeParse({ ...valida, diagnostico: "   " });

    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.issues[0].path).toEqual(["diagnostico"]);
  });

  it("rechaza evolución vacía", () => {
    const r = entradaCreateSchema.safeParse({ ...valida, evolucion: "" });

    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.issues[0].path).toEqual(["evolucion"]);
  });

  it("observaciones es opcional y queda como string vacío", () => {
    const r = entradaCreateSchema.safeParse({ diagnostico: "Gripe", evolucion: "Mejora" });

    expect(r.success).toBe(true);
    if (r.success) expect(r.data.observaciones).toBe("");
  });

  it("recorta espacios de los textos", () => {
    const r = entradaCreateSchema.safeParse({ ...valida, diagnostico: "  Gripe  " });

    expect(r.success).toBe(true);
    if (r.success) expect(r.data.diagnostico).toBe("Gripe");
  });
});

describe("historiaUpdateSchema", () => {
  it("elimina duplicados de alergias y antecedentes", () => {
    const r = historiaUpdateSchema.safeParse({
      alergias: ["Penicilina", "Penicilina", "Polen"],
      antecedentes: ["Asma", "Asma"],
    });

    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.alergias).toEqual(["Penicilina", "Polen"]);
      expect(r.data.antecedentes).toEqual(["Asma"]);
    }
  });

  it("recorta espacios antes de deduplicar", () => {
    const r = historiaUpdateSchema.safeParse({ alergias: [" Polen", "Polen "], antecedentes: [] });

    expect(r.success).toBe(true);
    if (r.success) expect(r.data.alergias).toEqual(["Polen"]);
  });

  it("rechaza elementos vacíos", () => {
    const r = historiaUpdateSchema.safeParse({ alergias: ["  "], antecedentes: [] });

    expect(r.success).toBe(false);
  });

  it("rechaza si falta una de las listas", () => {
    expect(historiaUpdateSchema.safeParse({ alergias: [] }).success).toBe(false);
  });
});
