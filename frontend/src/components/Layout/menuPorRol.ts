import type { MenuItem } from "../../types/MenuItem";
import type { RolUsuario } from "../../types/UsuarioSesion";

// Secciones principales del menú (☰) de cada rol, en un solo lugar. Cada link
// coincide con una ruta de App.tsx que el rol tiene permitida. Mi cuenta y
// Cerrar sesión van aparte, al final del menú (Sidebar).

export const menuPorRol: Record<RolUsuario, MenuItem[]> = {
  SECRETARIA: [
    { label: "Gestión de turnos", href: "/home" },
    { label: "Pacientes", href: "/buscar-paciente" },
    { label: "Médicos", href: "/buscar-medico" },
  ],
  MEDICO: [
    { label: "Gestión de turnos", href: "/home" },
    { label: "Agenda", href: "/orden-del-dia" },
    { label: "Pacientes", href: "/buscar-paciente" },
  ],
  PACIENTE: [
    { label: "Inicio", href: "/home" },
    { label: "Mis turnos", href: "/mis-turnos" },
    { label: "Pedir turno", href: "/pedir-turno" },
    { label: "Médicos", href: "/buscar-medico" },
  ],
};
