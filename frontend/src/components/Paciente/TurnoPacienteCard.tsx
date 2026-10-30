import { Link } from "react-router-dom";
import { ChevronRight, JournalMedical } from "react-bootstrap-icons";
import type { Turno } from "../../types/Turno";
import type { EntradaClinica } from "../../types/HistoriaClinica";
import { formatearChipFecha, formatearHora } from "../../utils/fecha";
import { estadoVisible, puedeCancelarPaciente } from "../../utils/estadoTurno";
import { IndicacionesMedico } from "./IndicacionesMedico";
import "../../assets/styles/PacienteTurnos.css";

interface TurnoPacienteCardProps {
  turno: Turno;
  // Lo que registró el médico en esa consulta (solo turnos pasados)
  consulta?: EntradaClinica;
}

export function TurnoPacienteCard({ turno, consulta }: TurnoPacienteCardProps) {
  const { dia, mes } = formatearChipFecha(turno.fechaHora);
  const estado = estadoVisible(turno, consulta);
  const medico = `${turno.medico.usuario.nombre} ${turno.medico.usuario.apellido}`;

  return (
    <article className={`turno-paciente turno-paciente-${estado.clase}`}>
      <div className="turno-paciente-fila">
        <div className="turno-paciente-fecha" aria-hidden="true">
          <span className="turno-paciente-mes">{mes}</span>
          <span className="turno-paciente-dia">{dia}</span>
        </div>
        <div className="turno-paciente-info">
          <h3 className="turno-paciente-titulo">
            {turno.medico.especialidad} · {formatearHora(turno.fechaHora)} h
          </h3>
          <p className="turno-paciente-medico">Con {medico}</p>
        </div>
        <span className={`turno-paciente-estado turno-paciente-estado-${estado.clase}`}>{estado.texto}</span>
      </div>

      {consulta && <IndicacionesMedico consulta={consulta} />}

      <div className="turno-paciente-acciones">
        {estado.clase === "finalizado" && (
          <span className="turno-paciente-nota">
            <JournalMedical aria-hidden="true" /> Sin indicaciones registradas para este turno
          </span>
        )}
        {puedeCancelarPaciente(turno.estado, turno.fechaHora) && (
          <Link to={`/turnos/${turno.id}/cancelar`} className="turno-paciente-link turno-paciente-link-peligro">
            Cancelar turno
          </Link>
        )}
        <Link to={`/turnos/${turno.id}`} className="turno-paciente-link" aria-label={`Ver detalle del turno del ${dia} de ${mes}`}>
          Ver detalle <ChevronRight aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
