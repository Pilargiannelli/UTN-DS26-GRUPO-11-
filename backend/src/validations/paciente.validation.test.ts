import { describe, it, expect } from "vitest";
import { pacienteCreateSchema } from "./paciente.validation";

const pacienteValido = {
  nombre: "Ana",
  apellido: "Pérez",
  dni: "30123456",
  email: "ana@imos.test",
  telefono: "5492344555555",
  sexo: "Femenino",
  fechaNacimiento: "1990-05-20",
};

const camposConError = (datos: unknown) => {
  const r = pacienteCreateSchema.safeParse(datos);
  return r.success ? [] : r.error.issues.map((i) => i.path.join("."));
};

describe("pacienteCreateSchema (HU-001)", () => {
  it("acepta un paciente válido sin obra social", () => {
    expect(pacienteCreateSchema.safeParse(pacienteValido).success).toBe(true);
  });

  it("acepta un paciente con cobertura", () => {
    const r = pacienteCreateSchema.safeParse({
      ...pacienteValido,
      cobertura: { obraSocialId: 1, nroAfiliado: "A-123", plan: "210" },
    });
    expect(r.success).toBe(true);
  });

  it("rechaza un DNI con letras o de largo incorrecto", () => {
    expect(camposConError({ ...pacienteValido, dni: "30A23456" })).toContain("dni");
    expect(camposConError({ ...pacienteValido, dni: "123" })).toContain("dni");
  });

  it("rechaza una fecha de nacimiento futura", () => {
    expect(camposConError({ ...pacienteValido, fechaNacimiento: "2999-01-01" })).toContain("fechaNacimiento");
  });

  it("marca los obligatorios vacíos (HU-001 CA3)", () => {
    const campos = camposConError({ ...pacienteValido, nombre: "", apellido: " ", dni: "", telefono: "" });
    expect(campos).toEqual(expect.arrayContaining(["nombre", "apellido", "dni", "telefono"]));
  });

  it("normaliza el email (espacios y mayúsculas)", () => {
    const r = pacienteCreateSchema.safeParse({ ...pacienteValido, email: "  Ana@IMOS.test " });
    expect(r.success && r.data.email).toBe("ana@imos.test");
  });
});
