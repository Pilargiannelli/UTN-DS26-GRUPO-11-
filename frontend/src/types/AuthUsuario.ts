export type Rol = "PACIENTE" | "SECRETARIA" | "MEDICO";

export interface AuthUsuario {
  id: number;
  email: string;
  nombre: string;
  rol: Rol;
}

export interface Sesion {
  token: string;
  usuario: AuthUsuario;
}
