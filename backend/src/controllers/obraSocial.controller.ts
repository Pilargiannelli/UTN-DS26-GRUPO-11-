import { Request, Response, NextFunction } from "express";
import * as obraSocialService from "../services/obraSocial.service";

export async function getAll(_req: Request, res: Response, next: NextFunction) {
  try {
    const obrasSociales = await obraSocialService.listarObrasSociales();
    return res.json(obrasSociales);
  } catch (error) {
    return next(error);
  }
}