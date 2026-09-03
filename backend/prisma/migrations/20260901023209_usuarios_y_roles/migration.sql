-- CreateEnum
CREATE TYPE "Rol" AS ENUM ('PACIENTE', 'SECRETARIA', 'MEDICO');

-- RenameColumn
ALTER TABLE "Usuario"
RENAME COLUMN "contrasena" TO "passwordHash";

-- AddRole
ALTER TABLE "Usuario"
ADD COLUMN "rol" "Rol" NOT NULL DEFAULT 'PACIENTE';