import { Link } from "react-router-dom";
import type { TurnoReservadoProps } from "../types/TurnoReservadoProps";
import { formatearChipFecha } from "../utils/fecha";
import "../assets/styles/ProximoTurnoCard.css";

interface ProximoTurnoCardProps {
  turno: TurnoReservadoProps | null;
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

  const { dia, mes } = formatearChipFecha(turno.fecha);

  return (
    <div className="proximo-turno-banner">
      <div className="proximo-turno-izquierda">
        <div className="proximo-turno-chip-fecha">
          <p className="proximo-turno-chip-mes">{mes}</p>
          <p className="proximo-turno-chip-dia">{dia}</p>
        </div>
        <div>
          <p className="proximo-turno-eyebrow">Te esperan en {turno.especialidad.toLowerCase()}</p>
          <p className="proximo-turno-detalle">{turno.hora} con {turno.medico}</p>
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