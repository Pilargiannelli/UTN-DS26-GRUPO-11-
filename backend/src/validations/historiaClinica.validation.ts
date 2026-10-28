import { z } from "zod";

// POST /api/pacientes/:id/historia-clinica/entradas (HU-004)
export const entradaCreateSchema = z.object({
  diagnostico: z.string().trim().min(1, "El diagnóstico es obligatorio"),
  evolucion: z.string().trim().min(1, "La evolución es obligatoria"),
  observaciones: z.string().trim().default(""),
});

// PUT /api/pacientes/:id/historia-clinica: reemplaza las listas completas
const listaDeNombres = z
  .array(z.string().trim().min(1, "No puede haber elementos vacíos"))
  .transform((nombres) => [...new Set(nombres)]);

export const historiaUpdateSchema = z.object({
  alergias: listaDeNombres,
  antecedentes: listaDeNombres,
});

export type EntradaCreate = z.infer<typeof entradaCreateSchema>;
export type HistoriaUpdate = z.infer<typeof historiaUpdateSchema>;
