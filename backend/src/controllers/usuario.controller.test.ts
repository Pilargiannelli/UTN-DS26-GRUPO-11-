import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Request, Response, NextFunction } from "express";

vi.mock("../services/usuario.service", () => ({
  listarUsuarios: vi.fn(),
  listarMedicos: vi.fn(),
  listarPacientes: vi.fn(),
}));
vi.mock("../services/paciente.service", () => ({
  buscarPorId: vi.fn(),
  actualizarPaciente: vi.fn(),
  crearPaciente: vi.fn(),
}));

import * as usuarioService from "../services/usuario.service";
import * as pacienteService from "../services/paciente.service";
import {
  getUsuarios,
  getMedicos,
  getPacientes,
  getPaciente,
  updatePaciente,
  createPaciente,
} from "./usuario.controller";

const usr = vi.mocked(usuarioService);
const pac = vi.mocked(pacienteService);

function mocks(req: Partial<Request> = {}) {
  const res = { status: vi.fn().mockReturnThis(), json: vi.fn().mockReturnThis() };
  const next = vi.fn();
  return {
    req: { params: { id: "6" }, ...req } as unknown as Request,
    res: res as unknown as Response & typeof res,
    next: next as unknown as NextFunction & typeof next,
  };
}

describe("usuario.controller", () => {
  beforeEach(() => vi.clearAllMocks());

  it("getUsuarios devuelve el listado", async () => {
    usr.listarUsuarios.mockResolvedValue([{ id: 1 }] as never);
    const { req, res, next } = mocks();

    await getUsuarios(req, res, next);

    expect(res.json).toHaveBeenCalledWith([{ id: 1 }]);
  });

  it("getMedicos devuelve el listado", async () => {
    usr.listarMedicos.mockResolvedValue([{ id: 2 }] as never);
    const { req, res, next } = mocks();

    await getMedicos(req, res, next);

    expect(res.json).toHaveBeenCalledWith([{ id: 2 }]);
  });

  it("getPacientes le pasa al service el rol del usuario del token", async () => {
    usr.listarPacientes.mockResolvedValue([] as never);
    const { req, res, next } = mocks({ usuario: { sub: 1, rol: "MEDICO" } as never });

    await getPacientes(req, res, next);

    expect(usr.listarPacientes).toHaveBeenCalledWith("MEDICO");
  });

  it("getPaciente convierte el :id a número", async () => {
    pac.buscarPorId.mockResolvedValue({ id: 6 } as never);
    const { req, res, next } = mocks();

    await getPaciente(req, res, next);

    expect(pac.buscarPorId).toHaveBeenCalledWith(6);
    expect(res.json).toHaveBeenCalledWith({ id: 6 });
  });

  it("updatePaciente pasa id, body y usuario", async () => {
    pac.actualizarPaciente.mockResolvedValue({ id: 6 } as never);
    const usuario = { sub: 1, rol: "SECRETARIA" } as never;
    const { req, res, next } = mocks({ body: { telefono: "1" }, usuario });

    await updatePaciente(req, res, next);

    expect(pac.actualizarPaciente).toHaveBeenCalledWith(6, { telefono: "1" }, usuario);
    expect(res.json).toHaveBeenCalledWith({ id: 6 });
  });

  it("createPaciente responde 201", async () => {
    pac.crearPaciente.mockResolvedValue({ id: 7 } as never);
    const { req, res, next } = mocks({ body: { dni: "1" } });

    await createPaciente(req, res, next);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ id: 7 });
  });

  it("todos los handlers pasan el error a next()", async () => {
    const error = new Error("x");
    for (const fn of [...Object.values(usr), ...Object.values(pac)]) {
      (fn as ReturnType<typeof vi.fn>).mockRejectedValue(error);
    }

    for (const handler of [getUsuarios, getMedicos, getPacientes, getPaciente, updatePaciente, createPaciente]) {
      const { req, res, next } = mocks({ body: {}, usuario: { sub: 1 } as never });
      await handler(req, res, next);
      expect(next).toHaveBeenCalledWith(error);
    }
  });
});
