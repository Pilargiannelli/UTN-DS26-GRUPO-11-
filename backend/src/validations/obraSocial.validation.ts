import { z } from "zod";

// POST /api/obras-sociales
// Restringido a SECRETARIA (ver auth.middleware.authorize en la ruta):
// es la operación de escritura protegida en la UI (Header: "+ Nueva Obra
// Social" visible solo con tieneRol("SECRETARIA")).
export const obraSocialCreateSchema = z.object({
  nombre: z.string().trim().min(1, "El nombre de la obra social es obligatorio"),
});

export type ObraSocialCreateInput = z.infer<typeof obraSocialCreateSchema>;
