import { useState } from "react";
import { useAuth } from "./useAuth";
import { turnosMock } from "../data/turnosPacienteMock";
import { parseFecha } from "../utils/fecha";
import type { TurnoReservadoProps } from "../types/TurnoReservadoProps";

export function useTurnosMedico() {
  const { usuario } = useAuth();
  const [turnos] = useState<TurnoReservadoProps[]>(turnosMock);

  const nombreCompleto = usuario
    ? `${usuario.docs?.nombre} ${usuario.docs?.apellido}`
    : "";

  const misTurnos = turnos.filter((t) => t.medico === nombreCompleto);

  function turnosDelDia(fecha: Date): TurnoReservadoProps[] {
    return misTurnos
      .filter((t) => {
        const f = parseFecha(t.fecha);
        return (
          f.getDate() === fecha.getDate() &&
          f.getMonth() === fecha.getMonth() &&
          f.getFullYear() === fecha.getFullYear()
        );
      })
      .sort((a, b) => a.hora.localeCompare(b.hora));
  }

  return { misTurnos, turnosDelDia };
}
