import type { Paciente } from "./Paciente";
import type { MedicoProps } from "./MedicoProps";

export type RolUsuario = "PACIENTE" | "MEDICO" | "SECRETARIA";

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
  paciente?: Paciente | null;
}
