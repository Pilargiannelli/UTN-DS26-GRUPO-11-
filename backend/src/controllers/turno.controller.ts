import { Request, Response } from "express";
import * as turnoService from "../services/turno.service";

export function getAll(_req: Request, res: Response) {
  res.json(turnoService.findAll());
}

export function getById(req: Request, res: Response) {
  const turno = turnoService.findById(Number(req.params.id));
  if (!turno) return res.status(404).json({ error: "Turno no encontrado" });
  res.json(turno);
}

export function create(req: Request, res: Response) {
  const nuevo = turnoService.create(req.body);
  res.status(201).json(nuevo);
}

export function update(req: Request, res: Response) {
  const actualizado = turnoService.update(Number(req.params.id), req.body);
  if (!actualizado) return res.status(404).json({ error: "Turno no encontrado" });
  res.json(actualizado);
}

export function remove(req: Request, res: Response) {
  const ok = turnoService.remove(Number(req.params.id));
  if (!ok) return res.status(404).json({ error: "Turno no encontrado" });
  res.status(204).send();
}