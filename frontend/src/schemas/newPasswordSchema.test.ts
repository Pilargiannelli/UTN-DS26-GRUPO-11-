import { describe, it, expect } from "vitest";
import { newPasswordSchema } from "./newPasswordSchema";

const valida = { currentPassword: "Vieja1234", newPassword: "Nueva1234", repeatPassword: "Nueva1234" };

function mensajes(datos: object) {
  const r = newPasswordSchema.safeParse(datos);
  return r.success ? [] : r.error.issues.map((i) => i.message);
}

describe("newPasswordSchema", () => {
  it("acepta una contraseña nueva fuerte, repetida y distinta de la actual", () => {
    expect(newPasswordSchema.safeParse(valida).success).toBe(true);
  });

  it("rechaza menos de 8 caracteres", () => {
    expect(mensajes({ ...valida, newPassword: "Ab1", repeatPassword: "Ab1" })).toContain(
      "La contraseña debe tener al menos 8 caracteres"
    );
  });

  it("rechaza si falta una mayúscula", () => {
    expect(mensajes({ ...valida, newPassword: "nueva1234", repeatPassword: "nueva1234" })).toContain(
      "La contraseña debe tener al menos una mayúscula"
    );
  });

  it("rechaza si falta una minúscula", () => {
    expect(mensajes({ ...valida, newPassword: "NUEVA1234", repeatPassword: "NUEVA1234" })).toContain(
      "La contraseña debe tener al menos una minúscula"
    );
  });

  it("rechaza si falta un número", () => {
    expect(mensajes({ ...valida, newPassword: "NuevaClave", repeatPassword: "NuevaClave" })).toContain(
      "La contraseña debe tener al menos un número"
    );
  });

  it("rechaza si la repetición no coincide, marcando el campo repeatPassword", () => {
    const r = newPasswordSchema.safeParse({ ...valida, repeatPassword: "Otra12345" });

    expect(r.success).toBe(false);
    if (!r.success) {
      expect(r.error.issues[0].message).toBe("Las nuevas contraseñas no coinciden");
      expect(r.error.issues[0].path).toEqual(["repeatPassword"]);
    }
  });

  it("rechaza si la nueva es igual a la actual", () => {
    const datos = { currentPassword: "Igual1234", newPassword: "Igual1234", repeatPassword: "Igual1234" };

    expect(mensajes(datos)).toContain("La contraseña nueva tiene que ser distinta de la actual");
  });

  it("rechaza la contraseña actual vacía", () => {
    expect(mensajes({ ...valida, currentPassword: "" })).toContain("Ingrese la contraseña actual");
  });
});
