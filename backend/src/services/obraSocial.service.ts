import { prisma } from "../config/prisma";

export async function listarObrasSociales() {
  return prisma.obraSocial.findMany({
    orderBy: { nombre: "asc" },
  });
}