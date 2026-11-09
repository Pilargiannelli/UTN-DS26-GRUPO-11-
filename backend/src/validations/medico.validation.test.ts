import { describe, it, expect } from "vitest";
import { medicoCreateSchema } from "./medico.validation";

const medicoValido = {
  nombre: "Carlos",
  apellido: "Gómez",
  dni: "30123456",
  email: "carlos@imos.test",
  telefono: "549221456789",
  especialidad: "Cardiología",
  matricula: "MP-12345",
};

const camposConError = (datos: unknown) => {
  const r = medicoCreateSchema.safeParse(datos);
  return r.success ? [] : r.error.issues.map((i) => i.path.join("."));
};

describe("medicoCreateSchema", () => {
  it("acepta un médico con datos válidos", () => {
    expect(medicoCreateSchema.safeParse(medicoValido).success).toBe(true);
  });

  it("rechaza un DNI con letras o de largo incorrecto", () => {
    expect(camposConError({ ...medicoValido, dni: "30A23456" })).toContain("dni");
    expect(camposConError({ ...medicoValido, dni: "123" })).toContain("dni");
  });

  it("rechaza un email mal formado", () => {
    expect(camposConError({ ...medicoValido, email: "carlos-imos.test" })).toContain("email");
  });

  it("marca los campos obligatorios vacíos", () => {
    const campos = camposConError({
      ...medicoValido,
      nombre: "",
      apellido: " ",
      especialidad: "",
      matricula: "",
    });
    expect(campos).toEqual(expect.arrayContaining(["nombre", "apellido", "especialidad", "matricula"]));
  });

  it("normaliza el email (elimina espacios sobrantes y convierte a minúsculas)", () => {
    const r = medicoCreateSchema.safeParse({ ...medicoValido, email: "  Carlos@IMOS.test " });
    expect(r.success && r.data.email).toBe("carlos@imos.test");
  });
});