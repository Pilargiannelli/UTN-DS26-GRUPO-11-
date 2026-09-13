export interface Especialidad {
  id: number;
  nombre: string;
}

export interface MedicoProps {
  id: number;
  usuarioId: number;
  matricula: string;
  especialidadId?: number;
  especialidad?: Especialidad | string;
}