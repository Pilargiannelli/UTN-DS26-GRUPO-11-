import { describe, it, expect, vi } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../app";
import { JWT_SECRET } from "../config/env";
import { Rol } from "../generated/prisma/enums";

// Mockeamos los controladores de usuarios
vi.mock("../../controllers/usuario.controller", () => ({
  getMedicos: (req: any, res: any) => res.status(200).json([]),
  getPacientes: (req: any, res: any) => res.status(200).json([]),
  getUsuarios: (req: any, res: any) => res.status(200).json([]),
}));

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