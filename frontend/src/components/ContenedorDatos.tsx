import '../assets/styles/ContenedorDatos.css';
import type { ContenedorDatosProps } from '../types/ContenedorDatosProps.ts';

export function ContenedorDatos({ datos, children }: ContenedorDatosProps) {
  return (
    <div className="contenedor-datos-card">
      {datos && datos.length > 0 && (
        <div className="contenedor-datos-lista">
          {datos.map((item, index) => (
            <div key={index} className="contenedor-datos-item">
              <span className="contenedor-datos-label">{item.label}:</span>
              <span className="contenedor-datos-valor">{item.valor}</span>
            </div>
          ))}
        </div>
      )}
      {children}
    </div>
  );
}