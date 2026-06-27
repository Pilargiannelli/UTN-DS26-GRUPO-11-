import { z } from "zod";

export const medicoSchema = (especialidades: string[]) => {
  const especialidadesValidas = especialidades as [string, ...string[]];
  return z.object({
    nombre: z.string().min(1, "Por favor, ingrese el nombre del médico"),
    apellido: z.string().min(1, "Por favor, ingrese el apellido del médico"),
    dni: z.coerce.number().positive("El número ingresado no corresponde a un DNI válido"),
    email: z.string().min(1, "Por favor, ingrese el correo electrónico"),
    matricula: z.string().min(1, "Por favor, ingrese la matrícula del médico"),
    especialidad: z.enum(especialidadesValidas, { message: "Por favor, seleccione una especialidad válida" })
  });
};

export type MedicoValidado = z.infer<ReturnType<typeof medicoSchema>>;
