import { Link } from "react-router-dom";
import type { Turno } from "../types/Turno";
import { formatearChipFecha, formatearHora } from "../utils/fecha";
import "../assets/styles/ProximoTurnoCard.css";

interface ProximoTurnoCardProps {
  turno: Turno | null;
}

export function ProximoTurnoCard({ turno }: ProximoTurnoCardProps) {
  if (!turno) {
    return (
      <div className="proximo-turno-banner proximo-turno-vacio">
        <p>No tenés consultas agendadas.</p>
        <Link to="/pedir-turno">
          <button className="proximo-turno-btn proximo-turno-btn-primario">Agendar una consulta</button>
        </Link>
      </div>
    );
  }

  const { dia, mes } = formatearChipFecha(turno.fechaHora);

  return (
    <div className="proximo-turno-banner">
      <div className="proximo-turno-izquierda">
        <div className="proximo-turno-chip-fecha">
          <p className="proximo-turno-chip-mes">{mes}</p>
          <p className="proximo-turno-chip-dia">{dia}</p>
        </div>
        <div>
          <p className="proximo-turno-eyebrow">Te esperan en {turno.medico.especialidad.toLowerCase()}</p>
          <p className="proximo-turno-detalle">
            {formatearHora(turno.fechaHora)} con {turno.medico.usuario.nombre} {turno.medico.usuario.apellido}
          </p>
        </div>
      </div>
      <div className="proximo-turno-acciones">
        <Link to={`/turnos/${turno.id}`}>
          <button className="proximo-turno-btn">Ver más</button>
        </Link>
        <Link to={`/turnos/${turno.id}/cancelar`}>
          <button className="proximo-turno-btn proximo-turno-btn-cancelar">Cancelar</button>
        </Link>
      </div>
    </div>
  );
}