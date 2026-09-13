// El contrato real de GET/POST /api/turnos (backend/src/services/turno.service.ts
// + prisma/schema.prisma). No es el que asumía el mock: fechaHora es un único
// DateTime en Prisma, pero viaja como string ISO por JSON — no hay tipos ricos
// en JSON (Filmina 18 de C19). No hay "especialidad" ni "obraSocial" sueltos en
// Turno: especialidad vive en Medico, y no hay ninguna relación de Turno con
// ObraSocial en el schema.
export type EstadoTurno = "Pendiente" | "Confirmado" | "Cancelado" | "Reprogramado";

// Lo que trae el include de medico/paciente en GET /api/turnos y en
// GET /api/medicos (misma forma, la reutilizamos para el selector de PedirTurno).
export interface UsuarioTurno {
  nombre: string;
  apellido: string;
  email: string;
  dni?: string;
}

export interface MedicoTurno {
  id: number;
  especialidad: string;
  matricula: string;
  usuario: UsuarioTurno;
}

export interface PacienteTurno {
  id: number;
  usuario: UsuarioTurno;
}

export interface Turno {
  id: number;
  estado: EstadoTurno;
  fechaHora: string;
  idWhatsapp: string | null;
  pagoValidado: boolean;
  medicoId: number;
  pacienteId: number;
  secretariaId: number | null;
  medico: MedicoTurno;
  paciente: PacienteTurno;
}

// Body de POST /api/turnos (ver backend/src/validations/turno.validation.ts).
// El back coacciona fechaHora con z.coerce.date(), así que un ISO string sirve.
export interface TurnoCreateInput {
  fechaHora: string;
  medicoId: number;
  pacienteId: number;
  estado?: EstadoTurno;
}
