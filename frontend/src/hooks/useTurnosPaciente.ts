import { useState } from "react";
import { useAuth } from "./useAuth";
import { turnosMock } from "../data/turnosPacienteMock";
import { parseFecha } from "../utils/fecha";
import type { TurnoReservadoProps } from "../types/TurnoReservadoProps";

export function useTurnosPaciente() {
  const { usuario } = useAuth();
  const [turnos] = useState<TurnoReservadoProps[]>(turnosMock);

  const nombreCompleto = usuario ? `${usuario.docs?.nombre} ${usuario.docs?.apellido}` : "";

  const misTurnos = turnos.filter((t) => t.paciente === nombreCompleto);

  const hoy = new Date();
  const proximosOrdenados = misTurnos
    .filter((t) => t.estado !== "Cancelado" && parseFecha(t.fecha) >= hoy)
    .sort((a, b) => parseFecha(a.fecha).getTime() - parseFecha(b.fecha).getTime());

  const proximoTurno = proximosOrdenados[0] ?? null;

  return { misTurnos, proximoTurno };
}