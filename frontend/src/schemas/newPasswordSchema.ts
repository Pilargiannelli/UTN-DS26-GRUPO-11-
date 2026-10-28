import { z } from "zod";

// La contraseña actual no se puede comparar en el cliente (la API nunca la
// manda): la verifica el back cuando se implemente el cambio real.
export const newPasswordSchema = z.object({
    currentPassword: z.string().min(1, "Ingrese la contraseña actual"),
    newPassword: z.string().min(1, "Ingrese la nueva contraseña"),
    repeatPassword: z.string().min(1, "Repita la nueva contraseña"),
}).refine(data => data.newPassword === data.repeatPassword, {
    message: "Las nuevas contraseñas no coinciden",
    path: ["repeatPassword"],
});

export type NewPasswordValidada = z.infer<typeof newPasswordSchema>;
