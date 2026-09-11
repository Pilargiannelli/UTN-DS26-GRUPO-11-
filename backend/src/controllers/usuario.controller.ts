import { Request, Response, NextFunction } from "express";
import * as usuarioService from "../services/usuario.service";

export async function getUsuarios(_req: Request, res: Response, next: NextFunction) {
  try {
    const usuarios = await usuarioService.listarUsuarios();
    return res.json(usuarios);
  } catch (error) {
    return next(error);
  }
}

export async function getMedicos(_req: Request, res: Response, next: NextFunction) {
  try {
    const medicos = await usuarioService.listarMedicos();
    return res.json(medicos);
  } catch (error) {
    return next(error);
  }
}

export async function getPacientes(_req: Request, res: Response, next: NextFunction) {
  try {
    const pacientes = await usuarioService.listarPacientes();
    return res.json(pacientes);
  } catch (error) {
    return next(error);
  }
}