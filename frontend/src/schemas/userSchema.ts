import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().min(1, "Por favor, ingrese su usuario"),
  password: z.string().min(1, "Por favor, ingrese su contraseña"),
});

export type LoginData = z.infer<typeof loginSchema>;
