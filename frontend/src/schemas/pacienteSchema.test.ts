import { describe, expect, it } from "vitest";
import { pacienteSchema, SIN_OBRA_SOCIAL } from "./pacienteSchema";

const valido = {
  nombre: "Ana",
  apellido: "Pérez",
  dni: "30123456",
  email: "ana@imos.test",
  telefono: "5492344555555",
  obraSocial: SIN_OBRA_SOCIAL,
  nroAfiliado: "-",
  plan: "-",
  sexo: "Femenino",
  fechaNacimiento: { day: "20", month: "05", year: "1990" },
};

const schema = (conPassword = false) => pacienteSchema(["Masculino", "Femenino", "Otro"], conPassword);
const campos = (r: ReturnType<ReturnType<typeof schema>["safeParse"]>) =>
  r.success ? [] : r.error.issues.map((i) => i.path.join("."));

describe("pacienteSchema del formulario de registro", () => {
  it("en modo secretaria no pide contraseña", () => {
    expect(schema(false).safeParse(valido).success).toBe(true);
  });

  it("rechaza un DNI con letras", () => {
    expect(campos(schema().safeParse({ ...valido, dni: "30A12345" }))).toContain("dni");
  });

  it("en autoregistro exige una contraseña fuerte", () => {
    const r = schema(true).safeParse({ ...valido, password: "corta", repetirPassword: "corta" });
    expect(campos(r)).toContain("password");
  });

  it("en autoregistro las contraseñas tienen que coincidir", () => {
    const r = schema(true).safeParse({ ...valido, password: "Segura123", repetirPassword: "Segura124" });
    expect(campos(r)).toEqual(["repetirPassword"]);
  });

  it("marca las contraseñas aunque otros campos también tengan errores", () => {
    const r = schema(true).safeParse({ ...valido, nombre: "", password: "abc", repetirPassword: "xyz" });
    expect(campos(r)).toEqual(expect.arrayContaining(["nombre", "password", "repetirPassword"]));
  });

  it("en autoregistro acepta una contraseña fuerte repetida bien", () => {
    expect(schema(true).safeParse({ ...valido, password: "Segura123", repetirPassword: "Segura123" }).success).toBe(true);
  });
});
