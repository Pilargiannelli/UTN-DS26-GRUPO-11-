import type { EstadoTurno, Turno } from "../types/Turno";
import type { EntradaClinica } from "../types/HistoriaClinica";

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

// Color del badge de cada estado en las listas del médico
export const COLOR_ESTADO: Record<string, string> = {
  Pendiente: "warning",
  Reprogramado: "warning",
  Confirmado: "info",
  Cancelado: "danger",
};

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

// Estado que ve el paciente: un turno que ya pasó se muestra como atendido
// si el médico registró la consulta
export function estadoVisible(turno: Turno, consulta?: EntradaClinica) {
  if (turno.estado === "Cancelado") return { texto: "Cancelado", clase: "cancelado" };
  if (yaPaso(turno.fechaHora)) {
    return consulta ? { texto: "Atendido", clase: "atendido" } : { texto: "Finalizado", clase: "finalizado" };
  }
  if (turno.estado === "Confirmado") return { texto: "Confirmado", clase: "confirmado" };
  return { texto: "Por confirmar", clase: "pendiente" };
}
