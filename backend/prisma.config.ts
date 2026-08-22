import "dotenv/config"; // Carga backend/.env para los comandos del CLI de Prisma
import path from "node:path";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  migrations: {
    path: path.join("prisma", "migrations"),
    // Lo ejecuta `prisma db seed`. El archivo lo crea la tarea del seed.
    seed: "tsx prisma/seed.ts",
  },
});
