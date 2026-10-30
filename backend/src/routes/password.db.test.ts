import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import app from "../app";
import { prisma } from "../config/prisma";

/**
 * Cambio de contraseña (PATCH /api/auth/password). Usa un paciente creado
 * por la secretaria (contraseña inicial = DNI) y lo borra al terminar.
 */

const DNI = "99000003";
const EMAIL = "cambio.password@test.local";
let token: string;

beforeAll(async () => {
  await prisma.usuario.deleteMany({ where: { dni: DNI } });
  const secretaria = await request(app)
    .post("/api/auth/login")
    .send({ email: "ana.martinez@clinica.com", password: "Secretaria1234" });

  await request(app)
    .post("/api/pacientes")
    .set("Authorization", `Bearer ${secretaria.body.token}`)
    .send({
      nombre: "Cambio", apellido: "Password", dni: DNI, email: EMAIL,
      telefono: "5492344555555", sexo: "Otro", fechaNacimiento: "1990-05-20",
    });

  const login = await request(app).post("/api/auth/login").send({ email: EMAIL, password: DNI });
  token = login.body.token;
});

afterAll(async () => {
  await prisma.usuario.deleteMany({ where: { dni: DNI } });
  await prisma.$disconnect();
});

const cambiar = (body: object) =>
  request(app).patch("/api/auth/password").set("Authorization", `Bearer ${token}`).send(body);

describe("PATCH /api/auth/password", () => {
  it("sin token responde 401", async () => {
    const res = await request(app).patch("/api/auth/password").send({ passwordActual: DNI, passwordNueva: "Segura123" });
    expect(res.status).toBe(401);
  });

  it("con la contraseña actual incorrecta responde 400 (no 401: no cierra la sesión)", async () => {
    const res = await cambiar({ passwordActual: "otra", passwordNueva: "Segura123" });
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: "La contraseña actual es incorrecta" });
  });

  it("con una contraseña nueva débil responde 400", async () => {
    const res = await cambiar({ passwordActual: DNI, passwordNueva: "corta" });
    expect(res.status).toBe(400);
  });

  it("la cambia: la nueva entra y la vieja ya no", async () => {
    const res = await cambiar({ passwordActual: DNI, passwordNueva: "Segura123" });
    expect(res.status).toBe(204);

    const conNueva = await request(app).post("/api/auth/login").send({ email: EMAIL, password: "Segura123" });
    const conVieja = await request(app).post("/api/auth/login").send({ email: EMAIL, password: DNI });
    expect(conNueva.status).toBe(200);
    expect(conVieja.status).toBe(401);
  });
});

describe("PATCH /api/auth/yo (Mi cuenta)", () => {
  it("el usuario corrige su nombre y su email", async () => {
    const res = await request(app)
      .patch("/api/auth/yo")
      .set("Authorization", `Bearer ${token}`)
      .send({ nombre: "Cambiado", apellido: "Password", email: "otro.email.cambio@test.local" });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ nombre: "Cambiado", email: "otro.email.cambio@test.local", dni: DNI });
  });

  it("no puede usar el email de otra cuenta: 409", async () => {
    const res = await request(app)
      .patch("/api/auth/yo")
      .set("Authorization", `Bearer ${token}`)
      .send({ nombre: "Cambiado", apellido: "Password", email: "maria.flores@gmail.com" });

    expect(res.status).toBe(409);
    expect(res.body).toEqual({ error: "El email ya se encuentra registrado" });
  });
});
