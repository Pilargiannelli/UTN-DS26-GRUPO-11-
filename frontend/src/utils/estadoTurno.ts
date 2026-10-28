import type { EstadoTurno } from "../types/Turno";

// Clase CSS del badge/barra de color de cada estado (MisTurnos, DetalleTurno).
// Reprogramado espera confirmación igual que Pendiente: comparte su color.
export function obtenerClaseEstado(estado: EstadoTurno) {
  switch (estado) {
    case "Confirmado": return "estado-confirmado";
    case "Pendiente":
    case "Reprogramado": return "estado-pendiente";
    case "Cancelado": return "estado-cancelado";
  }
}

// Un turno que ya pasó no se cancela ni se confirma (el back responde 409)
export function yaPaso(fechaHora: string) {
  return new Date(fechaHora) < new Date();
}

// RN-006: el paciente puede cancelar mientras el turno no esté confirmado y
// no haya pasado. El back aplica la misma regla (409); acá solo decide si
// mostrar el botón.
export function puedeCancelarPaciente(estado: EstadoTurno, fechaHora: string) {
  return (estado === "Pendiente" || estado === "Reprogramado") && !yaPaso(fechaHora);
}
