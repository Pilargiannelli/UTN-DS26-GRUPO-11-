import { prisma } from "../config/prisma";
import { Turno } from "../types/turno.types";

// El array en memoria y el proximoId se van: ahora los datos viven en PostgreSQL.

export async function findAll(): Promise<Turno[]> {
  return prisma.turno.findMany();
}

export async function findById(id: number): Promise<Turno | null> {
  return prisma.turno.findUnique({ where: { id } });
}

export async function create(datos: Omit<Turno, "id">): Promise<Turno> {
  return prisma.turno.create({ data: datos });
}

export async function update(id: number, datos: Omit<Turno, "id">): Promise<Turno | null> {
  const existe = await prisma.turno.findUnique({ where: { id } });
  if (!existe) return null;
  return prisma.turno.update({ where: { id }, data: datos });
}

export async function remove(id: number): Promise<boolean> {
  const existe = await prisma.turno.findUnique({ where: { id } });
  if (!existe) return false;
  await prisma.turno.delete({ where: { id } });
  return true;
}
