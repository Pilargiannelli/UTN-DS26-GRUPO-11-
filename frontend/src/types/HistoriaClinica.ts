// Respuesta de GET/PUT /api/pacientes/:id/historia-clinica y del POST de
// entradas (backend/src/services/historiaClinica.service.ts). Un paciente sin
// historia todavía viene con las listas vacías.
export interface EntradaClinica {
  id: number;
  historiaClinicaId: number;
  fecha: string;
  diagnostico: string;
  evolucion: string;
  observaciones: string;
}

export interface HistoriaClinica {
  paciente: { id: number; nombre: string; apellido: string; dni: string };
  medicoResponsable: string | null;
  alergias: string[];
  antecedentes: string[];
  // De la más nueva a la más vieja
  entradas: EntradaClinica[];
}
