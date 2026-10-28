import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { Prisma } from "../generated/prisma/client";
import { ErrorNegocio } from "../errors/ErrorNegocio";

export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Error de validación de zod (400 Bad Request)
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: "Datos inválidos",
      detalles: err.issues.map((i) => ({
        campo: i.path.join("."),
        mensaje: i.message,
      })),
    });
  }

  // Reglas de negocio y titularidad lanzadas por los services (404, 409...)
  if (err instanceof ErrorNegocio) {
    return res.status(err.status).json({ error: err.message });
  }

  // Errores de Prisma Client
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // P2002: Violación de restricción @unique
    if (err.code === "P2002") {
      return res.status(409).json({
        error: "Ya existe un registro con ese valor único",
      });
    }

    // P2025: Registro no encontrado (para update/delete)
    if (err.code === "P2025") {
      return res.status(404).json({
        error: "El recurso solicitado no existe",
      });
    }

    // P2003: Violación de Clave Foránea (FK inexistente o Delete con Restrict)
    if (err.code === "P2003") {
      return res.status(409).json({
        error: "Operación no permitida: el registro está relacionado a otros datos o la referencia no existe",
      });
    }
  }

  // Error no controlado (500)
  console.error(err);
  return res.status(500).json({
    error: "Error interno del servidor",
  });
};