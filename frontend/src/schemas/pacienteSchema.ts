import { z } from "zod";
import { dateInputSchema } from "./dateSchema.ts"

export const pacienteSchema = (obrasSociales: string[], sexo: string[]) => {
    const OSValidas = obrasSociales as [string, ...string[]];
    const sexosValidos = sexo as [string, ...string[]];
    return z.object({
        nombre: z.string().min(1, "Por favor, ingrese el nombre del paciente"),
        apellido: z.string().min(1, "Por favor, ingrese el apellido del paciente"),
        dni: z.coerce.number().int().positive("Por favor, ingrese un número de DNI válido"),
        email: z.string().min(1, "Por favor, ingrese el correo electrónico del paciente").email("El correo ingresado no corresponde a una dirección de correo válida"),
        telefono: z.string().min(1, "Por favor, ingrese el número de teléfono del paciente"),
        obraSocial: z.enum(OSValidas, { message: "Por favor, seleccione una obra social válida" }),
        nroAfiliado: z.string().min(1, "Por favor, ingrese el número de afiliado"),
        plan: z.string().min(1, "Por favor, ingrese el plan"),
        sexo: z.enum(sexosValidos, { message: "Por favor, seleccione un sexo válido" }),
        fechaNacimiento: dateInputSchema,
    });
}

export type PacienteValidado = z.infer<ReturnType<typeof pacienteSchema>>;