import { prisma } from "../config/prisma";
import type { Especialidad } from "../types/especialidad.types";

export async function listarEspecialidades(): Promise<Especialidad[]> {
  const medicos = await prisma.medico.findMany({
    select: { especialidad: true },
    distinct: ["especialidad"],
  });

  return medicos
    .map((m) => m.especialidad)
    .filter((esp): esp is string => Boolean(esp))
    .sort();
}