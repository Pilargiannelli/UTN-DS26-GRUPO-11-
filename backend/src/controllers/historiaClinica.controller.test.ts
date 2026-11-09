import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Request, Response, NextFunction } from "express";

vi.mock("../services/historiaClinica.service", () => ({
  obtenerHistoria: vi.fn(),
  actualizarHistoria: vi.fn(),
  agregarEntrada: vi.fn(),
}));

import * as historiaService from "../services/historiaClinica.service";
import { getHistoria, updateHistoria, createEntrada } from "./historiaClinica.controller";

const svc = vi.mocked(historiaService);
const usuario = { sub: 4, rol: "MEDICO" } as never;

function mocks(req: Partial<Request> = {}) {
  const res = { status: vi.fn().mockReturnThis(), json: vi.fn().mockReturnThis() };
  const next = vi.fn();
  return {
    req: { params: { id: "12" }, usuario, ...req } as unknown as Request,
    res: res as unknown as Response & typeof res,
    next: next as unknown as NextFunction & typeof next,
  };
}

describe("historiaClinica.controller", () => {
  beforeEach(() => vi.clearAllMocks());

  it("getHistoria convierte el :id a número y pasa el usuario del token", async () => {
    svc.obtenerHistoria.mockResolvedValue({ alergias: [] } as never);
    const { req, res, next } = mocks();

    await getHistoria(req, res, next);

    expect(svc.obtenerHistoria).toHaveBeenCalledWith(12, usuario);
    expect(res.json).toHaveBeenCalledWith({ alergias: [] });
  });

  it("updateHistoria pasa el body al service", async () => {
    svc.actualizarHistoria.mockResolvedValue({ ok: true } as never);
    const { req, res, next } = mocks({ body: { alergias: ["Polen"], antecedentes: [] } });

    await updateHistoria(req, res, next);

    expect(svc.actualizarHistoria).toHaveBeenCalledWith(12, { alergias: ["Polen"], antecedentes: [] }, usuario);
    expect(res.json).toHaveBeenCalledWith({ ok: true });
  });

  it("createEntrada responde 201", async () => {
    svc.agregarEntrada.mockResolvedValue({ entradas: [1] } as never);
    const { req, res, next } = mocks({ body: { diagnostico: "d", evolucion: "e" } });

    await createEntrada(req, res, next);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ entradas: [1] });
  });

  it("los tres pasan el error a next() sin responder", async () => {
    const error = new Error("x");
    svc.obtenerHistoria.mockRejectedValue(error);
    svc.actualizarHistoria.mockRejectedValue(error);
    svc.agregarEntrada.mockRejectedValue(error);

    for (const handler of [getHistoria, updateHistoria, createEntrada]) {
      const { req, res, next } = mocks({ body: {} });
      await handler(req, res, next);
      expect(next).toHaveBeenCalledWith(error);
      expect(res.json).not.toHaveBeenCalled();
    }
  });
});
