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

// Solo SECRETARIA (ver obraSocial.routes.ts): la autorización real vale acá,
// no en que la UI oculte o no el botón "+ Nueva Obra Social".
export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const nueva = await obraSocialService.crearObraSocial(req.body);
    return res.status(201).json(nueva);
  } catch (error) {
    return next(error);
  }
}