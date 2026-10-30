import type { ReactNode } from "react";
import "../../assets/styles/Perfil.css";

// Lista de datos "Etiqueta  valor" de las pestañas del perfil
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
