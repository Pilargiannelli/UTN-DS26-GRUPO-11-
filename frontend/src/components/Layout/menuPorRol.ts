import type { MenuItem } from "../../types/MenuItem";
import type { RolUsuario } from "../../types/UsuarioSesion";

// Menú de navegación (desplegable ☰) de cada rol, en un solo lugar. Cada link
// coincide con una ruta de App.tsx que el rol tiene permitida.
const miCuenta: MenuItem = { label: "Mi cuenta", href: "/mi-cuenta" };

export const menuPorRol: Record<RolUsuario, MenuItem[]> = {
  SECRETARIA: [
    { label: "Gestión de turnos", href: "/home" },
    { label: "Pacientes", href: "/buscar-paciente" },
    { label: "Médicos", href: "/buscar-medico" },
    miCuenta,
  ],
  MEDICO: [
    { label: "Gestión de turnos", href: "/home" },
    { label: "Agenda", href: "/orden-del-dia" },
    { label: "Pacientes", href: "/buscar-paciente" },
    { label: "Historia clínica", href: "/historial" },
    miCuenta,
  ],
  PACIENTE: [
    { label: "Inicio", href: "/home" },
    { label: "Mis turnos", href: "/mis-turnos" },
    { label: "Pedir turno", href: "/pedir-turno" },
    { label: "Médicos", href: "/buscar-medico" },
    miCuenta,
  ],
};
