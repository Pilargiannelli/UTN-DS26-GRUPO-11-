import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/env";

export interface TokenPayload {
  sub: number;
  rol: string;
}

declare global {
  namespace Express {
    interface Request {
      usuario?: TokenPayload;
    }
  }
}

// Exige un JWT válido en el header Authorization: Bearer <token>.
// Deja el payload en req.usuario para que el resto de la request lo use
// (p. ej. GET /api/auth/yo, o el futuro middleware `authorize` por rol).
export function authenticate(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice("Bearer ".length) : undefined;

  if (!token) {
    return res.status(401).json({ error: "No autenticado" });
  }

  try {
    req.usuario = jwt.verify(token, JWT_SECRET) as unknown as TokenPayload;
    next();
  } catch {
    return res.status(401).json({ error: "Token inválido o vencido" });
  }
}
