import { z } from "zod";

export const pacienteSchema = (obrasSociales: string[]) =>
    z.object({
        nombre: z.string().min(1, "Por favor, ingrese el nombre del paciente"),
        apellido: z.string().min(1, "Por favor, ingrese el apellido del paciente"),
        dni: z.coerce.number().int().positive("Por favor, ingrese un número de DNI válido"),
        email: z.string().min(1, "Por favor, ingrese el correo electrónico del paciente").email("El correo ingresado no corresponde a una dirección de correo válida"),
        password: z.string().min(8, "Por favor, ingrese una contraseña de al menos 8 caracteres"),
        telefono: z.string().min(1, "Por favor, ingrese el número de teléfono del paciente").regex(/^\+\d{10,15}$/, "El número ingresado no corresponde a un teléfono válido"),
        obraSocial: z.enum(obrasSociales as [string, ...string[]]),
    }
);

export type PacienteValidado = z.infer<ReturnType<typeof pacienteSchema>>;