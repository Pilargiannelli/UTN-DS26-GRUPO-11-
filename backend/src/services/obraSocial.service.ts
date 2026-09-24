import { prisma } from "../config/prisma";
import type { ObraSocial } from "../types/obraSocial.types";
import type { ObraSocialCreateInput } from "../validations/obraSocial.validation";

export async function listarObrasSociales(): Promise<ObraSocial[]> {
  return prisma.obraSocial.findMany({
    orderBy: { nombre: "asc" },
  });
}

export async function crearObraSocial(datos: ObraSocialCreateInput): Promise<ObraSocial> {
  return prisma.obraSocial.create({ data: datos });
}