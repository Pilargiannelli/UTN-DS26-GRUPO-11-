import type { MedicoProps } from "./MedicoProps";

export type RolUsuario = "PACIENTE" | "MEDICO" | "SECRETARIA";

// Cobertura tal como la manda el back (include: { obraSocial: true })
export interface CoberturaPaciente {
  nroAfiliado: string;
  plan: string;
  obraSocial: { id: number; nombre: string };
}

// Ficha del paciente (modelo Paciente de Prisma). Nombre, DNI y email viven
// en Usuario, no acá.
export interface PacientePerfil {
  id: number;
  usuarioId?: number;
  fechaNacimiento: string;
  sexo: string;
  telefono: string;
  coberturas?: CoberturaPaciente[];
}

export interface Usuario {
  id: number;
  username: string;
  email: string;
  nombre: string;
  apellido: string;
  dni: string;
  fotoPerfil?: string | null;
  rol: RolUsuario;
  medico?: MedicoProps | null;
  paciente?: PacientePerfil | null;
}
