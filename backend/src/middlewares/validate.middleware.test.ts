import { describe, it, expect, vi } from "vitest";
import { z, ZodError } from "zod";
import type { Request, Response } from "express";
import { validate, validateParams } from "./validate.middleware";

const schema = z.object({ nombre: z.string().trim().min(1) });
const res = {} as Response;

describe("validate (body)", () => {
  it("con un body válido reemplaza req.body por el dato parseado y llama next() sin error", () => {
    const req = { body: { nombre: "  Ana  " } } as Request;
    const next = vi.fn();

    validate(schema)(req, res, next);

    expect(req.body).toEqual({ nombre: "Ana" });
    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith();
  });

  it("con un body inválido llama next(ZodError) y no toca req.body", () => {
    const req = { body: { nombre: "" } } as Request;
    const next = vi.fn();

    validate(schema)(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next.mock.calls[0][0]).toBeInstanceOf(ZodError);
    expect(req.body).toEqual({ nombre: "" });
  });
});

describe("validateParams", () => {
  const idSchema = z.object({ id: z.coerce.number().int().positive() });

  it("con params válidos llama next() sin error", () => {
    const req = { params: { id: "5" } } as unknown as Request;
    const next = vi.fn();

    validateParams(idSchema)(req, res, next);

    expect(next).toHaveBeenCalledWith();
  });

  it("con params inválidos llama next(ZodError)", () => {
    const req = { params: { id: "abc" } } as unknown as Request;
    const next = vi.fn();

    validateParams(idSchema)(req, res, next);

    expect(next.mock.calls[0][0]).toBeInstanceOf(ZodError);
  });
});
