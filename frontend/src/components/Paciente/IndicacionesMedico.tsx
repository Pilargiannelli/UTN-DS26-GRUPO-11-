import type { EntradaClinica } from "../../types/HistoriaClinica";
import "../../assets/styles/PacienteTurnos.css";

// Lo que el médico dejó registrado en una consulta, contado para el paciente
export function IndicacionesMedico({ consulta, titulo = "Lo que te indicó el médico" }: {
  consulta: EntradaClinica;
  titulo?: string;
}) {
  return (
    <section className="indicaciones-medico" aria-label={titulo}>
      <h4 className="indicaciones-medico-titulo">{titulo}</h4>
      <dl className="indicaciones-medico-lista">
        <div>
          <dt>Diagnóstico</dt>
          <dd>{consulta.diagnostico}</dd>
        </div>
        <div>
          <dt>Evolución e indicaciones</dt>
          <dd>{consulta.evolucion}</dd>
        </div>
        {consulta.observaciones && (
          <div>
            <dt>Observaciones</dt>
            <dd>{consulta.observaciones}</dd>
          </div>
        )}
      </dl>
    </section>
  );
}
