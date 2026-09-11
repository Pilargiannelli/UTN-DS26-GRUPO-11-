import { prisma } from "../config/prisma";
import type { ObraSocial } from "../types/obraSocial.types";

export async function listarObrasSociales(): Promise<ObraSocial[]> {
  return prisma.obraSocial.findMany({
    orderBy: { nombre: "asc" },
  });
}