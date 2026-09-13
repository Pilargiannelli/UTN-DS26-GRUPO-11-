import { useFetch } from "./useFetch";
import { parseFechaHora } from "../utils/fecha";
import type { Turno } from "../types/Turno";

// GET /api/turnos ya devuelve sólo los turnos de la agenda del médico
// autenticado (filtrado por identidad en el backend, matriz de permisos
// sección 8): no hace falta comparar nombres a mano como hacía el mock.
export function useTurnosMedico() {
  const { data } = useFetch<Turno[]>("/turnos");
  const misTurnos = data ?? [];

  function turnosDelDia(fecha: Date): Turno[] {
    return misTurnos
      .filter((t) => {
        const f = parseFechaHora(t.fechaHora);
        return (
          f.getDate() === fecha.getDate() &&
          f.getMonth() === fecha.getMonth() &&
          f.getFullYear() === fecha.getFullYear()
        );
      })
      .sort((a, b) => a.fechaHora.localeCompare(b.fechaHora));
  }

  return { misTurnos, turnosDelDia };
}
