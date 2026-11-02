import { Form } from "react-bootstrap";
import { ETIQUETAS_PERIODO, type Periodo } from "../../utils/periodos";

interface FiltroPeriodoProps {
  periodos: Periodo[];
  valor: Periodo;
  onCambiar: (periodo: Periodo) => void;
  desde: string;
  hasta: string;
  onDesde: (valor: string) => void;
  onHasta: (valor: string) => void;
}

// Botones de período; con "Personalizado" aparecen las fechas Desde y Hasta
export function FiltroPeriodo({ periodos, valor, onCambiar, desde, hasta, onDesde, onHasta }: FiltroPeriodoProps) {
  return (
    <div className="filtro-periodo">
      <div className="filtro-periodo-botones" role="group" aria-label="Período">
        {periodos.map((p) => (
          <button
            key={p}
            type="button"
            className={`filtro-periodo-boton${valor === p ? " activo" : ""}`}
            aria-pressed={valor === p}
            onClick={() => onCambiar(p)}
          >
            {ETIQUETAS_PERIODO[p]}
          </button>
        ))}
      </div>
      {valor === "personalizado" && (
        <div className="filtro-periodo-fechas">
          <Form.Group controlId="filtro-desde">
            <Form.Label>Desde</Form.Label>
            <Form.Control type="date" value={desde} max={hasta || undefined} onChange={(e) => onDesde(e.target.value)} />
          </Form.Group>
          <Form.Group controlId="filtro-hasta">
            <Form.Label>Hasta</Form.Label>
            <Form.Control type="date" value={hasta} min={desde || undefined} onChange={(e) => onHasta(e.target.value)} />
          </Form.Group>
        </div>
      )}
    </div>
  );
}
