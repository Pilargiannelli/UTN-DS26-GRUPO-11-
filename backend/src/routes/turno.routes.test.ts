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
  type Res = { status: (c: number) => { json: (b: unknown) => void } };
  const ok = (_req: unknown, res: Res) => res.status(200).json({ ok: true });
  // create devuelve el body ya validado: así se ve qué campos dejó pasar Zod
  const eco = (req: { body: unknown }, res: Res) => res.status(201).json(req.body);
  return { getAll: ok, getOcupados: ok, getById: ok, create: eco, cancelar: ok, update: ok, remove: ok };
});

const tokenDe = (rol: Rol, sub = 1) => jwt.sign({ sub, rol }, JWT_SECRET, { expiresIn: "1h" });

const tokenMedico = tokenDe(Rol.MEDICO);
const tokenSecretaria = tokenDe(Rol.SECRETARIA);
const tokenPaciente = tokenDe(Rol.PACIENTE);

type Metodo = "get" | "post" | "put" | "patch" | "delete";

// Las 7 rutas de /api/turnos con su fila de la matriz de permisos
// (Documentacion/06 - Seguridad/matriz-permisos.md, sección 8). `permitidos`
// son los roles que pasan el middleware; el resto debe recibir 403. Que el
// turno sea "propio" lo verifica el service (se prueba en el .db.test).
const todos = [Rol.MEDICO, Rol.SECRETARIA, Rol.PACIENTE];
const rutas: { metodo: Metodo; path: string; permitidos: Rol[] }[] = [
  { metodo: "get", path: "/api/turnos", permitidos: todos },
  { metodo: "get", path: "/api/turnos/ocupados", permitidos: todos },
  { metodo: "get", path: "/api/turnos/1", permitidos: todos },
  { metodo: "post", path: "/api/turnos", permitidos: todos },
  { metodo: "patch", path: "/api/turnos/1/cancelar", permitidos: todos },
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
      expect(res.body).toEqual({ error: "Token inválido" });
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

    it("PATCH /api/turnos/abc/cancelar devuelve 400 para un :id no numérico", async () => {
      const res = await request(app)
        .patch("/api/turnos/abc/cancelar")
        .set("Authorization", `Bearer ${tokenPaciente}`);

      expect(res.status).toBe(400);
    });
  });

  describe("POST /api/turnos como PACIENTE (turnoSolicitudSchema)", () => {
    it("devuelve 400 si falta fechaHora", async () => {
      const res = await request(app)
        .post("/api/turnos")
        .set("Authorization", `Bearer ${tokenPaciente}`)
        .send({ medicoId: 1 });

      expect(res.status).toBe(400);
      expect(res.body.detalles).toEqual(
        expect.arrayContaining([expect.objectContaining({ campo: "fechaHora" })])
      );
    });

    it("descarta pacienteId, estado y pagoValidado del body (los decide el back)", async () => {
      const res = await request(app)
        .post("/api/turnos")
        .set("Authorization", `Bearer ${tokenPaciente}`)
        .send({ medicoId: 1, fechaHora: "2030-01-10T10:00:00.000Z", pacienteId: 99, estado: "Confirmado", pagoValidado: true });

      expect(res.status).toBe(201);
      expect(Object.keys(res.body).sort()).toEqual(["fechaHora", "medicoId"]);
    });

    it("la secretaria sigue necesitando pacienteId (turnoCreateSchema)", async () => {
      const res = await request(app)
        .post("/api/turnos")
        .set("Authorization", `Bearer ${tokenSecretaria}`)
        .send({ medicoId: 1, fechaHora: "2030-01-10T10:00:00.000Z" });

      expect(res.status).toBe(400);
    });
  });
});
