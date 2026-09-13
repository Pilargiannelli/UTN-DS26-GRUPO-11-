import { Request, Response } from "express";
import * as turnoService from "../services/turno.service";

export async function getAll(req: Request, res: Response) {
  try {
    // authenticate corre antes en la ruta, así que req.usuario siempre está.
    const turnos = await turnoService.findAllParaUsuario(req.usuario!);
    res.json(turnos);
  } catch (error) {
    res.status(500).json({ error: "Error interno del servidor" });
  }
}

export async function getById(req: Request, res: Response) {
  try {
    const turno = await turnoService.findById(Number(req.params.id));
    if (!turno) return res.status(404).json({ error: "Turno no encontrado" });
    res.json(turno);
  } catch (error) {
    res.status(500).json({ error: "Error interno del servidor" });
  }
}

export async function create(req: Request, res: Response) {
  try {
    const nuevo = await turnoService.create(req.body);
    res.status(201).json(nuevo);
  } catch (error) {
    res.status(500).json({ error: "Error interno del servidor" });
  }
}

export async function update(req: Request, res: Response) {
  try {
    const actualizado = await turnoService.update(Number(req.params.id), req.body);
    if (!actualizado) return res.status(404).json({ error: "Turno no encontrado" });
    res.json(actualizado);
  } catch (error) {
    res.status(500).json({ error: "Error interno del servidor" });
  }
}

export async function remove(req: Request, res: Response) {
  try {
    const ok = await turnoService.remove(Number(req.params.id));
    if (!ok) return res.status(404).json({ error: "Turno no encontrado" });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Error interno del servidor" });
  }
}
