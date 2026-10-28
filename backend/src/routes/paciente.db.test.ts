import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../app";
import { prisma } from "../config/prisma";
import { JWT_SECRET } from "../config/env";
import { Rol } from "../generated/prisma/enums";

/**
 * Alta de pacientes (HU-001): por la secretaria y por autoregistro.
 * Requiere la BD levantada y el seed cargado. Los pacientes de prueba usan
 * DNI 9900000x y se borran en afterAll.
 */

const DNIS_PRUEBA = ["99000001", "99000002"];

const datosPaciente = (dni: string, email: string) => ({
  nombre: "Paciente",
  apellido: "De Prueba",
  dni,
  email,
  telefono: "5492344555555",
  sexo: "Otro",
  fechaNacimiento: "1990-05-20",
});

let tokenSecretaria: string;
let obraSocialId: number;

async function borrarPruebas() {
  // Paciente y Cobertura se borran en cascada con el Usuario
  await prisma.usuario.deleteMany({ where: { dni: { in: DNIS_PRUEBA } } });
}

beforeAll(async () => {
  await borrarPruebas();
  const secretaria = await prisma.usuario.findUniqueOrThrow({ where: { email: "ana.martinez@clinica.com" } });
  tokenSecretaria = jwt.sign({ sub: secretaria.id, rol: Rol.SECRETARIA }, JWT_SECRET, { expiresIn: "1h" });
  obraSocialId = (await prisma.obraSocial.findFirstOrThrow()).id;
});

afterAll(async () => {
  await borrarPruebas();
  await prisma.$disconnect();
});

describe("POST /api/pacientes (secretaria)", () => {
  it("crea Usuario + Paciente + Cobertura y responde 201 sin el hash", async () => {
    const res = await request(app)
      .post("/api/pacientes")
      .set("Authorization", `Bearer ${tokenSecretaria}`)
      .send({
        ...datosPaciente(DNIS_PRUEBA[0], "alta.secretaria@test.local"),
        cobertura: { obraSocialId, nroAfiliado: "TEST-0001", plan: "210" },
      });

    expect(res.status).toBe(201);
    expect(res.body.usuario).toMatchObject({ dni: DNIS_PRUEBA[0], username: DNIS_PRUEBA[0] });
    expect(res.body.usuario).not.toHaveProperty("passwordHash");
    expect(res.body.coberturas).toHaveLength(1);

    const usuario = await prisma.usuario.findUniqueOrThrow({ where: { dni: DNIS_PRUEBA[0] } });
    expect(usuario.rol).toBe(Rol.PACIENTE);
  });

  it("el paciente que dio de alta la secretaria entra con su DNI como contraseña", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "alta.secretaria@test.local", password: DNIS_PRUEBA[0] });

    expect(res.status).toBe(200);
  });

  it("un DNI repetido responde 409 con el mensaje del campo (HU-001 CA2)", async () => {
    const res = await request(app)
      .post("/api/pacientes")
      .set("Authorization", `Bearer ${tokenSecretaria}`)
      .send(datosPaciente(DNIS_PRUEBA[0], "otro.email@test.local"));

    expect(res.status).toBe(409);
    expect(res.body).toEqual({ error: "El DNI ya se encuentra registrado" });
  });
});

describe("POST /api/auth/registro (autoregistro)", () => {
  it("crea la ficha de Paciente y el paciente puede entrar y pedir turnos", async () => {
    const registro = await request(app)
      .post("/api/auth/registro")
      .send({ ...datosPaciente(DNIS_PRUEBA[1], "autoregistro@test.local"), password: "Segura123", rol: "SECRETARIA" });

    expect(registro.status).toBe(201);
    const usuario = await prisma.usuario.findUniqueOrThrow({ where: { dni: DNIS_PRUEBA[1] }, include: { paciente: true } });
    expect(usuario.rol).toBe(Rol.PACIENTE);
    expect(usuario.paciente).not.toBeNull();

    const login = await request(app).post("/api/auth/login").send({ email: "autoregistro@test.local", password: "Segura123" });
    expect(login.status).toBe(200);

    const turnos = await request(app).get("/api/turnos").set("Authorization", `Bearer ${login.body.token}`);
    expect(turnos.status).toBe(200);
  });
});
