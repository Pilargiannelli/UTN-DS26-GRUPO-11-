import { z } from "zod";
import type { Usuario } from "../types/Usuario";

export const singinSchema = (usuariosExistentes: Usuario[]) => z.object({
    username: z.string().min(1, "Por favor, ingrese el usuario"),
    password: z.string().min(1, "Por favor, ingrese la contraseña"),
    password2: z.string().min(1, "Por favor, repita la contraseña"),
}).refine((data) => data.password === data.password2, {
    message: "Las contraseñas no coinciden",
    path: ["password2"],
}).refine((data) => {const existe = usuariosExistentes.some( (u) => u.u.toLowerCase() === data.username.trim().toLowerCase() );
    return !existe;
},{
    message: "El nombre de usuario ya se encuentra registrado",
    path: ["username"],
});

export type SinginData = z.infer<ReturnType<typeof singinSchema>>;