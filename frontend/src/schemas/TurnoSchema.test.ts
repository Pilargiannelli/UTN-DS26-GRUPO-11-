import { describe, it, expect } from "vitest";
import { turnoSchema } from "./TurnoSchema";

const valido = { pacienteId: "3", medicoId: "2", fecha: "2026-06-12", hora: "10:00", estado: "Pendiente" };

describe("turnoSchema", () => {
  it("acepta un turno válido y convierte los ids a número", () => {
    const r = turnoSchema.safeParse(valido);

    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.pacienteId).toBe(3);
      expect(r.data.medicoId).toBe(2);
    }
  });

  it("acepta el estado Confirmado", () => {
    expect(turnoSchema.safeParse({ ...valido, estado: "Confirmado" }).success).toBe(true);
  });

  it("rechaza un estado que no sea Pendiente o Confirmado", () => {
    expect(turnoSchema.safeParse({ ...valido, estado: "Cancelado" }).success).toBe(false);
  });

  it("rechaza paciente sin seleccionar (0 o vacío)", () => {
    expect(turnoSchema.safeParse({ ...valido, pacienteId: "0" }).success).toBe(false);
    expect(turnoSchema.safeParse({ ...valido, pacienteId: "" }).success).toBe(false);
  });

  it("rechaza un médico negativo", () => {
    expect(turnoSchema.safeParse({ ...valido, medicoId: -1 }).success).toBe(false);
  });

  it("rechaza fecha y hora vacías con su mensaje", () => {
    const r = turnoSchema.safeParse({ ...valido, fecha: "", hora: "" });

    expect(r.success).toBe(false);
    if (!r.success) {
      const mensajes = r.error.issues.map((i) => i.message);
      expect(mensajes).toContain("Seleccione una fecha");
      expect(mensajes).toContain("Seleccione un horario");
    }
  });
});
