import { Request, Response, NextFunction } from "express";
import * as usuarioService from "../services/usuario.service";
import * as pacienteService from "../services/paciente.service";

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

export async function createPaciente(req: Request, res: Response, next: NextFunction) {
  try {
    // DNI o email repetido -> ErrorNegocio 409 con el mensaje del campo
    const paciente = await pacienteService.crearPaciente(req.body);
    return res.status(201).json(paciente);
  } catch (error) {
    return next(error);
  }
}