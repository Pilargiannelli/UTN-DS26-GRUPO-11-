import { useFetch } from "./useFetch";
import { parseFechaHora } from "../utils/fecha";
import type { Turno } from "../types/Turno";

// GET /api/turnos ya devuelve sólo los turnos del paciente autenticado (el
// backend filtra por identidad, matriz de permisos sección 8): no hace falta
// comparar nombres a mano como hacía el mock.
export function useTurnosPaciente() {
  const { data, loading, error } = useFetch<Turno[]>("/turnos");
  const misTurnos = data ?? [];

  const hoy = new Date();

  const proximosOrdenados = misTurnos
    .filter((t) => t.estado !== "Cancelado" && parseFechaHora(t.fechaHora) >= hoy)
    .sort((a, b) => parseFechaHora(a.fechaHora).getTime() - parseFechaHora(b.fechaHora).getTime());

  const proximoTurno = proximosOrdenados[0] ?? null;

  return { misTurnos, proximoTurno, loading, error };
}
