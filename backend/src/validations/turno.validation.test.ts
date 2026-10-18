import { describe, it, expect } from "vitest";
import { turnoCreateSchema, idParamSchema } from "./turno.validation";

const turnoValido = {
  fechaHora: "2026-11-03T10:30:00.000Z",
  medicoId: 1,
  pacienteId: 2,
};

describe("turnoCreateSchema", () => {
  it("convierte fechaHora de string a Date", () => {
    const r = turnoCreateSchema.safeParse(turnoValido);
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.fechaHora).toBeInstanceOf(Date);
      expect(r.data.fechaHora.toISOString()).toBe("2026-11-03T10:30:00.000Z");
    }
  });

  it("rechaza un turno sin médico y marca el campo medicoId", () => {
    const { medicoId: _omitido, ...sinMedico } = turnoValido;
    const r = turnoCreateSchema.safeParse(sinMedico);
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.issues[0].path).toEqual(["medicoId"]);
  });

  it("rechaza un pacienteId negativo con el mensaje propio", () => {
    const r = turnoCreateSchema.safeParse({ ...turnoValido, pacienteId: -3 });
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.issues[0].message).toBe("El paciente es obligatorio");
  });

  it("rechaza un estado que no está en el enum", () => {
    const r = turnoCreateSchema.safeParse({ ...turnoValido, estado: "Perdido" });
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.issues[0].path).toEqual(["estado"]);
  });
});

describe("idParamSchema", () => {
  it('convierte { id: "42" } en el número 42', () => {
    const r = idParamSchema.safeParse({ id: "42" });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.id).toBe(42);
  });

  it("rechaza un id que no es número", () => {
    const r = idParamSchema.safeParse({ id: "abc" });
    expect(r.success).toBe(false);
  });

  it("rechaza el id 0 con el mensaje propio", () => {
    const r = idParamSchema.safeParse({ id: "0" });
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.issues[0].message).toBe("El id debe ser un número positivo");
  });
});
