import { describe, it, expect } from "vitest";
import { obraSocialCreateSchema } from "./obraSocial.validation";

describe("obraSocialCreateSchema", () => {
  it("acepta un nombre válido y le recorta los espacios", () => {
    const r = obraSocialCreateSchema.safeParse({ nombre: "  OSDE  " });

    expect(r.success).toBe(true);
    if (r.success) expect(r.data.nombre).toBe("OSDE");
  });

  it("rechaza un nombre vacío", () => {
    const r = obraSocialCreateSchema.safeParse({ nombre: "   " });

    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.issues[0].message).toBe("El nombre de la obra social es obligatorio");
  });

  it("rechaza si falta el nombre", () => {
    expect(obraSocialCreateSchema.safeParse({}).success).toBe(false);
  });
});
