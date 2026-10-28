import { Request, Response, NextFunction } from "express";
import * as authService from "../services/auth.service";

export async function registro(req: Request, res: Response, next: NextFunction) {
  try {
    const nuevo = await authService.registrar(req.body);
    res.status(201).json(nuevo);
  } catch (error) {
    // El email/username/dni repetido lo resuelve errorHandler (P2002 -> 409).
    next(error);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const resultado = await authService.login(req.body);
    if (!resultado) {
      // Mensaje genérico: no distingue "email inexistente" de "contraseña
      // incorrecta" para no filtrar qué emails están registrados.
      return res.status(401).json({ error: "Email o contraseña incorrectos" });
    }
    res.json(resultado);
  } catch (error) {
    next(error);
  }
}

export async function cambiarPassword(req: Request, res: Response, next: NextFunction) {
  try {
    await authService.cambiarPassword(req.usuario!.sub, req.body);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

export async function yo(req: Request, res: Response, next: NextFunction) {
  try {
    const usuario = await authService.obtenerPerfil(req.usuario!.sub);
    if (!usuario) return res.status(401).json({ error: "No autenticado" });
    res.json(usuario);
  } catch (error) {
    next(error);
  }
}
