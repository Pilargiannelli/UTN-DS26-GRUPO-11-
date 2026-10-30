import type { ReactNode } from "react";
import "../assets/styles/EncabezadoPagina.css";

export interface DatoEncabezado {
  valor: number | string;
  texto: string;
}

interface EncabezadoPaginaProps {
  titulo: string;
  descripcion?: ReactNode;
  // Ícono de la sección y etiqueta chica arriba del título
  icono?: ReactNode;
  etiqueta?: string;
  // Números de resumen que se muestran a la derecha
  datos?: DatoEncabezado[];
  // Acción principal de la página (una sola), alineada a la derecha
  accion?: ReactNode;
}

// Encabezado común de las pantallas: título, una línea de contexto, el resumen
// en números y la acción principal. Así todas las secciones arrancan igual.
export function EncabezadoPagina({ titulo, descripcion, icono, etiqueta, datos, accion }: EncabezadoPaginaProps) {
  return (
    <header className="encabezado-pagina">
      <div className="encabezado-pagina-identidad">
        {icono && <span className="encabezado-pagina-icono" aria-hidden="true">{icono}</span>}
        <div>
          {etiqueta && <p className="encabezado-pagina-etiqueta">{etiqueta}</p>}
          <h1 className="encabezado-pagina-titulo">{titulo}</h1>
          {descripcion && <p className="encabezado-pagina-descripcion">{descripcion}</p>}
        </div>
      </div>

      {(!!datos?.length || !!accion) && (
        <div className="encabezado-pagina-lateral">
          {!!datos?.length && (
            <dl className="encabezado-pagina-datos">
              {datos.map((d) => (
                <div key={d.texto} className="encabezado-pagina-dato">
                  <dt>{d.texto}</dt>
                  <dd>{d.valor}</dd>
                </div>
              ))}
            </dl>
          )}
          {accion && <div className="encabezado-pagina-accion">{accion}</div>}
        </div>
      )}
    </header>
  );
}
