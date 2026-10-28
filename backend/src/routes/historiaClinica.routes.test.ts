import { describe, it, expect, vi } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../app";
import { JWT_SECRET } from "../config/env";
import { Rol } from "../generated/prisma/enums";

// Matriz sin DB de la historia clínica (§10): el controlador está mockeado,
// lo que se prueba son authenticate, authorize y la validación del body.
vi.mock("../controllers/historiaClinica.controller", () => {
  type Res = { status: (c: number) => { json: (b: unknown) => void } };
  const ok = (_req: unknown, res: Res) => res.status(200).json({ ok: true });
  return { getHistoria: ok, updateHistoria: ok, createEntrada: ok };
});

const tokenDe = (rol: Rol) => jwt.sign({ sub: 1, rol }, JWT_SECRET, { expiresIn: "1h" });
const URL = "/api/pacientes/1/historia-clinica";
const entradaValida = { diagnostico: "Esguince de tobillo", evolucion: "Reposo 7 días" };

describe("Historia clínica - Matriz sin DB", () => {
  it("sin token responde 401", async () => {
    expect((await request(app).get(URL)).status).toBe(401);
  });

  it("la SECRETARIA recibe 403 en las tres operaciones", async () => {
    const token = `Bearer ${tokenDe(Rol.SECRETARIA)}`;
    expect((await request(app).get(URL).set("Authorization", token)).status).toBe(403);
    expect((await request(app).put(URL).set("Authorization", token).send({ alergias: [], antecedentes: [] })).status).toBe(403);
    expect((await request(app).post(`${URL}/entradas`).set("Authorization", token).send(entradaValida)).status).toBe(403);
  });

  it("el PACIENTE puede leer pero no escribir", async () => {
    const token = `Bearer ${tokenDe(Rol.PACIENTE)}`;
    expect((await request(app).get(URL).set("Authorization", token)).status).toBe(200);
    expect((await request(app).post(`${URL}/entradas`).set("Authorization", token).send(entradaValida)).status).toBe(403);
  });

  it("una entrada sin diagnóstico responde 400", async () => {
    const res = await request(app)
      .post(`${URL}/entradas`)
      .set("Authorization", `Bearer ${tokenDe(Rol.MEDICO)}`)
      .send({ evolucion: "Reposo" });

    expect(res.status).toBe(400);
    expect(res.body.detalles[0].campo).toBe("diagnostico");
  });

  it("un id de paciente no numérico responde 400", async () => {
    const res = await request(app).get("/api/pacientes/abc/historia-clinica").set("Authorization", `Bearer ${tokenDe(Rol.MEDICO)}`);
    expect(res.status).toBe(400);
  });
});
