import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Request, Response, NextFunction } from "express";

vi.mock("../services/auth.service", () => ({
  registrar: vi.fn(),
  login: vi.fn(),
  actualizarPerfil: vi.fn(),
  cambiarPassword: vi.fn(),
  obtenerPerfil: vi.fn(),
}));

import * as authService from "../services/auth.service";
import { registro, login, actualizarPerfil, cambiarPassword, yo } from "./auth.controller";

const svc = vi.mocked(authService);

function mocks(req: Partial<Request> = {}) {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
    send: vi.fn().mockReturnThis(),
  };
  const next = vi.fn();
  return { req: req as Request, res: res as unknown as Response & typeof res, next: next as unknown as NextFunction & typeof next };
}

describe("auth.controller", () => {
  beforeEach(() => vi.clearAllMocks());

  describe("registro", () => {
    it("responde 201 con el paciente creado", async () => {
      svc.registrar.mockResolvedValue({ id: 1 } as never);
      const { req, res, next } = mocks({ body: { dni: "1" } });

      await registro(req, res, next);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ id: 1 });
    });

    it("pasa el error a next() si el service falla", async () => {
      const error = new Error("boom");
      svc.registrar.mockRejectedValue(error);
      const { req, res, next } = mocks({ body: {} });

      await registro(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe("login", () => {
    it("con credenciales válidas devuelve el resultado del service", async () => {
      svc.login.mockResolvedValue({ token: "t", usuario: { id: 1 } } as never);
      const { req, res, next } = mocks({ body: { email: "a@b.c", password: "x" } });

      await login(req, res, next);

      expect(res.json).toHaveBeenCalledWith({ token: "t", usuario: { id: 1 } });
    });

    it("con credenciales inválidas responde 401 con mensaje genérico", async () => {
      svc.login.mockResolvedValue(null);
      const { req, res, next } = mocks({ body: {} });

      await login(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: "Email o contraseña incorrectos" });
    });

    it("pasa el error a next() si el service falla", async () => {
      const error = new Error("db caída");
      svc.login.mockRejectedValue(error);
      const { req, res, next } = mocks({ body: {} });

      await login(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("actualizarPerfil", () => {
    it("usa el id del token (no del body) y devuelve el perfil", async () => {
      svc.actualizarPerfil.mockResolvedValue({ id: 5 } as never);
      const { req, res, next } = mocks({ usuario: { sub: 5, rol: "PACIENTE" } as never, body: { email: "x@y.z" } });

      await actualizarPerfil(req, res, next);

      expect(svc.actualizarPerfil).toHaveBeenCalledWith(5, { email: "x@y.z" });
      expect(res.json).toHaveBeenCalledWith({ id: 5 });
    });

    it("pasa el error a next()", async () => {
      const error = new Error("x");
      svc.actualizarPerfil.mockRejectedValue(error);
      const { req, res, next } = mocks({ usuario: { sub: 5 } as never, body: {} });

      await actualizarPerfil(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("cambiarPassword", () => {
    it("responde 204 sin cuerpo", async () => {
      svc.cambiarPassword.mockResolvedValue(undefined);
      const { req, res, next } = mocks({ usuario: { sub: 3 } as never, body: { passwordNueva: "x" } });

      await cambiarPassword(req, res, next);

      expect(svc.cambiarPassword).toHaveBeenCalledWith(3, { passwordNueva: "x" });
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
    });

    it("pasa el error a next()", async () => {
      const error = new Error("mal");
      svc.cambiarPassword.mockRejectedValue(error);
      const { req, res, next } = mocks({ usuario: { sub: 3 } as never, body: {} });

      await cambiarPassword(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("yo", () => {
    it("devuelve el perfil del usuario del token", async () => {
      svc.obtenerPerfil.mockResolvedValue({ id: 9 } as never);
      const { req, res, next } = mocks({ usuario: { sub: 9 } as never });

      await yo(req, res, next);

      expect(res.json).toHaveBeenCalledWith({ id: 9 });
    });

    it("responde 401 si el usuario del token ya no existe", async () => {
      svc.obtenerPerfil.mockResolvedValue(null);
      const { req, res, next } = mocks({ usuario: { sub: 9 } as never });

      await yo(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: "No autenticado" });
    });

    it("pasa el error a next()", async () => {
      const error = new Error("x");
      svc.obtenerPerfil.mockRejectedValue(error);
      const { req, res, next } = mocks({ usuario: { sub: 9 } as never });

      await yo(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
