import { z } from "zod";

// Formulario de alta de turno (NuevoTurnoModal). El back espera fechaHora +
// medicoId + pacienteId (backend/src/validations/turno.validation.ts); acá
// separamos fecha/hora para la UI y los combinamos antes de mandarlos.
export const turnoSchema = z.object({
  pacienteId: z.coerce.number().int().positive("Seleccione un paciente"),

  medicoId: z.coerce.number().int().positive("Seleccione un médico"),

  fecha: z
    .string()
    .min(1, "Seleccione una fecha"),

  hora: z
    .string()
    .min(1, "Seleccione un horario"),

  // Un turno nuevo solo puede nacer Pendiente o Confirmado
  estado: z.enum(["Pendiente", "Confirmado"]),
});

export type TurnoForm = z.infer<typeof turnoSchema>;
