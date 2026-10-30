import type { Turno } from "./Turno";
import type { RolUsuario } from "./UsuarioSesion";

export interface HeroTurnosProps {
  rol: RolUsuario | null;
  nombre: string;
  // Fecha de hoy ya formateada ("jueves 30 de octubre de 2026")
  fecha: string;
  // Turnos que quedan hoy (sin cancelados) y pendientes de confirmar próximos
  turnosDeHoy: number;
  pendientes: number;
  proximoTurno: Turno | null;
}
