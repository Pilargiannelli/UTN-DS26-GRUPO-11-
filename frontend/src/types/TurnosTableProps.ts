import type { Turno } from "./Turno";

export interface TurnosTableProps {
  recepcion?: boolean;
  // Solo los turnos que todavía no pasaron (GestionTurnos ya los filtra)
  turnos: Turno[];
  onNuevoTurno: () => void;
  // El turno que devolvió el back después de confirmar o cancelar
  onTurnoActualizado: (turno: Turno) => void;
}
