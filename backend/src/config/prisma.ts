import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

// Adaptador de driver: Prisma 7 habla con Postgres a traves de `pg`.
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

// Singleton: en desarrollo, tsx watch recarga el modulo en cada cambio.
// Sin esto se abriria un pool de conexiones nuevo en cada recarga hasta
// agotar las conexiones de Postgres.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["query", "warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
