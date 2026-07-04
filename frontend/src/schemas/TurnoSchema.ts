import { z } from "zod";

export const turnoSchema = z.object({
  paciente: z
    .string()
    .trim()
    .min(3, "Ingrese el paciente"),

  medico: z
    .string()
    .trim()
    .min(3, "Seleccione un médico"),

  especialidad: z
    .string()
    .trim()
    .min(3, "Ingrese la especialidad"),

  fecha: z
    .string()
    .min(1, "Seleccione una fecha"),

  hora: z
    .string()
    .min(1, "Seleccione un horario"),

  obraSocial: z
    .string()
    .trim()
    .min(2, "Ingrese la obra social"),

  estado: z.enum([
    "Pendiente",
    "Confirmado",
    "Cancelado",
  ]),
});

export type TurnoForm = z.infer<typeof turnoSchema>;