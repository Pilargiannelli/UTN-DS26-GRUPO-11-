import { z } from "zod";

// Datos para el alta de un médico nuevo (POST /api/medicos).
export const medicoCreateSchema = z.object({
  nombre: z.string().trim().min(1, "El nombre es obligatorio"),
  apellido: z.string().trim().min(1, "El apellido es obligatorio"),
  dni: z.string().trim().regex(/^\d{7,8}$/, "El DNI debe tener 7 u 8 números"),
  // Normalizado a minúsculas, igual que en pacienteCreateSchema
  email: z.string().trim().toLowerCase().pipe(z.email("El email no es válido")),
  telefono: z.string().trim().regex(/^\+?\d{8,15}$/, "El teléfono debe tener entre 8 y 15 números"),
  especialidad: z.string().trim().min(1, "La especialidad es obligatoria"),
  matricula: z.string().trim().min(1, "La matrícula es obligatoria"),
});

export type MedicoCreate = z.infer<typeof medicoCreateSchema>;