import { z } from "zod";

// La contraseña actual no se puede comparar en el cliente (la API nunca la
// manda): la verifica el back en PATCH /auth/password. La nueva tiene la misma
// fortaleza que exige el back (auth.validation.ts).
export const newPasswordSchema = z.object({
    currentPassword: z.string().min(1, "Ingrese la contraseña actual"),
    newPassword: z.string()
        .min(8, "La contraseña debe tener al menos 8 caracteres")
        .regex(/[A-Z]/, "La contraseña debe tener al menos una mayúscula")
        .regex(/[a-z]/, "La contraseña debe tener al menos una minúscula")
        .regex(/[0-9]/, "La contraseña debe tener al menos un número"),
    repeatPassword: z.string().min(1, "Repita la nueva contraseña"),
}).refine(data => data.newPassword === data.repeatPassword, {
    message: "Las nuevas contraseñas no coinciden",
    path: ["repeatPassword"],
}).refine(data => data.newPassword !== data.currentPassword, {
    message: "La contraseña nueva tiene que ser distinta de la actual",
    path: ["newPassword"],
});

export type NewPasswordValidada = z.infer<typeof newPasswordSchema>;
