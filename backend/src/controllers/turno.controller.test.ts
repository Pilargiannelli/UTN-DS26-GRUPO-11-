import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

vi.mock("../services/turno.service", () => ({
  findAllParaUsuario: vi.fn(),
  horariosOcupados: vi.fn(),
  findByIdParaUsuario: vi.fn(),
  crearParaUsuario: vi.fn(),
  cancelarParaUsuario: vi.fn(),
  updateParaUsuario: vi.fn(),
  removeParaUsuario: vi.fn(),
}));

import * as turnoService from "../services/turno.service";
import { getAll, getOcupados, getById, create, cancelar, update, remove } from "./turno.controller";

const svc = vi.mocked(turnoService);
const usuario = { sub: 2, rol: "PACIENTE" } as never;

function mocks(req: Partial<Request> = {}) {
  const res = { status: vi.fn().mockReturnThis(), json: vi.fn().mockReturnThis(), send: vi.fn().mockReturnThis() };
  const next = vi.fn();
  return {
    req: { params: { id: "8" }, usuario, ...req } as unknown as Request,
    res: res as unknown as Response & typeof res,
    next: next as unknown as NextFunction & typeof next,
  };
}

describe("turno.controller", () => {
  beforeEach(() => vi.clearAllMocks());

  it("getAll devuelve los turnos del usuario", async () => {
    svc.findAllParaUsuario.mockResolvedValue([{ id: 1 }] as never);
    const { req, res, next } = mocks();

    await getAll(req, res, next);

    expect(svc.findAllParaUsuario).toHaveBeenCalledWith(usuario);
    expect(res.json).toHaveBeenCalledWith([{ id: 1 }]);
  });

  describe("getOcupados", () => {
    it("valida la query y llama al service con los parámetros ya convertidos", async () => {
      svc.horariosOcupados.mockResolvedValue([] as never);
      const { req, res, next } = mocks({
        query: { medicoId: "3", desde: "2026-06-01T00:00:00.000Z", hasta: "2026-06-08T00:00:00.000Z" },
      });

      await getOcupados(req, res, next);

      expect(svc.horariosOcupados).toHaveBeenCalledWith(3, expect.any(Date), expect.any(Date));
      expect(res.json).toHaveBeenCalledWith([]);
    });

    it("con una query inválida llama next(ZodError) sin tocar el service", async () => {
      const { req, res, next } = mocks({ query: { medicoId: "abc" } });

      await getOcupados(req, res, next);

      expect(next.mock.calls[0][0]).toBeInstanceOf(ZodError);
      expect(svc.horariosOcupados).not.toHaveBeenCalled();
    });
  });

  it("getById convierte el :id a número", async () => {
    svc.findByIdParaUsuario.mockResolvedValue({ id: 8 } as never);
    const { req, res, next } = mocks();

    await getById(req, res, next);

    expect(svc.findByIdParaUsuario).toHaveBeenCalledWith(8, usuario);
    expect(res.json).toHaveBeenCalledWith({ id: 8 });
  });

  it("create responde 201", async () => {
    svc.crearParaUsuario.mockResolvedValue({ id: 9 } as never);
    const { req, res, next } = mocks({ body: { medicoId: 1 } });

    await create(req, res, next);

    expect(svc.crearParaUsuario).toHaveBeenCalledWith({ medicoId: 1 }, usuario);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ id: 9 });
  });

  it("cancelar devuelve el turno cancelado", async () => {
    svc.cancelarParaUsuario.mockResolvedValue({ id: 8, estado: "Cancelado" } as never);
    const { req, res, next } = mocks();

    await cancelar(req, res, next);

    expect(svc.cancelarParaUsuario).toHaveBeenCalledWith(8, usuario);
    expect(res.json).toHaveBeenCalledWith({ id: 8, estado: "Cancelado" });
  });

  it("update pasa el body parcial al service", async () => {
    svc.updateParaUsuario.mockResolvedValue({ id: 8 } as never);
    const { req, res, next } = mocks({ body: { estado: "Confirmado" } });

    await update(req, res, next);

    expect(svc.updateParaUsuario).toHaveBeenCalledWith(8, { estado: "Confirmado" }, usuario);
  });

  it("remove responde 204 sin cuerpo", async () => {
    svc.removeParaUsuario.mockResolvedValue(undefined);
    const { req, res, next } = mocks();

    await remove(req, res, next);

    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.send).toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  it("todos los handlers pasan el error del service a next()", async () => {
    const error = new Error("x");
    for (const fn of Object.values(svc)) (fn as ReturnType<typeof vi.fn>).mockRejectedValue(error);

    for (const handler of [getAll, getById, create, cancelar, update, remove]) {
      const { req, res, next } = mocks({ body: {} });
      await handler(req, res, next);
      expect(next).toHaveBeenCalledWith(error);
    }
  });
});
