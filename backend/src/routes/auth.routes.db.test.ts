import { describe, it, expect, afterAll } from "vitest";
import request from "supertest";
import app from "../app";
import { prisma } from "../config/prisma";

/**
 * Pruebas de integración reales contra la Base de Datos.
 * Requieren la BD levantada con los seeds cargados.
 */

describe("Auth Routes - Integración con DB (Real)", () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe("POST /api/auth/login", () => {
    it("debe retornar 200, el token y el usuario sin passwordHash con credenciales válidas", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: "maria.flores@gmail.com",
          password: "Paciente1234",
        });

      expect(response.status).toBe(200);
      expect(response.body.token).toEqual(expect.any(String));
      expect(response.body.usuario).toMatchObject({
        email: "maria.flores@gmail.com",
      });
      // Verificación de seguridad: no expone la contraseña encriptada
      expect(response.body.usuario).not.toHaveProperty("passwordHash");
    });

    it("debe retornar 401 si la contraseña es incorrecta", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: "maria.flores@gmail.com",
          password: "ContrasenaIncorrecta123",
        });

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ error: "Email o contraseña incorrectos" });
    });

    it("debe retornar 401 si el email no existe en la DB", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: "inexistente@clinica.test",
          password: "Paciente1234",
        });

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ error: "Email o contraseña incorrectos" });
    });
  });

  describe("GET /api/auth/yo", () => {
    it("debe retornar 200 y la información del usuario autenticado desde la DB", async () => {
      // 1. Obtenemos un token real autenticándonos contra el usuario del seed
      const loginResponse = await request(app)
        .post("/api/auth/login")
        .send({
          email: "maria.flores@gmail.com",
          password: "Paciente1234",
        });

      const tokenValido = loginResponse.body.token;

      // 2. Realizamos la consulta a /api/auth/yo con el token obtenido
      const response = await request(app)
        .get("/api/auth/yo")
        .set("Authorization", `Bearer ${tokenValido}`);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        email: "maria.flores@gmail.com",
      });
      expect(response.body).not.toHaveProperty("passwordHash");
    });
  });
});