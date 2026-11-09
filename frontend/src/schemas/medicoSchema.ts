import { z } from "zod";

// Primera regla de contraseña que no se cumple (la misma que usa el paciente)
const reglaIncumplida = (password: string): string | null => {
    const reglas: [boolean, string][] = [
        [password.length >= 8, "La contraseña debe tener al menos 8 caracteres"],
        [/[A-Z]/.test(password), "La contraseña debe tener al menos una mayúscula"],
        [/[a-z]/.test(password), "La contraseña debe tener al menos una minúscula"],
        [/[0-9]/.test(password), "La contraseña debe tener al menos un número"],
    ];
    return reglas.find(([cumple]) => !cumple)?.[1] ?? null;
};

export const medicoSchema = (conPassword = false) => {
    return z.object({
        nombre: z.string().trim().min(1, "Por favor, ingrese el nombre del médico"),
        apellido: z.string().trim().min(1, "Por favor, ingrese el apellido del médico"),
        dni: z.string().trim().regex(/^\d{7,8}$/, "El DNI debe tener 7 u 8 números"),
        email: z.string().trim().min(1, "Por favor, ingrese el correo electrónico del médico")
            .email("El correo ingresado no corresponde a una dirección de correo válida"),
        especialidad: z.string().trim().min(1, "Por favor, seleccione la especialidad del médico"),
        matricula: z.string().trim().min(1, "Por favor, ingrese la matrícula del médico"),
        password: z.string().optional(),
        repetirPassword: z.string().optional(),
    })
    .refine((datos) => !conPassword || reglaIncumplida(datos.password ?? "") === null, {
        path: ["password"],
        when: () => true,
        error: (issue) => reglaIncumplida((issue.input as { password?: string }).password ?? "") ?? "",
    })
    .refine((datos) => !conPassword || (datos.repetirPassword ?? "") === (datos.password ?? ""), {
        path: ["repetirPassword"],
        when: () => true,
        message: "Las contraseñas no coinciden",
    });
}

export type MedicoValidado = z.infer<ReturnType<typeof medicoSchema>>;