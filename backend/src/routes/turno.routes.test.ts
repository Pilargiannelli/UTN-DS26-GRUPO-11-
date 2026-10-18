import { describe, it, expect, vi } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../app";
import { JWT_SECRET } from "../config/env";
import { Rol } from "../generated/prisma/enums";

// Matriz sin DB: se mockea el controlador de turnos (la ruta correcta es
// ../controllers, relativa a este archivo) para que ningún request llegue a
// Prisma. Lo que se prueba acá son los middlewares authenticate / authorize.
vi.mock("../controllers/turno.controller", () => {
  const ok = (_req: unknown, res: { status: (c: number) => { json: (b: unknown) => void } }) =>
    res.status(200).json({ ok: true });
  return { getAll: ok, getById: ok, create: ok, update: ok, remove: ok };
});

const tokenDe = (rol: Rol, sub = 1) => jwt.sign({ sub, rol }, JWT_SECRET, { expiresIn: "1h" });

const tokenMedico = tokenDe(Rol.MEDICO);
const tokenSecretaria = tokenDe(Rol.SECRETARIA);
const tokenPaciente = tokenDe(Rol.PACIENTE);

type Metodo = "get" | "post" | "put" | "delete";

// Las 5 rutas de /api/turnos con su fila de la matriz de permisos
// (Documentacion/06 - Seguridad/matriz-permisos-ui.md). `permitidos` son los
// roles que pasan el middleware; el resto debe recibir 403.
const rutas: { metodo: Metodo; path: string; permitidos: Rol[] }[] = [
  { metodo: "get", path: "/api/turnos", permitidos: [Rol.MEDICO, Rol.SECRETARIA, Rol.PACIENTE] },
  { metodo: "get", path: "/api/turnos/1", permitidos: [Rol.MEDICO, Rol.SECRETARIA] },
  { metodo: "post", path: "/api/turnos", permitidos: [Rol.SECRETARIA, Rol.MEDICO] },
  { metodo: "put", path: "/api/turnos/1", permitidos: [Rol.MEDICO, Rol.SECRETARIA] },
  { metodo: "delete", path: "/api/turnos/1", permitidos: [Rol.MEDICO, Rol.SECRETARIA] },
];

describe("Turno Routes - Matriz sin DB", () => {
  describe.each(rutas)("$metodo $path", ({ metodo, path, permitidos }) => {
    it("devuelve 401 sin token", async () => {
      const res = await request(app)[metodo](path);

      expect(res.status).toBe(401);
      expect(res.body).toEqual({ error: "No autenticado" });
    });

    it("devuelve 401 con un token inválido", async () => {
      const res = await request(app)[metodo](path).set("Authorization", "Bearer token-falso");

      expect(res.status).toBe(401);
      expect(res.body).toEqual({ error: "Token inválido o vencido" });
    });

    it("devuelve 401 con un token firmado con otro secreto", async () => {
      const tokenAjeno = jwt.sign({ sub: 1, rol: Rol.SECRETARIA }, "otro-secreto", { expiresIn: "1h" });
      const res = await request(app)[metodo](path).set("Authorization", `Bearer ${tokenAjeno}`);

      expect(res.status).toBe(401);
    });

    if (!permitidos.includes(Rol.PACIENTE)) {
      it("devuelve 403 para PACIENTE", async () => {
        const res = await request(app)[metodo](path).set("Authorization", `Bearer ${tokenPaciente}`);

        expect(res.status).toBe(403);
        expect(res.body).toHaveProperty("error");
      });
    }

    it.each(permitidos)("deja pasar al rol %s (llega al controlador mockeado)", async (rol) => {
      const res = await request(app)[metodo](path).set("Authorization", `Bearer ${tokenDe(rol)}`);

      // Para POST/PUT sin body puede responder 400 de Zod: lo importante es
      // que no sea 401 ni 403, es decir, que los middlewares de auth pasaron.
      expect([401, 403]).not.toContain(res.status);
    });
  });

  describe("GET /api/turnos", () => {
    it("acepta a los tres roles y responde 200", async () => {
      for (const token of [tokenMedico, tokenSecretaria, tokenPaciente]) {
        const res = await request(app).get("/api/turnos").set("Authorization", `Bearer ${token}`);
        expect(res.status).toBe(200);
      }
    });
  });

  describe("validación de parámetros (400, después de pasar auth)", () => {
    it("GET /api/turnos/abc devuelve 400 para un :id no numérico", async () => {
      const res = await request(app)
        .get("/api/turnos/abc")
        .set("Authorization", `Bearer ${tokenSecretaria}`);

      expect(res.status).toBe(400);
    });
  });
});
