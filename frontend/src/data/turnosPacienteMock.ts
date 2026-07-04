import type { TurnoReservadoProps } from "../types/TurnoReservadoProps";

// Mock temporal hasta que exista turnos.json / API real de turnos.
export const turnosMock: TurnoReservadoProps[] = [
  { id: 1, paciente: "Julián Álvarez", especialidad: "Traumatología", medico: "Lionel Messi", fecha: "08/07/2026", hora: "10:30", estado: "Confirmado" },
  { id: 2, paciente: "Julián Álvarez", especialidad: "Traumatología", medico: "Lionel Messi", fecha: "17/07/2026", hora: "16:00", estado: "Pendiente" },
];