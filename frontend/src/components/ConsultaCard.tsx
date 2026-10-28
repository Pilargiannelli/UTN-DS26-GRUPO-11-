import type { EntradaClinica } from "../types/HistoriaClinica";
import '../assets/styles/ConsultaCard.css'

interface ConsultaCardProps {
  entrada: EntradaClinica;
  medico?: string | null;
}

export function ConsultaCard({ entrada, medico }: ConsultaCardProps) {
  const fecha = new Date(entrada.fecha).toLocaleDateString("es-AR", {
    day: "2-digit", month: "2-digit", year: "numeric",
  });

  return (
    <div className="consulta-item">
        <div className="dato">
            <h5>Fecha:</h5>
            <p>{fecha}</p>
        </div>
        {medico && (
          <div className="dato">
              <h5>Médico:</h5>
              <p>{medico}</p>
          </div>
        )}
        <div className="dato">
            <h5>Diagnóstico:</h5>
            <p>{entrada.diagnostico}</p>
        </div>
        <div className="dato">
            <h5>Evolución:</h5>
            <p>{entrada.evolucion}</p>
        </div>
      {entrada.observaciones && (
        <div className="dato">
            <h5>Observaciones:</h5>
            <p>{entrada.observaciones}</p>
        </div>
      )}
    </div>
  );
}
