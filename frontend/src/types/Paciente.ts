export type SexoPaciente = "Hombre" | "Mujer" | "Otro" | "";

export interface ObraSocial {
  id: number;
  nombre: string;
}

export interface Paciente {
  id?: number;
  usuarioId?: number;
  fechaNacimiento: string;
  nroAfiliado: string;
  plan: string;
  sexo: SexoPaciente;
  telefono: string;
  obraSocialId?: number;
  obraSocial?: ObraSocial | string;
}