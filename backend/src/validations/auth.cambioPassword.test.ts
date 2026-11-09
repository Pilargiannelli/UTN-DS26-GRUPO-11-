import { describe, it, expect } from "vitest";
import { cambioPasswordSchema, perfilUpdateSchema } from "./auth.validation";

describe("cambioPasswordSchema", () => {
  it("acepta una contraseña nueva fuerte y distinta de la actual", () => {
    const r = cambioPasswordSchema.safeParse({ passwordActual: "Vieja1234", passwordNueva: "Nueva1234" });

    expect(r.success).toBe(true);
  });

  it("rechaza una nueva igual a la actual, marcando passwordNueva", () => {
    const r = cambioPasswordSchema.safeParse({ passwordActual: "Misma1234", passwordNueva: "Misma1234" });

    expect(r.success).toBe(false);
    if (!r.success) {
      expect(r.error.issues[0].path).toEqual(["passwordNueva"]);
      expect(r.error.issues[0].message).toBe("La contraseña nueva tiene que ser distinta de la actual");
    }
  });

  it("rechaza una contraseña nueva débil", () => {
    const r = cambioPasswordSchema.safeParse({ passwordActual: "Vieja1234", passwordNueva: "corta" });

    expect(r.success).toBe(false);
  });

  it("rechaza si falta la contraseña actual", () => {
    const r = cambioPasswordSchema.safeParse({ passwordActual: "", passwordNueva: "Nueva1234" });

    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.issues[0].message).toBe("Ingresá tu contraseña actual");
  });
});

describe("perfilUpdateSchema", () => {
  it("normaliza el email (espacios y mayúsculas) y recorta nombre y apellido", () => {
    const r = perfilUpdateSchema.safeParse({ nombre: " Ana ", apellido: " Pérez ", email: " ANA@Imos.Test " });

    expect(r.success).toBe(true);
    if (r.success) expect(r.data).toEqual({ nombre: "Ana", apellido: "Pérez", email: "ana@imos.test" });
  });

  it("rechaza nombre vacío y email inválido", () => {
    const r = perfilUpdateSchema.safeParse({ nombre: " ", apellido: "Pérez", email: "no-es-mail" });

    expect(r.success).toBe(false);
    if (!r.success) {
      const campos = r.error.issues.map((i) => i.path[0]);
      expect(campos).toContain("nombre");
      expect(campos).toContain("email");
    }
  });

  it("descarta campos que no se pueden cambiar desde Mi cuenta (dni, rol)", () => {
    const r = perfilUpdateSchema.safeParse({ nombre: "Ana", apellido: "Pérez", email: "a@b.co", dni: "1", rol: "MEDICO" });

    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data).not.toHaveProperty("dni");
      expect(r.data).not.toHaveProperty("rol");
    }
  });
});
