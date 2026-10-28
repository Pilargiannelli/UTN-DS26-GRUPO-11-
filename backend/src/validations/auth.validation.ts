import { z } from "zod";
import { pacienteCreateSchema } from "./paciente.validation";

// Fortaleza exigida solo al crear la contraseña (registro). El login la deja
// pasar tal cual: exigir fortaleza ahí solo serviría para filtrar cuentas
// viejas y no aporta seguridad real al intento de inicio de sesión.
const passwordFuerte = z
  .string()
  .min(8, "La contraseña debe tener al menos 8 caracteres")
  .regex(/[A-Z]/, "La contraseña debe tener al menos una mayúscula")
  .regex(/[a-z]/, "La contraseña debe tener al menos una minúscula")
  .regex(/[0-9]/, "La contraseña debe tener al menos un número");

// POST /api/auth/registro (autoregistro del paciente, "Crear cuenta")
// Son los mismos datos que carga la secretaria más la contraseña: así el
// registro crea Usuario + Paciente juntos y no queda un PACIENTE sin ficha.
// El rol no se recibe acá: siempre es PACIENTE, para que nadie pueda
// autoasignarse un rol de mayor privilegio en el registro.
export const registroSchema = pacienteCreateSchema.extend({
  // Opcional: si no viene, el username es el DNI
  username: z.string().trim().min(3, "El username debe tener al menos 3 caracteres").optional(),
  password: passwordFuerte,
});

// POST /api/auth/login
export const loginSchema = z.object({
  email: z.email("El email no es válido"),
  password: z.string().min(1, "La contraseña es obligatoria"),
});

// PATCH /api/auth/password (cualquier usuario logueado, sobre su propia cuenta)
export const cambioPasswordSchema = z
  .object({
    passwordActual: z.string().min(1, "Ingresá tu contraseña actual"),
    passwordNueva: passwordFuerte,
  })
  .refine((d) => d.passwordNueva !== d.passwordActual, {
    message: "La contraseña nueva tiene que ser distinta de la actual",
    path: ["passwordNueva"],
  });

export type RegistroInput = z.infer<typeof registroSchema>;
export type CambioPasswordInput = z.infer<typeof cambioPasswordSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
