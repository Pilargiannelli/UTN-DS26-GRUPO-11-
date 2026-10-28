import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/env";
import { Rol } from "../generated/prisma/enums";

export interface TokenPayload {
  sub: number;
  rol: Rol;
}

declare global {
  namespace Express {
    interface Request {
      usuario?: TokenPayload;
    }
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice("Bearer ".length) : undefined;

  if (!token) {
    return res.status(401).json({ error: "No autenticado" });
  }

  try {
    req.usuario = jwt.verify(token, JWT_SECRET) as unknown as TokenPayload;
    next();
  } catch (error) {
    // Vencido es lo normal después de JWT_EXPIRES_IN; inválido (mal firmado,
    // adulterado) es otra cosa, y conviene distinguirlos
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ error: "Tu sesión expiró" });
    }
    return res.status(401).json({ error: "Token inválido" });
  }
}

export function authorize(...rolesPermitidos: Rol[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const usuario = req.usuario;

    if (!usuario) {
      return res.status(401).json({ error: "No autenticado" });
    }

    if (!rolesPermitidos.includes(usuario.rol)) {
      return res.status(403).json({ error: "Acceso prohibido: no tenés los permisos requeridos" });
    }

    next();
  };
}