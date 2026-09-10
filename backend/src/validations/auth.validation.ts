import { z } from "zod";

// Fortaleza exigida solo al crear la contraseña (registro). El login la deja
// pasar tal cual: exigir fortaleza ahí solo serviría para filtrar cuentas
// viejas y no aporta seguridad real al intento de inicio de sesión.
const passwordFuerte = z
  .string()
  .min(8, "La contraseña debe tener al menos 8 caracteres")
  .regex(/[A-Z]/, "La contraseña debe tener al menos una mayúscula")
  .regex(/[a-z]/, "La contraseña debe tener al menos una minúscula")
  .regex(/[0-9]/, "La contraseña debe tener al menos un número");

// POST /api/auth/registro
// El rol no se recibe acá: lo asigna Prisma con @default(PACIENTE) para que
// nadie pueda autoasignarse un rol de mayor privilegio en el registro.
export const registroSchema = z.object({
  username: z.string().trim().min(3, "El username debe tener al menos 3 caracteres"),
  password: passwordFuerte,
  nombre: z.string().trim().min(1, "El nombre es obligatorio"),
  apellido: z.string().trim().min(1, "El apellido es obligatorio"),
  dni: z.string().trim().min(1, "El DNI es obligatorio"),
  email: z.email("El email no es válido"),
  fotoPerfil: z.string().trim().min(1).optional(),
});

// POST /api/auth/login
export const loginSchema = z.object({
  email: z.email("El email no es válido"),
  password: z.string().min(1, "La contraseña es obligatoria"),
});

export type RegistroInput = z.infer<typeof registroSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
