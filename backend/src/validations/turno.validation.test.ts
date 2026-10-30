import { describe, it, expect } from "vitest";
import { turnoCreateSchema, turnoSolicitudSchema, turnoUpdateSchema, idParamSchema } from "./turno.validation";

const turnoValido = {
  fechaHora: "2030-11-04T10:30:00.000Z",
  medicoId: 1,
  pacienteId: 2,
};

describe("turnoCreateSchema", () => {
  it("convierte fechaHora de string a Date", () => {
    const r = turnoCreateSchema.safeParse(turnoValido);
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.fechaHora).toBeInstanceOf(Date);
      expect(r.data.fechaHora.toISOString()).toBe("2030-11-04T10:30:00.000Z");
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

describe("RN-008: turnos en el pasado (400)", () => {
  // El último día hábil antes de hoy, a las 15 UTC (12 en Argentina) y en la
  // grilla de 30 minutos, para que solo falle por estar en el pasado
  const ayer = new Date(Date.now() - 24 * 60 * 60 * 1000);
  while ([0, 6].includes(ayer.getUTCDay())) ayer.setUTCDate(ayer.getUTCDate() - 1);
  ayer.setUTCHours(15, 0, 0, 0);
  const AYER = ayer.toISOString();

  it("turnoCreateSchema rechaza una fecha pasada y marca fechaHora", () => {
    const r = turnoCreateSchema.safeParse({ ...turnoValido, fechaHora: AYER });
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(r.error.issues[0].path).toEqual(["fechaHora"]);
      expect(r.error.issues[0].message).toBe("No se pueden pedir turnos en el pasado");
    }
  });

  it("turnoSolicitudSchema (paciente) también la rechaza", () => {
    const r = turnoSolicitudSchema.safeParse({ medicoId: 1, fechaHora: AYER });
    expect(r.success).toBe(false);
  });

  it("turnoUpdateSchema acepta un PUT sin fecha (solo cambia el estado)", () => {
    expect(turnoUpdateSchema.safeParse({ estado: "Confirmado" }).success).toBe(true);
  });

  it("turnoUpdateSchema rechaza mover el turno al pasado", () => {
    expect(turnoUpdateSchema.safeParse({ fechaHora: AYER }).success).toBe(false);
  });
});

describe("estado de un turno nuevo", () => {
  it("no se puede crear un turno ya Cancelado", () => {
    const r = turnoCreateSchema.safeParse({ ...turnoValido, estado: "Cancelado" });
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.issues[0].path).toEqual(["estado"]);
  });

  it("sí se puede crear Confirmado", () => {
    expect(turnoCreateSchema.safeParse({ ...turnoValido, estado: "Confirmado" }).success).toBe(true);
  });

  it("al editar sí se puede pasar a Reprogramado", () => {
    expect(turnoUpdateSchema.safeParse({ estado: "Reprogramado" }).success).toBe(true);
  });
});

describe("días de atención (lunes a viernes)", () => {
  it("rechaza un turno el sábado o el domingo", () => {
    const sabado = turnoCreateSchema.safeParse({ ...turnoValido, fechaHora: "2030-11-09T13:00:00.000Z" });
    const domingo = turnoCreateSchema.safeParse({ ...turnoValido, fechaHora: "2030-11-10T13:00:00.000Z" });
    expect(sabado.success).toBe(false);
    expect(domingo.success).toBe(false);
    if (!sabado.success) expect(sabado.error.issues[0].message).toBe("La clínica atiende de lunes a viernes");
  });

  it("usa la hora de Argentina: el viernes 22:30 local sigue siendo viernes aunque en UTC ya sea sábado", () => {
    // 2030-11-09T01:30Z = viernes 8 de noviembre 22:30 en Argentina
    const r = turnoCreateSchema.safeParse({ ...turnoValido, fechaHora: "2030-11-09T01:30:00.000Z" });
    expect(r.success).toBe(true);
  });
});

describe("grilla de 30 minutos", () => {
  it("rechaza un turno a las y cuarto", () => {
    const r = turnoCreateSchema.safeParse({ ...turnoValido, fechaHora: "2030-11-04T11:15:00.000Z" });
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.issues[0].path).toEqual(["fechaHora"]);
  });

  it("acepta en punto y y media", () => {
    expect(turnoCreateSchema.safeParse({ ...turnoValido, fechaHora: "2030-11-04T11:00:00.000Z" }).success).toBe(true);
    expect(turnoCreateSchema.safeParse({ ...turnoValido, fechaHora: "2030-11-04T11:30:00.000Z" }).success).toBe(true);
  });
});

describe("SEC-002: campos que no decide el cliente", () => {
  it("descarta pagoValidado e idWhatsapp del body", () => {
    const r = turnoUpdateSchema.safeParse({ estado: "Confirmado", pagoValidado: true, idWhatsapp: "WA-1" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data).not.toHaveProperty("pagoValidado");
      expect(r.data).not.toHaveProperty("idWhatsapp");
    }
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
