// Grilla única de horarios del consultorio: cada 30 minutos, de 08:00 a 19:30.
// La usan PedirTurno (paciente) y NuevoTurnoModal (secretaria) para que los
// dos ofrezcan exactamente los mismos horarios: si no, un turno a las 11:00 y
// otro a las 11:15 con el mismo médico no se detectarían como superpuestos.
const PRIMERA_HORA = 8;
const ULTIMA_HORA = 19;

export const HORARIOS_CONSULTORIO: string[] = Array.from(
  { length: (ULTIMA_HORA - PRIMERA_HORA + 1) * 2 },
  (_, i) => {
    const hora = PRIMERA_HORA + Math.floor(i / 2);
    const minutos = i % 2 === 0 ? "00" : "30";
    return `${String(hora).padStart(2, "0")}:${minutos}`;
  }
);

// Un horario no se puede elegir si ya está tomado o si es de hoy y ya pasó
export function horarioNoDisponible(fecha: string, hora: string, ocupados: Set<string>) {
  return ocupados.has(hora) || new Date(`${fecha}T${hora}:00`) <= new Date();
}
