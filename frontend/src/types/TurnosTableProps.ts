import type { Turno } from "./Turno";

export interface TurnosTableProps {
  turnos: Turno[];
  onNuevoTurno: () => void;
  // El turno que devolvió el back después de confirmar o cancelar
  onTurnoActualizado: (turno: Turno) => void;
}