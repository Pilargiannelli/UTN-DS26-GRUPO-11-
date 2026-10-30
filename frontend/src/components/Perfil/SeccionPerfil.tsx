import type { ReactNode } from "react";
import "../../assets/styles/Perfil.css";

interface SeccionPerfilProps {
  titulo: string;
  // Botón de la sección (por ejemplo "Editar"), siempre a la vista
  accion?: ReactNode;
  children: ReactNode;
}

// Tarjeta de una sección del perfil: título, acción a la vista y contenido
export function SeccionPerfil({ titulo, accion, children }: SeccionPerfilProps) {
  return (
    <section className="perfil-seccion">
      <header className="perfil-seccion-encabezado">
        <h2 className="perfil-seccion-titulo">{titulo}</h2>
        {accion}
      </header>
      <div className="perfil-seccion-cuerpo">{children}</div>
    </section>
  );
}

// Lista de datos "Etiqueta  valor"
export function DatosPerfil({ datos }: { datos: [string, ReactNode][] }) {
  return (
    <dl className="perfil-datos">
      {datos.map(([etiqueta, valor]) => (
        <div key={etiqueta} className="perfil-dato">
          <dt>{etiqueta}</dt>
          <dd>{valor}</dd>
        </div>
      ))}
    </dl>
  );
}
