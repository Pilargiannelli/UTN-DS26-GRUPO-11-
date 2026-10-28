import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../app";
import { prisma } from "../config/prisma";
import { JWT_SECRET } from "../config/env";
import { Rol, TurnoEstado } from "../generated/prisma/enums";

/**
 * T07 — RN-002: un médico no puede tener dos turnos activos en el mismo
 * horario. Requiere la BD levantada y el seed cargado. Usa fechas de 2031
 * para no chocar con otros tests, y borra lo que crea en afterAll.
 */

const HORARIO = "2031-06-10T12:00:00.000Z";
const tokenDe = (sub: number, rol: Rol) => jwt.sign({ sub, rol }, JWT_SECRET, { expiresIn: "1h" });

let tokenMaria: string;
let tokenJuan: string;
let tokenSecretaria: string;
let medicoId: number;
let pacienteJuanId: number;

beforeAll(async () => {
  const maria = await prisma.usuario.findUniqueOrThrow({ where: { email: "maria.flores@gmail.com" } });
  const juan = await prisma.usuario.findUniqueOrThrow({ where: { email: "juan.rodriguez@gmail.com" }, include: { paciente: true } });
  const secretaria = await prisma.usuario.findUniqueOrThrow({ where: { email: "ana.martinez@clinica.com" } });
  const medico = await prisma.usuario.findUniqueOrThrow({ where: { email: "carlos.gomez@clinica.com" }, include: { medico: true } });

  tokenMaria = tokenDe(maria.id, Rol.PACIENTE);
  tokenJuan = tokenDe(juan.id, Rol.PACIENTE);
  tokenSecretaria = tokenDe(secretaria.id, Rol.SECRETARIA);
  medicoId = medico.medico!.id;
  pacienteJuanId = juan.paciente!.id;
});

afterAll(async () => {
  await prisma.turno.deleteMany({ where: { fechaHora: { gte: new Date("2031-01-01"), lt: new Date("2032-01-01") } } });
  await prisma.$disconnect();
});

const pedir = (token: string, fechaHora = HORARIO) =>
  request(app).post("/api/turnos").set("Authorization", `Bearer ${token}`).send({ medicoId, fechaHora });

describe("RN-002: superposición de turnos", () => {
  it("un segundo paciente no puede pedir el mismo médico y horario: 409", async () => {
    const primero = await pedir(tokenMaria);
    expect(primero.status).toBe(201);

    const segundo = await pedir(tokenJuan);
    expect(segundo.status).toBe(409);
    expect(segundo.body).toEqual({ error: "El médico ya tiene un turno en ese horario" });
  });

  it("la secretaria tampoco puede cargarlo encima: 409", async () => {
    const res = await request(app)
      .post("/api/turnos")
      .set("Authorization", `Bearer ${tokenSecretaria}`)
      .send({ medicoId, pacienteId: pacienteJuanId, fechaHora: HORARIO });

    expect(res.status).toBe(409);
  });

  it("un turno cancelado libera el horario", async () => {
    const turno = await prisma.turno.findFirstOrThrow({ where: { medicoId, fechaHora: new Date(HORARIO) } });
    await request(app).patch(`/api/turnos/${turno.id}/cancelar`).set("Authorization", `Bearer ${tokenMaria}`);

    const deNuevo = await pedir(tokenJuan);
    expect(deNuevo.status).toBe(201);
  });

  it("no se puede reprogramar (PUT) un turno a un horario ocupado: 409", async () => {
    const otro = await pedir(tokenMaria, "2031-06-10T13:00:00.000Z");
    expect(otro.status).toBe(201);

    const res = await request(app)
      .put(`/api/turnos/${otro.body.id}`)
      .set("Authorization", `Bearer ${tokenSecretaria}`)
      .send({ fechaHora: HORARIO });

    expect(res.status).toBe(409);
  });

  it("confirmar un turno no choca consigo mismo", async () => {
    const turno = await prisma.turno.findFirstOrThrow({
      where: { medicoId, fechaHora: new Date(HORARIO), estado: TurnoEstado.Pendiente },
    });
    const res = await request(app)
      .put(`/api/turnos/${turno.id}`)
      .set("Authorization", `Bearer ${tokenSecretaria}`)
      .send({ estado: "Confirmado" });

    expect(res.status).toBe(200);
  });
});

describe("GET /api/turnos/ocupados", () => {
  it("devuelve solo las fechas tomadas (sin datos de pacientes) y no las canceladas", async () => {
    const res = await request(app)
      .get("/api/turnos/ocupados")
      .query({ medicoId, desde: "2031-06-10T00:00:00.000Z", hasta: "2031-06-11T00:00:00.000Z" })
      .set("Authorization", `Bearer ${tokenJuan}`);

    expect(res.status).toBe(200);
    // 12:00 (Juan, el de María está cancelado) y 13:00 (María)
    expect(res.body).toEqual(["2031-06-10T12:00:00.000Z", "2031-06-10T13:00:00.000Z"]);
  });

  it("sin medicoId responde 400", async () => {
    const res = await request(app)
      .get("/api/turnos/ocupados")
      .query({ desde: "2031-06-10", hasta: "2031-06-11" })
      .set("Authorization", `Bearer ${tokenJuan}`);

    expect(res.status).toBe(400);
  });
});
