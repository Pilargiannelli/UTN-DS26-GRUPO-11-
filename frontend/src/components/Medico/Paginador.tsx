import { ChevronLeft, ChevronRight } from "react-bootstrap-icons";

interface PaginadorProps {
  pagina: number;
  tamanio: number;
  total: number;
  onCambiar: (pagina: number) => void;
}

// "Mostrando 1–8 de 23" y los botones para pasar de página
export function Paginador({ pagina, tamanio, total, onCambiar }: PaginadorProps) {
  const paginas = Math.max(1, Math.ceil(total / tamanio));
  const desde = total === 0 ? 0 : (pagina - 1) * tamanio + 1;
  const hasta = Math.min(pagina * tamanio, total);

  return (
    <nav className="paginador" aria-label="Paginación">
      <span className="paginador-resumen">Mostrando {desde}–{hasta} de {total}</span>
      <div className="paginador-botones">
        <button type="button" className="paginador-boton" aria-label="Página anterior" disabled={pagina <= 1} onClick={() => onCambiar(pagina - 1)}>
          <ChevronLeft aria-hidden="true" />
        </button>
        <span className="paginador-pagina">Página {pagina} de {paginas}</span>
        <button type="button" className="paginador-boton" aria-label="Página siguiente" disabled={pagina >= paginas} onClick={() => onCambiar(pagina + 1)}>
          <ChevronRight aria-hidden="true" />
        </button>
      </div>
    </nav>
  );
}
