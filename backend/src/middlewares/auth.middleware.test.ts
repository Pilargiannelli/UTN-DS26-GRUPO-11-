import { describe, it, expect, vi } from "vitest";
import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { authenticate, authorize } from "./auth.middleware";
import { JWT_SECRET } from "../config/env"; // el de test, lo setea vitest.config.mts
import { Rol } from "../generated/prisma/enums";

// req, res y next falsos: los middlewares no saben si res es de Express o un
// objeto con dos vi.fn(). mockReturnThis() hace que res.status(403) devuelva
// res, para que .json(...) encadene como en el real.
function mocks(req: Partial<Request> = {}) {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as unknown as Response;
  const next = vi.fn() as unknown as NextFunction;
  return { req: req as Request, res, next };
}

function conToken(token: string) {
  return mocks({ headers: { authorization: `Bearer ${token}` } });
}

describe("authorize", () => {
  it("responde 403 a un PACIENTE cuando la ruta pide SECRETARIA", () => {
    const { req, res, next } = mocks({ usuario: { sub: 2, rol: Rol.PACIENTE } });

    authorize(Rol.SECRETARIA)(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      error: "Acceso prohibido: no tenés los permisos requeridos",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("deja pasar a un MEDICO cuando la ruta acepta MEDICO o SECRETARIA", () => {
    const { req, res, next } = mocks({ usuario: { sub: 5, rol: Rol.MEDICO } });

    authorize(Rol.MEDICO, Rol.SECRETARIA)(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  it("responde 401 si no hay usuario (authenticate no corrió antes)", () => {
    const { req, res, next } = mocks();

    authorize(Rol.SECRETARIA)(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });
});

describe("authenticate", () => {
  it("con un token válido llena req.usuario y llama a next", () => {
    const token = jwt.sign({ sub: 7, rol: Rol.PACIENTE }, JWT_SECRET, { expiresIn: "1h" });
    const { req, res, next } = conToken(token);

    authenticate(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    // toMatchObject y no toEqual: jwt.verify agrega iat y exp al payload
    expect(req.usuario).toMatchObject({ sub: 7, rol: Rol.PACIENTE });
    expect(res.status).not.toHaveBeenCalled();
  });

  it("401 'No autenticado' si no hay header Authorization", () => {
    const { req, res, next } = mocks({ headers: {} });

    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "No autenticado" });
    expect(next).not.toHaveBeenCalled();
  });

  it("401 'No autenticado' si el header no usa el esquema Bearer", () => {
    const token = jwt.sign({ sub: 7, rol: Rol.PACIENTE }, JWT_SECRET, { expiresIn: "1h" });
    const { req, res, next } = mocks({ headers: { authorization: token } });

    authenticate(req, res, next);

    expect(res.json).toHaveBeenCalledWith({ error: "No autenticado" });
    expect(next).not.toHaveBeenCalled();
  });

  // expiresIn: "-1s" fabrica un token ya vencido: no hay que esperar nada
  it("401 'Token inválido o vencido' con un token vencido", () => {
    const token = jwt.sign({ sub: 7, rol: Rol.PACIENTE }, JWT_SECRET, { expiresIn: "-1s" });
    const { req, res, next } = conToken(token);

    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Token inválido o vencido" });
    expect(next).not.toHaveBeenCalled();
  });

  it("401 'Token inválido o vencido' con un token firmado con otro secret", () => {
    const token = jwt.sign({ sub: 7, rol: Rol.SECRETARIA }, "otro-secret", { expiresIn: "1h" });
    const { req, res, next } = conToken(token);

    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Token inválido o vencido" });
    expect(next).not.toHaveBeenCalled();
    expect(req.usuario).toBeUndefined();
  });
});
