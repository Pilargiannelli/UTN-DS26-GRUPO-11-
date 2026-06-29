import { z } from "zod";

export const dateInputSchema = z.object({
  day: z.string().min(1, "Por favor, ingrese el día").regex(/^(0[1-9]|[12][0-9]|3[01])$/, "El día ingresado no es válido"),
  month: z.string().min(1, "Por favor, ingrese el mes").regex(/^(0[1-9]|1[012])$/, "El mes ingresado no es válido"),
  year: z.string().min(1, "Por favor, ingrese el año").regex(/^(19|20)\d{2}$/, "El año ingresado no es válido"), // Valida años entre 1900 y 2099
});
