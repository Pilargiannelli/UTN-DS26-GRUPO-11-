import { z } from "zod";

export const adminSchema = (emailsExistentes: string[]) => z.object({
    nombre: z.string().min(1, "Por favor, ingrese el nombre del médico"),
    apellido: z.string().min(1, "Por favor, ingrese el apellido del médico"),
    dni: z.coerce.number().positive("El número ingresado no corresponde a un DNI válido"),
    email: z.string().min(1, "Por favor, ingrese el correo electrónico del médico")
      .email("El correo ingresado no corresponde a una dirección de correo válida")
      .refine((email) => !emailsExistentes.includes(email), { message: "El correo electrónico ya está en uso" }),
});

export type AdminValidado = z.infer<ReturnType<typeof adminSchema>>;