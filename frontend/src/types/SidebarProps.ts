import type { MenuItem } from "./MenuItem";

interface SidebarProps {
  // Secciones principales del rol (arriba del menú)
  items: MenuItem[];
  // Pie del menú: quién está logueado, Mi cuenta y Cerrar sesión
  cuenta?: {
    nombre: string;
    rol: string;
    onCerrarSesion: () => void;
  };
}

export type { SidebarProps };
