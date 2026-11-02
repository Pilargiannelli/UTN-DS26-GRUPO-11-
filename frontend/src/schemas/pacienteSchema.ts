import { z } from "zod";
import { dateInputSchema } from "./dateSchema.ts"

export const SIN_OBRA_SOCIAL = "Sin obra social";

// Primera regla de contraseña que no se cumple (la misma fortaleza que exige el back), o null si cumple todas
const reglaIncumplida = (password: string): string | null => {
    const reglas: [boolean, string][] = [
        [password.length >= 8, "La contraseña debe tener al menos 8 caracteres"],
        [/[A-Z]/.test(password), "La contraseña debe tener al menos una mayúscula"],
        [/[a-z]/.test(password), "La contraseña debe tener al menos una minúscula"],
        [/[0-9]/.test(password), "La contraseña debe tener al menos un número"],
    ];
    return reglas.find(([cumple]) => !cumple)?.[1] ?? null;
};

// Mismas reglas que backend/src/validations/paciente.validation.ts, para que
// el formulario marque los errores antes de enviar. Con conPassword (modo
// autoregistro) suma la contraseña con la misma fortaleza que exige el back.
// La obra social no se valida contra una lista cerrada: la secretaria puede
// agregar una nueva desde el mismo formulario, y el select ya limita las
// opciones. Al enviar, el formulario la busca por nombre para mandar su id.
export const pacienteSchema = (sexo: string[], conPassword = false) => {
    const sexosValidos = sexo as [string, ...string[]];
    return z.object({
        nombre: z.string().trim().min(1, "Por favor, ingrese el nombre del paciente"),
        apellido: z.string().trim().min(1, "Por favor, ingrese el apellido del paciente"),
        dni: z.string().trim().regex(/^\d{7,8}$/, "El DNI debe tener 7 u 8 números"),
        email: z.string().trim().min(1, "Por favor, ingrese el correo electrónico del paciente")
            .email("El correo ingresado no corresponde a una dirección de correo válida"),
        telefono: z.string().trim().regex(/^\+?\d{8,15}$/, "El teléfono debe tener entre 8 y 15 números, con código de área"),
        obraSocial: z.string().min(1, "Por favor, seleccione una obra social"),
        nroAfiliado: z.string().min(1, "Por favor, ingrese el número de afiliado"),
        plan: z.string().min(1, "Por favor, ingrese el plan"),
        sexo: z.enum(sexosValidos, { message: "Por favor, seleccione un sexo válido" }),
        fechaNacimiento: dateInputSchema,
        password: z.string().optional(),
        repetirPassword: z.string().optional(),
    })
    // when: () => true: las contraseñas se validan aunque otros campos tengan errores, así se marcan juntas
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

export type PacienteValidado = z.infer<ReturnType<typeof pacienteSchema>>;
