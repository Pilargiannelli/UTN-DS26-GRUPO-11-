import type { ReactNode } from "react";
import "../assets/styles/EncabezadoPagina.css";

interface EncabezadoPaginaProps {
  titulo: string;
  descripcion?: ReactNode;
  // Acción principal de la página (una sola), alineada a la derecha
  accion?: ReactNode;
}

// Encabezado común de las pantallas: título, una línea de contexto y la acción
// principal. Así todas las secciones arrancan igual.
export function EncabezadoPagina({ titulo, descripcion, accion }: EncabezadoPaginaProps) {
  return (
    <header className="encabezado-pagina">
      <div>
        <h1 className="encabezado-pagina-titulo">{titulo}</h1>
        {descripcion && <p className="encabezado-pagina-descripcion">{descripcion}</p>}
      </div>
      {accion && <div className="encabezado-pagina-accion">{accion}</div>}
    </header>
  );
}
