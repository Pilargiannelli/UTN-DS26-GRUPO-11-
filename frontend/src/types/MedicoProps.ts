// En el schema de Prisma, Medico.especialidad es un String (no hay modelo
// Especialidad): GET /api/especialidades devuelve un array de strings.
export interface MedicoProps {
  id: number;
  usuarioId: number;
  matricula: string;
  especialidad: string;
}
