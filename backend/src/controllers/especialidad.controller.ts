import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/prisma";

export async function getAll(_req: Request, res: Response, next: NextFunction) {
  try {
    // Busca los médicos que tengan especialidad cargada y obtiene las especialidades únicas
    const medicos = await prisma.medico.findMany({
      select: { especialidad: true },
      distinct: ["especialidad"],
    });

    const especialidades = medicos
      .map((m) => m.especialidad)
      .filter((esp): esp is string => Boolean(esp))
      .sort();

    return res.json(especialidades);
  } catch (error) {
    return next(error);
  }
}