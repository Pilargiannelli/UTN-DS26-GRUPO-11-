import { describe, it, expect } from "vitest";
import { loginSchema, registroSchema } from "./auth.validation";

// Unitarios puros: un schema Zod es una función (entra un objeto, sale un
// resultado). No necesitan Express, ni DB, ni variables de entorno.

const registroValido = {
  username: "anaperez",
  password: "Segura123",
  nombre: "Ana",
  apellido: "Pérez",
  dni: "30123456",
  email: "ana@imos.test",
  telefono: "5492344555555",
  sexo: "Femenino",
  fechaNacimiento: "1990-05-20",
};

describe("loginSchema", () => {
  it("acepta un email y una contraseña válidos", () => {
    const r = loginSchema.safeParse({ email: "ana@imos.test", password: "x" });
    expect(r.success).toBe(true);
  });

  it("rechaza un email mal formado y marca el campo email", () => {
    const r = loginSchema.safeParse({ email: "ana-imos.test", password: "x" });
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.issues[0].path).toEqual(["email"]);
  });

  // Hoy el login no aplica .trim().toLowerCase() al email: un email con
  // espacios alrededor se rechaza en vez de normalizarse. Si el grupo decide
  // normalizarlo, este test se pone rojo y hay que reemplazarlo por uno que
  // verifique r.data.email === "admin@imos.test".
  it("rechaza un email con espacios alrededor (todavía no se normaliza)", () => {
    const r = loginSchema.safeParse({ email: "  Admin@IMOS.test ", password: "x" });
    expect(r.success).toBe(false);
  });

  it("rechaza una contraseña vacía con el mensaje propio", () => {
    const r = loginSchema.safeParse({ email: "ana@imos.test", password: "" });
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.issues[0].message).toBe("La contraseña es obligatoria");
  });
});

describe("registroSchema", () => {
  it("acepta un registro con contraseña fuerte", () => {
    const r = registroSchema.safeParse(registroValido);
    expect(r.success).toBe(true);
  });

  it("una contraseña débil acumula los tres errores (largo, mayúscula y número)", () => {
    const r = registroSchema.safeParse({ ...registroValido, password: "corta" });
    expect(r.success).toBe(false);
    if (!r.success) {
      const mensajes = r.error.issues.map((i) => i.message);
      expect(mensajes).toHaveLength(3);
      expect(mensajes).toContain("La contraseña debe tener al menos 8 caracteres");
      expect(mensajes).toContain("La contraseña debe tener al menos una mayúscula");
      expect(mensajes).toContain("La contraseña debe tener al menos un número");
    }
  });

  it("recorta los espacios del nombre y del username", () => {
    const r = registroSchema.safeParse({ ...registroValido, nombre: "  Ana  ", username: " anaperez " });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.nombre).toBe("Ana");
      expect(r.data.username).toBe("anaperez");
    }
  });

  it("el username es opcional (si falta, el back usa el DNI)", () => {
    const { username: _omitido, ...sinUsername } = registroValido;
    expect(registroSchema.safeParse(sinUsername).success).toBe(true);
  });

  // Decisión de seguridad: el rol lo asigna el back (siempre PACIENTE).
  // Si alguien manda rol en el body, el schema lo descarta.
  it("descarta el rol si viene en el body (nadie se autoasigna SECRETARIA)", () => {
    const r = registroSchema.safeParse({ ...registroValido, rol: "SECRETARIA" });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data).not.toHaveProperty("rol");
  });
});
