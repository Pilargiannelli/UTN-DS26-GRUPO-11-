import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Request, Response, NextFunction } from "express";

vi.mock("../services/especialidad.service", () => ({ listarEspecialidades: vi.fn() }));
vi.mock("../services/obraSocial.service", () => ({ listarObrasSociales: vi.fn(), crearObraSocial: vi.fn() }));

import * as especialidadService from "../services/especialidad.service";
import * as obraSocialService from "../services/obraSocial.service";
import * as especialidadController from "./especialidad.controller";
import * as obraSocialController from "./obraSocial.controller";

// Controllers de catálogos: especialidades y obras sociales.
function mocks(req: Partial<Request> = {}) {
  const res = { status: vi.fn().mockReturnThis(), json: vi.fn().mockReturnThis() };
  const next = vi.fn();
  return { req: req as Request, res: res as unknown as Response & typeof res, next: next as unknown as NextFunction & typeof next };
}

describe("especialidad.controller", () => {
  beforeEach(() => vi.clearAllMocks());

  it("getAll devuelve la lista de especialidades", async () => {
    vi.mocked(especialidadService.listarEspecialidades).mockResolvedValue(["Clínica"]);
    const { req, res, next } = mocks();

    await especialidadController.getAll(req, res, next);

    expect(res.json).toHaveBeenCalledWith(["Clínica"]);
  });

  it("getAll pasa el error a next()", async () => {
    const error = new Error("x");
    vi.mocked(especialidadService.listarEspecialidades).mockRejectedValue(error);
    const { req, res, next } = mocks();

    await especialidadController.getAll(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });
});

describe("obraSocial.controller", () => {
  beforeEach(() => vi.clearAllMocks());

  it("getAll devuelve las obras sociales", async () => {
    vi.mocked(obraSocialService.listarObrasSociales).mockResolvedValue([{ id: 1, nombre: "OSDE" }] as never);
    const { req, res, next } = mocks();

    await obraSocialController.getAll(req, res, next);

    expect(res.json).toHaveBeenCalledWith([{ id: 1, nombre: "OSDE" }]);
  });

  it("create responde 201 con la obra social creada", async () => {
    vi.mocked(obraSocialService.crearObraSocial).mockResolvedValue({ id: 2, nombre: "PAMI" } as never);
    const { req, res, next } = mocks({ body: { nombre: "PAMI" } });

    await obraSocialController.create(req, res, next);

    expect(obraSocialService.crearObraSocial).toHaveBeenCalledWith({ nombre: "PAMI" });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ id: 2, nombre: "PAMI" });
  });

  it("getAll y create pasan los errores a next()", async () => {
    const error = new Error("x");
    vi.mocked(obraSocialService.listarObrasSociales).mockRejectedValue(error);
    vi.mocked(obraSocialService.crearObraSocial).mockRejectedValue(error);
    const a = mocks();
    const b = mocks({ body: {} });

    await obraSocialController.getAll(a.req, a.res, a.next);
    await obraSocialController.create(b.req, b.res, b.next);

    expect(a.next).toHaveBeenCalledWith(error);
    expect(b.next).toHaveBeenCalledWith(error);
  });
});
