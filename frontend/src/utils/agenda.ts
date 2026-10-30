import type { CSSProperties } from "react";
import type { Turno } from "../types/Turno";
import { parseFechaHora } from "./fecha";

// Grilla de la agenda: de 08:00 a 20:00, cada turno dura 30 minutos
export const HORA_INICIO = 8;
export const HORA_FIN = 20;
export const ALTURA_HORA = 96;
const DURACION_MIN = 30;
// Separación entre un turno y el siguiente
const AIRE = 3;

export const HORAS = Array.from({ length: HORA_FIN - HORA_INICIO }, (_, i) => HORA_INICIO + i);
export const ALTURA_TOTAL = (HORA_FIN - HORA_INICIO) * ALTURA_HORA;

// La altura de la hora se pasa al CSS para que filas y turnos coincidan
export const estiloGrilla = { "--agenda-alto-hora": `${ALTURA_HORA}px` } as CSSProperties;

export const etiquetaHora = (h: number) => `${String(h).padStart(2, "0")}:00`;

export function esMismaFecha(a: Date, b: Date) {
  return a.getDate() === b.getDate() && a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear();
}

const minutosDesdeInicio = (t: Turno) => {
  const f = parseFechaHora(t.fechaHora);
  return (f.getHours() - HORA_INICIO) * 60 + f.getMinutes();
};

export interface TurnoUbicado {
  turno: Turno;
  estilo: CSSProperties;
}

// Posición de cada turno en la columna. Si dos se superponen (por ejemplo uno
// cancelado y el que tomó su horario) se reparten el ancho en vez de pisarse.
export function ubicarTurnos(turnos: Turno[]): TurnoUbicado[] {
  const ordenados = [...turnos].sort((a, b) => minutosDesdeInicio(a) - minutosDesdeInicio(b));
  const resultado: { turno: Turno; inicio: number; carril: number; grupo: number }[] = [];
  const carrilesPorGrupo: number[] = [];
  let finCarriles: number[] = [];
  let grupo = -1;
  let finGrupo = -Infinity;

  for (const turno of ordenados) {
    const inicio = minutosDesdeInicio(turno);
    if (inicio >= finGrupo) {
      grupo += 1;
      finCarriles = [];
      carrilesPorGrupo[grupo] = 0;
    }
    let carril = finCarriles.findIndex((fin) => fin <= inicio);
    if (carril === -1) carril = finCarriles.length;
    finCarriles[carril] = inicio + DURACION_MIN;
    finGrupo = Math.max(finGrupo, inicio + DURACION_MIN);
    carrilesPorGrupo[grupo] = Math.max(carrilesPorGrupo[grupo], carril + 1);
    resultado.push({ turno, inicio, carril, grupo });
  }

  return resultado.map(({ turno, inicio, carril, grupo: g }) => {
    const ancho = 100 / carrilesPorGrupo[g];
    return {
      turno,
      estilo: {
        top: (inicio / 60) * ALTURA_HORA + AIRE / 2,
        height: (DURACION_MIN / 60) * ALTURA_HORA - AIRE,
        left: `calc(${carril * ancho}% + var(--space-1))`,
        width: `calc(${ancho}% - var(--space-2))`,
      },
    };
  });
}

// Línea de la hora actual (null si está fuera de la grilla)
export function topAhora(ahora: Date): number | null {
  const minutos = (ahora.getHours() - HORA_INICIO) * 60 + ahora.getMinutes();
  if (minutos < 0 || minutos > (HORA_FIN - HORA_INICIO) * 60) return null;
  return (minutos / 60) * ALTURA_HORA;
}
