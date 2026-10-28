import { Request, Response, NextFunction } from "express";
import * as historiaService from "../services/historiaClinica.service";

// :id es el id de Paciente (el router se monta con mergeParams)

export async function getHistoria(req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await historiaService.obtenerHistoria(Number(req.params.id), req.usuario!));
  } catch (error) {
    next(error);
  }
}

export async function updateHistoria(req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await historiaService.actualizarHistoria(Number(req.params.id), req.body, req.usuario!));
  } catch (error) {
    next(error);
  }
}

export async function createEntrada(req: Request, res: Response, next: NextFunction) {
  try {
    res.status(201).json(await historiaService.agregarEntrada(Number(req.params.id), req.body, req.usuario!));
  } catch (error) {
    next(error);
  }
}
