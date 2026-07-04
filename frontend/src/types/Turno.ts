export interface Turno {
  id: number;

  paciente: string;

  medico: string;

  especialidad: string;

  fecha: string;

  hora: string;

  obraSocial: string;

  estado: "Pendiente" | "Confirmado" | "Cancelado";
}