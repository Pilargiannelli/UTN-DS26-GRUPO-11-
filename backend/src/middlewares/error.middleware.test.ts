import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { z } from "zod";
import type { Request, Response, NextFunction } from "express";
import { Prisma } from "../generated/prisma/client";
import { ErrorNegocio } from "../errors/ErrorNegocio";
import { errorHandler } from "./error.middleware";

function armarRes() {
  const res = { status: vi.fn(), json: vi.fn() };
  res.status.mockReturnValue(res);
  return res;
}

function ejecutar(err: unknown) {
  const res = armarRes();
  errorHandler(err, {} as Request, res as unknown as Response, vi.fn() as NextFunction);
  return res;
}

function errorPrisma(code: string) {
  return new Prisma.PrismaClientKnownRequestError("falló", { code, clientVersion: "test" });
}

describe("errorHandler", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("traduce un ZodError a 400 con el detalle por campo", () => {
    const resultado = z.object({ precio: z.number().positive("Debe ser positivo") }).safeParse({ precio: -5 });
    if (resultado.success) throw new Error("el schema debería fallar");

    const res = ejecutar(resultado.error);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "Datos inválidos",
      detalles: [{ campo: "precio", mensaje: "Debe ser positivo" }],
    });
  });

  it("traduce un ErrorNegocio a su status y mensaje", () => {
    const res = ejecutar(new ErrorNegocio(409, "Turno ocupado"));

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({ error: "Turno ocupado" });
  });

  it.each([
    ["P2002", 409, "Ya existe un registro con ese valor único"],
    ["P2025", 404, "El recurso solicitado no existe"],
    [
      "P2003",
      409,
      "Operación no permitida: el registro está relacionado a otros datos o la referencia no existe",
    ],
  ])("traduce el error de Prisma %s a %i", (code, status, mensaje) => {
    const res = ejecutar(errorPrisma(code));

    expect(res.status).toHaveBeenCalledWith(status);
    expect(res.json).toHaveBeenCalledWith({ error: mensaje });
  });

  it("un error de Prisma con otro código cae en 500", () => {
    const res = ejecutar(errorPrisma("P9999"));

    expect(res.status).toHaveBeenCalledWith(500);
  });

  it("un error desconocido responde 500 genérico, sin filtrar el mensaje original, y lo loguea", () => {
    const res = ejecutar(new Error("secreto interno"));

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Error interno del servidor" });
    expect(console.error).toHaveBeenCalled();
  });
});
