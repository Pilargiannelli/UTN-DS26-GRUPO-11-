import { describe, it, expect, afterAll } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../app";
import { prisma } from "../config/prisma";
import { JWT_SECRET } from "../config/env";
import { Rol } from "../generated/prisma/enums";

/**
 * Pruebas de integración reales contra la Base de Datos para las rutas de Turnos.
 * Requieren la BD levantada en Docker y el seed ejecutado.
 */

describe("Turno Routes - Integración con DB (Real)", () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe("GET /api/turnos", () => {
    it("debe retornar 200 y la lista de turnos reales de la base de datos para la Secretaria", async () => {
      // 1. Buscamos el usuario secretaria creado en el seed para obtener su ID
      const secretaria = await prisma.usuario.findUnique({
        where: { email: "ana.martinez@clinica.com" },
      });

      expect(secretaria).not.toBeNull();

      // 2. Generamos un token válido para la secretaria
      const tokenSecretaria = jwt.sign(
        { sub: secretaria!.id, rol: Rol.SECRETARIA },
        JWT_SECRET,
        { expiresIn: "1h" }
      );

      // 3. Consultamos el endpoint real
      const response = await request(app)
        .get("/api/turnos")
        .set("Authorization", `Bearer ${tokenSecretaria}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      
      // Verificamos estructura del primer turno devuelto por la DB
      expect(response.body[0]).toHaveProperty("id");
      expect(response.body[0]).toHaveProperty("estado");
      expect(response.body[0]).toHaveProperty("fechaHora");
    });

    it("debe retornar 200 y permitir al Paciente consultar sus propios turnos desde la DB", async () => {
      // 1. Buscamos el usuario paciente creado en el seed
      const paciente = await prisma.usuario.findUnique({
        where: { email: "maria.flores@gmail.com" },
      });

      expect(paciente).not.toBeNull();

      // 2. Generamos token de PACIENTE
      const tokenPaciente = jwt.sign(
        { sub: paciente!.id, rol: Rol.PACIENTE },
        JWT_SECRET,
        { expiresIn: "1h" }
      );

      // 3. Consultamos el endpoint
      const response = await request(app)
        .get("/api/turnos")
        .set("Authorization", `Bearer ${tokenPaciente}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe("GET /api/turnos/:id", () => {
    it("debe retornar 200 y los detalles del turno específico desde la DB", async () => {
      // 1. Obtenemos un turno existente directamente desde Prisma
      const turnoExistente = await prisma.turno.findFirst();
      expect(turnoExistente).not.toBeNull();

      // 2. Generamos token de Secretaria
      const secretaria = await prisma.usuario.findUnique({
        where: { email: "ana.martinez@clinica.com" },
      });
      const tokenSecretaria = jwt.sign(
        { sub: secretaria!.id, rol: Rol.SECRETARIA },
        JWT_SECRET,
        { expiresIn: "1h" }
      );

      // 3. Consultamos la ruta con el ID real
      const response = await request(app)
        .get(`/api/turnos/${turnoExistente!.id}`)
        .set("Authorization", `Bearer ${tokenSecretaria}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("id", turnoExistente!.id);
    });
  });
});