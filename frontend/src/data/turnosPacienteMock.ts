import type { TurnoReservadoProps } from "../types/TurnoReservadoProps";

// Mock temporal hasta que exista turnos.json / API real de turnos.
export const turnosMock: TurnoReservadoProps[] = [
  // Turnos del paciente Julián Álvarez
  { id: 1, paciente: "Julián Álvarez", especialidad: "Traumatología", medico: "Lionel Messi", fecha: "08/07/2026", hora: "10:30", estado: "Confirmado" },
  { id: 2, paciente: "Julián Álvarez", especialidad: "Traumatología", medico: "Lionel Messi", fecha: "17/07/2026", hora: "16:00", estado: "Pendiente" },
  // Agenda del médico Lionel Messi — hoy (04/07/2026)
  { id: 3, paciente: "Carlos Roca",      especialidad: "Traumatología", medico: "Lionel Messi", fecha: "04/07/2026", hora: "09:00", estado: "Confirmado" },
  { id: 4, paciente: "María López",      especialidad: "Traumatología", medico: "Lionel Messi", fecha: "04/07/2026", hora: "10:00", estado: "Confirmado" },
  { id: 5, paciente: "Pedro García",     especialidad: "Traumatología", medico: "Lionel Messi", fecha: "04/07/2026", hora: "11:30", estado: "Pendiente" },
  { id: 6, paciente: "Ana Martínez",     especialidad: "Traumatología", medico: "Lionel Messi", fecha: "04/07/2026", hora: "14:00", estado: "Confirmado" },
  { id: 7, paciente: "Roberto Silva",    especialidad: "Traumatología", medico: "Lionel Messi", fecha: "04/07/2026", hora: "15:30", estado: "Cancelado" },
  { id: 8, paciente: "Laura Fernández",  especialidad: "Traumatología", medico: "Lionel Messi", fecha: "04/07/2026", hora: "17:00", estado: "Confirmado" },
  // Agenda del médico Lionel Messi — mañana (05/07/2026)
  { id: 9,  paciente: "Diego Torres",  especialidad: "Traumatología", medico: "Lionel Messi", fecha: "05/07/2026", hora: "09:30", estado: "Confirmado" },
  { id: 10, paciente: "Sofía Méndez",  especialidad: "Traumatología", medico: "Lionel Messi", fecha: "05/07/2026", hora: "11:00", estado: "Pendiente" },
  { id: 11, paciente: "Nicolás Pérez", especialidad: "Traumatología", medico: "Lionel Messi", fecha: "05/07/2026", hora: "14:30", estado: "Confirmado" },
];