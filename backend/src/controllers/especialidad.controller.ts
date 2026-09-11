import { Request, Response, NextFunction } from "express";
import * as especialidadService from "../services/especialidad.service";

export async function getAll(_req: Request, res: Response, next: NextFunction) {
  try {
    const especialidades = await especialidadService.listarEspecialidades();
    return res.json(especialidades);
  } catch (error) {
    return next(error);
  }
}