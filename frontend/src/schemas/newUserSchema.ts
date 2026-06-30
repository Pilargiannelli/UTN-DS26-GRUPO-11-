import { z } from "zod";

export const singinSchema = z.object({
  username: z.string().min(1, "Por favor, ingrese el usuario"),
  password: z.string().min(1, "Por favor, ingrese la contraseña"),
  password2: z.string().min(1, "Por favor, repita la contraseña"),
});

export type SinginData = z.infer<typeof singinSchema>;
