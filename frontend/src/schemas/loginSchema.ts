import { z } from "zod";

// El login no valida fortaleza de contraseña: eso es solo para el registro.
export const loginSchema = z.object({
  email: z.email("El email no es válido"),
  password: z.string().min(1, "La contraseña es obligatoria"),
});

export type LoginData = z.infer<typeof loginSchema>;
