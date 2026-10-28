import { z } from "zod";

export const SEXOS = ["Masculino", "Femenino", "Otro"] as const;

// Datos de un paciente nuevo (HU-001). Los usan POST /api/pacientes (la
// secretaria da de alta) y POST /api/auth/registro (autoregistro, que además
// suma la contraseña: ver auth.validation.ts).
export const pacienteCreateSchema = z.object({
  nombre: z.string().trim().min(1, "El nombre es obligatorio"),
  apellido: z.string().trim().min(1, "El apellido es obligatorio"),
  dni: z.string().trim().regex(/^\d{7,8}$/, "El DNI debe tener 7 u 8 números"),
  // Normalizado: "Ana@Mail.com " y "ana@mail.com" son el mismo email
  email: z.string().trim().toLowerCase().pipe(z.email("El email no es válido")),
  // Con código de país, para el futuro aviso por WhatsApp (nota de HU-001)
  telefono: z.string().trim().regex(/^\+?\d{8,15}$/, "El teléfono debe tener entre 8 y 15 números"),
  sexo: z.enum(SEXOS, { error: "El sexo no es válido" }),
  fechaNacimiento: z.coerce
    .date({ error: "La fecha de nacimiento no es válida" })
    .refine((fecha) => fecha <= new Date(), "La fecha de nacimiento no puede ser futura"),
  // Opcional: un paciente sin obra social no manda cobertura
  cobertura: z
    .object({
      obraSocialId: z.number().int().positive("La obra social no es válida"),
      nroAfiliado: z.string().trim().min(1, "El número de afiliado es obligatorio"),
      plan: z.string().trim().min(1, "El plan es obligatorio"),
    })
    .optional(),
});

export type PacienteCreate = z.infer<typeof pacienteCreateSchema>;
