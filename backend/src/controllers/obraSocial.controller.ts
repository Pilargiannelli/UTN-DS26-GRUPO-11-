import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/prisma";

export async function getAll(_req: Request, res: Response, next: NextFunction) {
  try {
    const obrasSociales = await prisma.obraSocial.findMany({
      orderBy: { nombre: "asc" },
    });
    return res.json(obrasSociales);
  } catch (error) {
    return next(error);
  }
}