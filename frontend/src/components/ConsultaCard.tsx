import type { Consulta } from "../types/ConsultaProps";
import '../assets/styles/ConsultaCard.css'

interface ConsultaCardProps {
  consulta: Consulta;
}

export function ConsultaCard({ consulta }: ConsultaCardProps) {
  return (
    <div className="consulta-item">
        <div className="dato">
            <h5>Fecha:</h5>
            <p>{consulta.fecha}</p>
        </div>
        <div className="dato">
            <h5>Médico:</h5>
            <p>{consulta.medico}</p>
        </div>
        <div className="dato">
            <h5>Motivo:</h5>
            <p>{consulta.motivo}</p>
        </div>
      {consulta.diagnostico && (
        <div className="dato">
            <h5>Diagnóstico:</h5>
            <p>{consulta.diagnostico}</p>
        </div>
      )}
      {consulta.tratamiento && (
        <div className="dato">
            <h5>Tratamiento:</h5>
            <p>{consulta.tratamiento}</p>
        </div>
      )}
    </div>
  );
}
