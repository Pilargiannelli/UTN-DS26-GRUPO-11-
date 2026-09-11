import { prisma } from "../config/prisma";

export async function listarEspecialidades() {
  const medicos = await prisma.medico.findMany({
    select: { especialidad: true },
    distinct: ["especialidad"],
  });

  return medicos
    .map((m) => m.especialidad)
    .filter((esp): esp is string => Boolean(esp))
    .sort();
}