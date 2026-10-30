import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../app";
import { prisma } from "../config/prisma";
import { JWT_SECRET } from "../config/env";
import { Rol } from "../generated/prisma/enums";

/**
 * Historia clínica (HU-004 y HU-005). Requiere la BD con el seed: María
 * Flores tiene historia con alergias y antecedentes. Las entradas que crea
 * el test se borran en afterAll; las alergias de María se restauran.
 */

const tokenDe = (sub: number, rol: Rol) => jwt.sign({ sub, rol }, JWT_SECRET, { expiresIn: "1h" });

let tokenMedico: string;
let tokenMaria: string;
let tokenJuan: string;
let pacienteMariaId: number;
let alergiasOriginales: string[];
const DIAGNOSTICO_TEST = "Diagnóstico de prueba automatizada";

beforeAll(async () => {
  const medico = await prisma.usuario.findUniqueOrThrow({ where: { email: "carlos.gomez@clinica.com" } });
  const maria = await prisma.usuario.findUniqueOrThrow({ where: { email: "maria.flores@gmail.com" }, include: { paciente: true } });
  const juan = await prisma.usuario.findUniqueOrThrow({ where: { email: "juan.rodriguez@gmail.com" } });

  tokenMedico = tokenDe(medico.id, Rol.MEDICO);
  tokenMaria = tokenDe(maria.id, Rol.PACIENTE);
  tokenJuan = tokenDe(juan.id, Rol.PACIENTE);
  pacienteMariaId = maria.paciente!.id;

  const historia = await prisma.historiaClinica.findUnique({
    where: { pacienteId: pacienteMariaId },
    include: { alergias: true },
  });
  alergiasOriginales = historia?.alergias.map((a) => a.nombre) ?? [];
});

afterAll(async () => {
  await prisma.entradaClinica.deleteMany({ where: { diagnostico: DIAGNOSTICO_TEST } });
  const historia = await prisma.historiaClinica.findUnique({ where: { pacienteId: pacienteMariaId }, include: { antecedentes: true } });
  if (historia) {
    await request(app)
      .put(`/api/pacientes/${pacienteMariaId}/historia-clinica`)
      .set("Authorization", `Bearer ${tokenMedico}`)
      .send({ alergias: alergiasOriginales, antecedentes: historia.antecedentes.map((a) => a.nombre) });
  }
  await prisma.$disconnect();
});

const url = () => `/api/pacientes/${pacienteMariaId}/historia-clinica`;

describe("Historia clínica con DB", () => {
  it("el médico ve alergias, antecedentes y consultas de María (HU-005)", async () => {
    const res = await request(app).get(url()).set("Authorization", `Bearer ${tokenMedico}`);

    expect(res.status).toBe(200);
    expect(res.body.paciente).toMatchObject({ id: pacienteMariaId, nombre: "Maria" });
    expect(Array.isArray(res.body.alergias)).toBe(true);
    expect(Array.isArray(res.body.entradas)).toBe(true);
  });

  it("una consulta nueva aparece primera (HU-004)", async () => {
    const res = await request(app)
      .post(`${url()}/entradas`)
      .set("Authorization", `Bearer ${tokenMedico}`)
      .send({ diagnostico: DIAGNOSTICO_TEST, evolucion: "Evoluciona bien" });

    expect(res.status).toBe(201);
    expect(res.body.entradas[0].diagnostico).toBe(DIAGNOSTICO_TEST);
  });

  it("el médico reemplaza las alergias, y las nuevas se crean en el catálogo", async () => {
    const res = await request(app)
      .put(url())
      .set("Authorization", `Bearer ${tokenMedico}`)
      .send({ alergias: ["Látex de prueba"], antecedentes: [] });

    expect(res.status).toBe(200);
    expect(res.body.alergias).toEqual(["Látex de prueba"]);
    expect(res.body.antecedentes).toEqual([]);
  });

  it("María puede leer su historia", async () => {
    const res = await request(app).get(url()).set("Authorization", `Bearer ${tokenMaria}`);
    expect(res.status).toBe(200);
  });

  it("otro paciente pide la historia de María: 404", async () => {
    const res = await request(app).get(url()).set("Authorization", `Bearer ${tokenJuan}`);
    expect(res.status).toBe(404);
  });
});

describe("GET /api/pacientes con la última consulta", () => {
  it("el médico recibe la fecha de la última consulta; la secretaria no", async () => {
    const secretaria = await prisma.usuario.findUniqueOrThrow({ where: { email: "ana.martinez@clinica.com" } });
    const tokenSecretaria = tokenDe(secretaria.id, Rol.SECRETARIA);

    const comoMedico = await request(app).get("/api/pacientes").set("Authorization", `Bearer ${tokenMedico}`);
    const comoSecretaria = await request(app).get("/api/pacientes").set("Authorization", `Bearer ${tokenSecretaria}`);

    const maria = comoMedico.body.find((p: { id: number }) => p.id === pacienteMariaId);
    expect(maria).toHaveProperty("ultimaConsulta");
    expect(comoSecretaria.body.every((p: object) => !("ultimaConsulta" in p) && !("historiaClinica" in p))).toBe(true);
  });
});
