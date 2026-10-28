import { NavLink } from "react-router-dom";
import type { SidebarProps } from "../../types/SidebarProps";
import "../../assets/styles/MenuLateral.css";

// Menú fijo al costado en pantallas grandes (en el celular lo reemplaza el ☰
// del Header). NavLink le pone la clase "active" al link de la página actual.
export function MenuLateral({ items }: SidebarProps) {
  return (
    <nav className="menu-lateral d-none d-lg-flex" aria-label="Menú principal">
      {items.map((item) => (
        <NavLink key={item.href} to={item.href} className="menu-lateral-link">
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}
