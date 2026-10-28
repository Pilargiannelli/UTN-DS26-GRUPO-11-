import { Request, Response, NextFunction } from "express";
import * as turnoService from "../services/turno.service";
import { ocupadosQuerySchema } from "../validations/turno.validation";

// authenticate corre antes en todas las rutas de turnos, así que req.usuario
// siempre está. Los errores van a next(): el errorHandler traduce los de
// negocio (404 ajeno, 409 ya confirmado) y los de Prisma (P2003...).

export async function getAll(req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await turnoService.findAllParaUsuario(req.usuario!));
  } catch (error) {
    next(error);
  }
}

export async function getOcupados(req: Request, res: Response, next: NextFunction) {
  try {
    // La query se valida acá: validate() trabaja sobre req.body
    const { medicoId, desde, hasta } = ocupadosQuerySchema.parse(req.query);
    res.json(await turnoService.horariosOcupados(medicoId, desde, hasta));
  } catch (error) {
    next(error);
  }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await turnoService.findByIdParaUsuario(Number(req.params.id), req.usuario!));
  } catch (error) {
    next(error);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    res.status(201).json(await turnoService.crearParaUsuario(req.body, req.usuario!));
  } catch (error) {
    next(error);
  }
}

export async function cancelar(req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await turnoService.cancelarParaUsuario(Number(req.params.id), req.usuario!));
  } catch (error) {
    next(error);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await turnoService.updateParaUsuario(Number(req.params.id), req.body, req.usuario!));
  } catch (error) {
    next(error);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    await turnoService.removeParaUsuario(Number(req.params.id), req.usuario!);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
