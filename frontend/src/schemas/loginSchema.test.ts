import { describe, it, expect } from "vitest";
import { loginSchema } from "./loginSchema";
import { loginSchema as loginUsuarioSchema } from "./userSchema";

describe("loginSchema (email)", () => {
  it("acepta email y contraseña", () => {
    expect(loginSchema.safeParse({ email: "ana@imos.test", password: "x" }).success).toBe(true);
  });

  it("rechaza un email mal formado con su mensaje", () => {
    const r = loginSchema.safeParse({ email: "no-es-un-mail", password: "x" });

    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.issues[0].message).toBe("El email no es válido");
  });

  it("rechaza contraseña vacía pero no exige fortaleza", () => {
    const vacia = loginSchema.safeParse({ email: "ana@imos.test", password: "" });
    const debil = loginSchema.safeParse({ email: "ana@imos.test", password: "a" });

    expect(vacia.success).toBe(false);
    expect(debil.success).toBe(true);
  });
});

describe("loginSchema (usuario)", () => {
  it("acepta usuario y contraseña", () => {
    expect(loginUsuarioSchema.safeParse({ username: "ana", password: "x" }).success).toBe(true);
  });

  it("rechaza usuario y contraseña vacíos con sus mensajes", () => {
    const r = loginUsuarioSchema.safeParse({ username: "", password: "" });

    expect(r.success).toBe(false);
    if (!r.success) {
      const mensajes = r.error.issues.map((i) => i.message);
      expect(mensajes).toContain("Por favor, ingrese su usuario");
      expect(mensajes).toContain("Por favor, ingrese su contraseña");
    }
  });
});
