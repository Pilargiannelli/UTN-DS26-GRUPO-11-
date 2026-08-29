/*
  Warnings:

  - You are about to drop the column `alergias` on the `HistoriaClinica` table. All the data in the column will be lost.
  - You are about to drop the column `antecedentes` on the `HistoriaClinica` table. All the data in the column will be lost.
  - You are about to drop the column `nroAfiliado` on the `Paciente` table. All the data in the column will be lost.
  - You are about to drop the column `obraSocial` on the `Paciente` table. All the data in the column will be lost.
  - You are about to drop the column `plan` on the `Paciente` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Agenda" DROP CONSTRAINT "Agenda_medicoId_fkey";

-- DropForeignKey
ALTER TABLE "AsistenteIA" DROP CONSTRAINT "AsistenteIA_turnoId_fkey";

-- DropForeignKey
ALTER TABLE "EntradaClinica" DROP CONSTRAINT "EntradaClinica_historiaClinicaId_fkey";

-- DropForeignKey
ALTER TABLE "HistoriaClinica" DROP CONSTRAINT "HistoriaClinica_pacienteId_fkey";

-- AlterTable
ALTER TABLE "HistoriaClinica" DROP COLUMN "alergias",
DROP COLUMN "antecedentes";

-- AlterTable
ALTER TABLE "Paciente" DROP COLUMN "nroAfiliado",
DROP COLUMN "obraSocial",
DROP COLUMN "plan";

-- CreateTable
CREATE TABLE "Alergia" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "Alergia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Antecedente" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "Antecedente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ObraSocial" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "ObraSocial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cobertura" (
    "pacienteId" INTEGER NOT NULL,
    "obraSocialId" INTEGER NOT NULL,
    "nroAfiliado" TEXT NOT NULL,
    "plan" TEXT NOT NULL,
    "vigente" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Cobertura_pkey" PRIMARY KEY ("pacienteId","obraSocialId")
);

-- CreateTable
CREATE TABLE "BloqueoHorario" (
    "id" SERIAL NOT NULL,
    "medicoId" INTEGER NOT NULL,
    "desde" TIMESTAMP(3) NOT NULL,
    "hasta" TIMESTAMP(3) NOT NULL,
    "motivo" TEXT,

    CONSTRAINT "BloqueoHorario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_AlergiaToHistoriaClinica" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_AlergiaToHistoriaClinica_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_AntecedenteToHistoriaClinica" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_AntecedenteToHistoriaClinica_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Alergia_nombre_key" ON "Alergia"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Antecedente_nombre_key" ON "Antecedente"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "ObraSocial_nombre_key" ON "ObraSocial"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Cobertura_obraSocialId_nroAfiliado_key" ON "Cobertura"("obraSocialId", "nroAfiliado");

-- CreateIndex
CREATE INDEX "_AlergiaToHistoriaClinica_B_index" ON "_AlergiaToHistoriaClinica"("B");

-- CreateIndex
CREATE INDEX "_AntecedenteToHistoriaClinica_B_index" ON "_AntecedenteToHistoriaClinica"("B");

-- AddForeignKey
ALTER TABLE "HistoriaClinica" ADD CONSTRAINT "HistoriaClinica_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "Paciente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EntradaClinica" ADD CONSTRAINT "EntradaClinica_historiaClinicaId_fkey" FOREIGN KEY ("historiaClinicaId") REFERENCES "HistoriaClinica"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cobertura" ADD CONSTRAINT "Cobertura_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "Paciente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cobertura" ADD CONSTRAINT "Cobertura_obraSocialId_fkey" FOREIGN KEY ("obraSocialId") REFERENCES "ObraSocial"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Agenda" ADD CONSTRAINT "Agenda_medicoId_fkey" FOREIGN KEY ("medicoId") REFERENCES "Medico"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BloqueoHorario" ADD CONSTRAINT "BloqueoHorario_medicoId_fkey" FOREIGN KEY ("medicoId") REFERENCES "Medico"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AsistenteIA" ADD CONSTRAINT "AsistenteIA_turnoId_fkey" FOREIGN KEY ("turnoId") REFERENCES "Turno"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AlergiaToHistoriaClinica" ADD CONSTRAINT "_AlergiaToHistoriaClinica_A_fkey" FOREIGN KEY ("A") REFERENCES "Alergia"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AlergiaToHistoriaClinica" ADD CONSTRAINT "_AlergiaToHistoriaClinica_B_fkey" FOREIGN KEY ("B") REFERENCES "HistoriaClinica"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AntecedenteToHistoriaClinica" ADD CONSTRAINT "_AntecedenteToHistoriaClinica_A_fkey" FOREIGN KEY ("A") REFERENCES "Antecedente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AntecedenteToHistoriaClinica" ADD CONSTRAINT "_AntecedenteToHistoriaClinica_B_fkey" FOREIGN KEY ("B") REFERENCES "HistoriaClinica"("id") ON DELETE CASCADE ON UPDATE CASCADE;
