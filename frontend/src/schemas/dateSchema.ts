import { z } from "zod";

export const dateInputSchema = z.object({
    day: z.string().min(1, "El día es requerido"),
    month: z.string().min(1, "El mes es requerido"),
    year: z.string().min(1, "El año es requerido").length(4, "El año debe tener 4 dígitos"),
  }).refine((values) => {
    if (!values.day || !values.month || !values.year) return true;
    const day = Number(values.day);
    const month = Number(values.month);
    const year = Number(values.year);
    const fecha = new Date(year, month - 1, day);
    const hoy = new Date();
    return (
      !isNaN(fecha.getTime()) &&
      fecha.getDate() === day &&
      fecha.getMonth() === month - 1 &&
      fecha.getFullYear() === year &&
      fecha <= hoy
    );
  },{
      message: "La fecha ingresada no es válida o es futura",
      path: ["year"], 
    }
  );