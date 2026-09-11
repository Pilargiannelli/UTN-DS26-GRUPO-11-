import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/prisma";

// GET /api/usuarios
export async function getUsuarios(_req: Request, res: Response, next: NextFunction) {
  try {
    const usuarios = await prisma.usuario.findMany({
      select: {
        id: true,
        email: true,
        rol: true,
        nombre: true,
        apellido: true,
        dni: true,
        telefono: true,
      },
    });
    return res.json(usuarios);
  } catch (error) {
    return next(error);
  }
}

// GET /api/medicos
export async function getMedicos(_req: Request, res: Response, next: NextFunction) {
  try {
    const medicos = await prisma.medico.findMany({
      include: {
        usuario: {
          select: {
            nombre: true,
            apellido: true,
            email: true,
            telefono: true,
          },
        },
      },
    });
    return res.json(medicos);
  } catch (error) {
    return next(error);
  }
}

// GET /api/pacientes
export async function getPacientes(_req: Request, res: Response, next: NextFunction) {
  try {
    const pacientes = await prisma.paciente.findMany({
      include: {
        usuario: {
          select: {
            nombre: true,
            apellido: true,
            email: true,
            dni: true,
            telefono: true,
          },
        },
        obraSocial: true,
      },
    });
    return res.json(pacientes);
  } catch (error) {
    return next(error);
  }
}