import { z } from "zod";

// POST /api/turnos
export const turnoCreateSchema = z.object({
  fechaHora: z.coerce.date({ error: "La fecha y hora del turno son obligatorias" }),
  estado: z
    .enum(["Pendiente", "Confirmado", "Cancelado", "Reprogramado"])
    .optional(), // el default (Pendiente) lo pone Prisma
  idWhatsapp: z.string().trim().min(1, "El idWhatsapp no puede estar vacío").optional(),
  pagoValidado: z.boolean().optional(), // el default (false) lo pone Prisma
  medicoId: z.number().int().positive("El médico es obligatorio"),
  pacienteId: z.number().int().positive("El paciente es obligatorio"),
  secretariaId: z.number().int().positive("El id de la secretaria debe ser positivo").optional(),
});


export const turnoUpdateSchema = turnoCreateSchema.partial();
export const idParamSchema = z.object({
  id: z.coerce.number().int().positive("El id debe ser un número positivo"),
});

export type TurnoCreate = z.infer<typeof turnoCreateSchema>;
export type TurnoUpdate = z.infer<typeof turnoUpdateSchema>;