import "dotenv/config"; // Carga backend/.env para los comandos del CLI de Prisma
import path from "node:path";
import { defineConfig } from "prisma/config";
import { PrismaPg } from "@prisma/adapter-pg";

export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),

  migrations: {
    path: path.join("prisma", "migrations"),
    // Lo ejecuta `prisma db seed`. El archivo lo crea la tarea del seed.
    seed: "tsx prisma/seed.ts",
  },

  // Conexion directa que necesita `prisma migrate` para crear la shadow
  // database con la que valida las migraciones.
  datasource: {
    url: process.env.DATABASE_URL,
  },

  // Prisma 7 se conecta a Postgres a traves de un driver adapter.
  // Lo usan el runtime, `prisma studio` y `prisma db seed`.
  adapter: async () => {
    return new PrismaPg({ connectionString: process.env.DATABASE_URL });
  },
});