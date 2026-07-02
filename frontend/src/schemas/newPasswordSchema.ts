import { z } from "zod";

export const newPasswordSchema = (passwordActual: string) => z.object({
    currentPassword: z.string().min(1, "Ingrese la contraseña actual"),
    newPassword: z.string().min(1, "Ingrese la nueva contraseña"),
    repeatPassword: z.string().min(1, "Repita la nueva contraseña"),
}).refine(data => data.currentPassword === passwordActual, {
    message: "La contraseña actual es incorrecta",
    path: ["currentPassword"],
}).refine(data => data.newPassword === data.repeatPassword, {
    message: "Las nuevas contraseñas no coinciden",
    path: ["repeatPassword"],
});

export type NewPasswordValidada = z.infer<ReturnType<typeof newPasswordSchema>>;