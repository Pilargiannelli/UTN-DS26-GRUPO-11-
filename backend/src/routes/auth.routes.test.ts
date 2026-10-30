import { describe, it, expect, vi } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../app";
import { JWT_SECRET } from "../config/env";
import { Rol } from "../generated/prisma/enums";

// Mockeamos los controladores para aislar las rutas y probar los middlewares de validación y auth
vi.mock("../controllers/auth.controller", () => ({
  registro: (req: any, res: any) => res.status(201).json({ mensaje: "Registrado" }),
  login: (req: any, res: any) => res.status(200).json({ token: "fake-token" }),
  yo: (req: any, res: any) => res.status(200).json({ id: req.usuario.sub, rol: req.usuario.rol }),
  cambiarPassword: (_req: any, res: any) => res.status(204).send(),
  actualizarPerfil: (req: any, res: any) => res.status(200).json(req.body),
}));

describe("Auth Routes - Matriz sin DB", () => {
  describe("POST /api/auth/login", () => {
    it("debe retornar 400 si faltan campos obligatorios o el formato es inválido (Zod)", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({ email: "correo-invalido", password: "" });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error");
    });
  });

  describe("GET /api/auth/yo", () => {
    it("debe retornar 401 si no se provee token de autorización", async () => {
      const response = await request(app).get("/api/auth/yo");

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ error: "No autenticado" });
    });

    it("debe retornar 401 si el token es inválido o está vencido", async () => {
      const response = await request(app)
        .get("/api/auth/yo")
        .set("Authorization", "Bearer token_falso_invalido");

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ error: "Token inválido" });
    });

    it("debe retornar 200 si el token es válido", async () => {
      const tokenValido = jwt.sign({ sub: 1, rol: Rol.PACIENTE }, JWT_SECRET, { expiresIn: "1h" });
      const response = await request(app)
        .get("/api/auth/yo")
        .set("Authorization", `Bearer ${tokenValido}`);
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ id: 1, rol: Rol.PACIENTE });
    });
  });
});
describe("PATCH /api/auth/yo (Mi cuenta) - sin DB", () => {
  const token = () => jwt.sign({ sub: 1, rol: Rol.SECRETARIA }, JWT_SECRET, { expiresIn: "1h" });

  it("sin token responde 401", async () => {
    const res = await request(app).patch("/api/auth/yo").send({ nombre: "Ana", apellido: "M", email: "a@b.com" });
    expect(res.status).toBe(401);
  });

  it("un email inválido responde 400 con el campo", async () => {
    const res = await request(app)
      .patch("/api/auth/yo")
      .set("Authorization", `Bearer ${token()}`)
      .send({ nombre: "Ana", apellido: "Martínez", email: "no-es-email" });
    expect(res.status).toBe(400);
    expect(res.body.detalles[0].campo).toBe("email");
  });

  it("descarta el DNI y el rol del body (no se cambian desde Mi cuenta)", async () => {
    const res = await request(app)
      .patch("/api/auth/yo")
      .set("Authorization", `Bearer ${token()}`)
      .send({ nombre: "Ana", apellido: "Martínez", email: " Ana@Clinica.com ", dni: "1", rol: "MEDICO" });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ nombre: "Ana", apellido: "Martínez", email: "ana@clinica.com" });
  });
});
