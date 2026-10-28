import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../app";
import { prisma } from "../config/prisma";
import { JWT_SECRET } from "../config/env";
import { Rol, TurnoEstado } from "../generated/prisma/enums";

/**
 * T06 — Turnos del paciente con titularidad (criterios de aceptación 1 a 5).
 * Requiere la BD levantada y el seed cargado (María y Juan como pacientes,
 * Carlos Gómez como médico). Lo que se crea acá se borra en afterAll.
 */

const tokenDe = (sub: number, rol: Rol) => jwt.sign({ sub, rol }, JWT_SECRET, { expiresIn: "1h" });
const FECHA_FUTURA = "2030-03-14T13:00:00.000Z";

let tokenMaria: string;
let tokenJuan: string;
let tokenMedicoB: string;
let pacienteMariaId: number;
let pacienteJuanId: number;
let medicoAId: number;
let usuarioMedicoBId: number;
const turnosCreados: number[] = [];

// Turno de María creado directo en la base, en el estado que pida el test
async function turnoDeMaria(estado: TurnoEstado, fechaHora = FECHA_FUTURA) {
  const turno = await prisma.turno.create({
    data: { medicoId: medicoAId, pacienteId: pacienteMariaId, fechaHora: new Date(fechaHora), estado },
  });
  turnosCreados.push(turno.id);
  return turno;
}

beforeAll(async () => {
  const maria = await prisma.usuario.findUniqueOrThrow({ where: { email: "maria.flores@gmail.com" }, include: { paciente: true } });
  const juan = await prisma.usuario.findUniqueOrThrow({ where: { email: "juan.rodriguez@gmail.com" }, include: { paciente: true } });
  const medicoA = await prisma.usuario.findUniqueOrThrow({ where: { email: "carlos.gomez@clinica.com" }, include: { medico: true } });

  pacienteMariaId = maria.paciente!.id;
  pacienteJuanId = juan.paciente!.id;
  medicoAId = medicoA.medico!.id;
  tokenMaria = tokenDe(maria.id, Rol.PACIENTE);
  tokenJuan = tokenDe(juan.id, Rol.PACIENTE);

  // Un segundo médico solo para el criterio 5 (el seed tiene uno)
  const medicoB = await prisma.usuario.create({
    data: {
      username: "medico.b.test",
      passwordHash: "no-se-usa",
      nombre: "Médico",
      apellido: "De Prueba",
      dni: "99000111",
      email: "medico.b@test.local",
      rol: Rol.MEDICO,
      medico: { create: { especialidad: "Traumatología", matricula: "MP-TEST-B" } },
    },
  });
  usuarioMedicoBId = medicoB.id;
  tokenMedicoB = tokenDe(medicoB.id, Rol.MEDICO);
});

afterAll(async () => {
  await prisma.turno.deleteMany({ where: { id: { in: turnosCreados } } });
  // El Medico se borra en cascada con su Usuario
  await prisma.usuario.delete({ where: { id: usuarioMedicoBId } });
  await prisma.$disconnect();
});

describe("Turnos del paciente con titularidad (T06)", () => {
  it("1. el paciente pide un turno: queda Pendiente y a su nombre aunque mande otro pacienteId", async () => {
    const res = await request(app)
      .post("/api/turnos")
      .set("Authorization", `Bearer ${tokenMaria}`)
      .send({ medicoId: medicoAId, fechaHora: FECHA_FUTURA, pacienteId: pacienteJuanId, estado: "Confirmado" });

    expect(res.status).toBe(201);
    turnosCreados.push(res.body.id);
    expect(res.body.pacienteId).toBe(pacienteMariaId);
    expect(res.body.estado).toBe(TurnoEstado.Pendiente);

    const mios = await request(app).get("/api/turnos").set("Authorization", `Bearer ${tokenMaria}`);
    expect(mios.body.map((t: { id: number }) => t.id)).toContain(res.body.id);
  });

  it("2. el paciente cancela su turno Pendiente: queda Cancelado (no se borra)", async () => {
    const turno = await turnoDeMaria(TurnoEstado.Pendiente);

    const res = await request(app)
      .patch(`/api/turnos/${turno.id}/cancelar`)
      .set("Authorization", `Bearer ${tokenMaria}`);

    expect(res.status).toBe(200);
    expect(res.body.estado).toBe(TurnoEstado.Cancelado);
    expect(await prisma.turno.findUnique({ where: { id: turno.id } })).not.toBeNull();
  });

  it("3. otro paciente no puede ver ni cancelar el turno: 404", async () => {
    const turno = await turnoDeMaria(TurnoEstado.Pendiente);

    const ver = await request(app).get(`/api/turnos/${turno.id}`).set("Authorization", `Bearer ${tokenJuan}`);
    const cancelar = await request(app).patch(`/api/turnos/${turno.id}/cancelar`).set("Authorization", `Bearer ${tokenJuan}`);

    expect(ver.status).toBe(404);
    expect(cancelar.status).toBe(404);
    expect((await prisma.turno.findUniqueOrThrow({ where: { id: turno.id } })).estado).toBe(TurnoEstado.Pendiente);
  });

  it("4. el paciente no puede cancelar un turno Confirmado: 409 con mensaje claro", async () => {
    const turno = await turnoDeMaria(TurnoEstado.Confirmado);

    const res = await request(app)
      .patch(`/api/turnos/${turno.id}/cancelar`)
      .set("Authorization", `Bearer ${tokenMaria}`);

    expect(res.status).toBe(409);
    expect(res.body).toEqual({ error: "El turno ya fue confirmado; comunicate con el consultorio" });
  });

  it("un turno que ya pasó no se cancela ni se confirma: 409", async () => {
    const turno = await turnoDeMaria(TurnoEstado.Pendiente, "2020-08-26T10:30:00.000Z");
    const secretaria = await prisma.usuario.findUniqueOrThrow({ where: { email: "ana.martinez@clinica.com" } });
    const tokenSecretaria = tokenDe(secretaria.id, Rol.SECRETARIA);

    const cancelar = await request(app).patch(`/api/turnos/${turno.id}/cancelar`).set("Authorization", `Bearer ${tokenSecretaria}`);
    const confirmar = await request(app)
      .put(`/api/turnos/${turno.id}`)
      .set("Authorization", `Bearer ${tokenSecretaria}`)
      .send({ estado: "Confirmado" });

    expect(cancelar.status).toBe(409);
    expect(confirmar.status).toBe(409);
    expect((await prisma.turno.findUniqueOrThrow({ where: { id: turno.id } })).estado).toBe(TurnoEstado.Pendiente);
  });

  it("5. un médico no ve el turno de otro médico: 404", async () => {
    const turno = await turnoDeMaria(TurnoEstado.Pendiente);

    const res = await request(app).get(`/api/turnos/${turno.id}`).set("Authorization", `Bearer ${tokenMedicoB}`);

    expect(res.status).toBe(404);
  });
});
