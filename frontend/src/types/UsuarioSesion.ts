// Los tres roles reales del back (Prisma enum Rol), no strings inventados.
export type RolUsuario = "PACIENTE" | "SECRETARIA" | "MEDICO";

// El usuario tal como lo devuelve la API (POST /api/auth/login, GET /api/auth/yo).
// El passwordHash nunca viaja: prisma.ts lo omite globalmente.
export interface UsuarioSesion {
  id: number;
  username: string;
  nombre: string;
  apellido: string;
  dni: string;
  email: string;
  fotoPerfil: string | null;
  rol: RolUsuario;
}

// Respuesta de POST /api/auth/login
export interface SesionLogin {
  token: string;
  usuario: UsuarioSesion;
}
