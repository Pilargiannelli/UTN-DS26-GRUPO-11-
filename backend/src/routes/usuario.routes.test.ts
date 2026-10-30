import { describe, it, expect, vi } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../app";
import { JWT_SECRET } from "../config/env";
import { Rol } from "../generated/prisma/enums";

// Mockeamos los controladores de usuarios
vi.mock("../controllers/usuario.controller", () => ({
  getMedicos: (req: any, res: any) => res.status(200).json([]),
  getPacientes: (req: any, res: any) => res.status(200).json([]),
  getUsuarios: (req: any, res: any) => res.status(200).json([]),
  createPaciente: (req: any, res: any) => res.status(201).json(req.body),
  updatePaciente: (req: any, res: any) => res.status(200).json(req.body),
  getPaciente: (_req: any, res: any) => res.status(200).json({ id: 1 }),
}));

const tokenDe = (rol: Rol) => jwt.sign({ sub: 1, rol }, JWT_SECRET, { expiresIn: "1h" });

describe("POST /api/pacientes - Matriz sin DB", () => {
  const pacienteValido = {
    nombre: "Ana",
    apellido: "Pérez",
    dni: "30123456",
    email: "ana@imos.test",
    telefono: "5492344555555",
    sexo: "Femenino",
    fechaNacimiento: "1990-05-20",
  };

  it("devuelve 401 sin token", async () => {
    const res = await request(app).post("/api/pacientes").send(pacienteValido);
    expect(res.status).toBe(401);
  });

  it.each([Rol.PACIENTE, Rol.MEDICO])("devuelve 403 para %s (el alta es de la secretaria, HU-001)", async (rol) => {
    const res = await request(app)
      .post("/api/pacientes")
      .set("Authorization", `Bearer ${tokenDe(rol)}`)
      .send(pacienteValido);
    expect(res.status).toBe(403);
  });

  it("devuelve 400 con detalles por campo si el body es inválido", async () => {
    const res = await request(app)
      .post("/api/pacientes")
      .set("Authorization", `Bearer ${tokenDe(Rol.SECRETARIA)}`)
      .send({ ...pacienteValido, dni: "abc", nombre: "" });

    expect(res.status).toBe(400);
    const campos = res.body.detalles.map((d: { campo: string }) => d.campo);
    expect(campos).toEqual(expect.arrayContaining(["dni", "nombre"]));
  });

  it("deja pasar a la SECRETARIA con un body válido (201)", async () => {
    const res = await request(app)
      .post("/api/pacientes")
      .set("Authorization", `Bearer ${tokenDe(Rol.SECRETARIA)}`)
      .send(pacienteValido);
    expect(res.status).toBe(201);
  });
});

describe("Usuario Routes - Matriz sin DB", () => {
  describe("GET /api/medicos", () => {
    it("debe permitir acceso público sin token (200)", async () => {
      const response = await request(app).get("/api/medicos");
      expect(response.status).toBe(200);
    });
  });

  describe("GET /api/pacientes", () => {
    it("debe retornar 401 si no se envía token", async () => {
      const response = await request(app).get("/api/pacientes");

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ error: "No autenticado" });
    });

    it("debe retornar 403 si el usuario autenticado no tiene el rol requerido (ej: PACIENTE)", async () => {
      const tokenPaciente = jwt.sign({ sub: 2, rol: Rol.PACIENTE }, JWT_SECRET, { expiresIn: "1h" });

      const response = await request(app)
        .get("/api/pacientes")
        .set("Authorization", `Bearer ${tokenPaciente}`);

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty("error");
    });

    it("debe retornar 200 si el usuario tiene rol permitido (ej: SECRETARIA o MEDICO)", async () => {
      const tokenSecretaria = jwt.sign({ sub: 3, rol: Rol.SECRETARIA }, JWT_SECRET, { expiresIn: "1h" });

      const response = await request(app)
        .get("/api/pacientes")
        .set("Authorization", `Bearer ${tokenSecretaria}`);

      expect(response.status).toBe(200);
    });
  });

  describe("GET /api/usuarios", () => {
    it("debe retornar 401 sin token y 403 con rol insuficiente", async () => {
      const resSinToken = await request(app).get("/api/usuarios");
      expect(resSinToken.status).toBe(401);

      const tokenPaciente = jwt.sign({ sub: 2, rol: Rol.PACIENTE }, JWT_SECRET, { expiresIn: "1h" });
      const resConRolBajo = await request(app)
        .get("/api/usuarios")
        .set("Authorization", `Bearer ${tokenPaciente}`);

      expect(resConRolBajo.status).toBe(403);
    });
  });

  describe("Manejo de rutas inexistentes (404)", () => {
    it("debe retornar 404 en formato JSON para rutas que no existen", async () => {
      const response = await request(app).get("/api/ruta-que-no-existe");

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: "Ruta no encontrada" });
    });
  });
});
describe("GET /api/pacientes/:id - Matriz sin DB", () => {
  it("401 sin token, 403 para PACIENTE y 200 para SECRETARIA y MEDICO", async () => {
    expect((await request(app).get("/api/pacientes/1")).status).toBe(401);
    expect((await request(app).get("/api/pacientes/1").set("Authorization", `Bearer ${tokenDe(Rol.PACIENTE)}`)).status).toBe(403);
    expect((await request(app).get("/api/pacientes/1").set("Authorization", `Bearer ${tokenDe(Rol.SECRETARIA)}`)).status).toBe(200);
    expect((await request(app).get("/api/pacientes/1").set("Authorization", `Bearer ${tokenDe(Rol.MEDICO)}`)).status).toBe(200);
  });

  it("un id no numérico responde 400", async () => {
    const res = await request(app).get("/api/pacientes/abc").set("Authorization", `Bearer ${tokenDe(Rol.MEDICO)}`);
    expect(res.status).toBe(400);
  });
});
