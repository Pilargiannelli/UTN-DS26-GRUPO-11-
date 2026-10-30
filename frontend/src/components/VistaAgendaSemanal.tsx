import { Link } from "react-router-dom";
import type { Turno } from "../types/Turno";
import { formatearHora } from "../utils/fecha";
import {
  ALTURA_TOTAL, HORAS, esMismaFecha, estiloGrilla, etiquetaHora, ubicarTurnos,
} from "../utils/agenda";

interface Props {
  diasSemana: Date[];
  turnosDelDia: (fecha: Date) => Turno[];
}

const nombreDia = (d: Date) => d.toLocaleDateString("es-AR", { weekday: "short" }).replace(".", "");

// Semana de lunes a viernes: una columna por día con sus turnos
export default function VistaAgendaSemanal({ diasSemana, turnosDelDia }: Props) {
  const hoy = new Date();

  return (
    <div className="agenda-scroll" style={estiloGrilla}>
      {/* Encabezado con nombres de día y números — fijo al hacer scroll */}
      <div className="agenda-semana-header">
        <div className="agenda-col-horas" />
        {diasSemana.map((dia) => {
          const esHoy = esMismaFecha(dia, hoy);
          const cantidad = turnosDelDia(dia).filter((t) => t.estado !== "Cancelado").length;
          return (
            <div key={dia.toISOString()} className={`agenda-dia-header${esHoy ? " agenda-dia-header-hoy" : ""}`}>
              <span className="agenda-dia-nombre">{nombreDia(dia)}</span>
              <span className={`agenda-dia-numero${esHoy ? " agenda-dia-hoy" : ""}`}>{dia.getDate()}</span>
              <span className="agenda-dia-cantidad">
                {cantidad === 0 ? "Sin turnos" : `${cantidad} ${cantidad === 1 ? "turno" : "turnos"}`}
              </span>
            </div>
          );
        })}
      </div>

      <div className="agenda-grid">
        <div className="agenda-col-horas">
          {HORAS.map((h) => (
            <div key={h} className="agenda-hora-label">{etiquetaHora(h)}</div>
          ))}
        </div>

        {diasSemana.map((dia) => (
          <div
            key={dia.toISOString()}
            className={`agenda-dia-col${esMismaFecha(dia, hoy) ? " agenda-dia-col-hoy" : ""}`}
            style={{ height: ALTURA_TOTAL }}
          >
            {HORAS.map((h) => (
              <div key={h} className="agenda-hora-fila" />
            ))}
            {ubicarTurnos(turnosDelDia(dia)).map(({ turno, estilo }) => {
              const paciente = `${turno.paciente.usuario.nombre} ${turno.paciente.usuario.apellido}`;
              return (
                <Link
                  key={turno.id}
                  to={`/pacientes/${turno.pacienteId}`}
                  className={`agenda-evento agenda-evento-compact estado-${turno.estado.toLowerCase()}`}
                  style={estilo}
                  title={`${formatearHora(turno.fechaHora)} · ${paciente} · ${turno.estado}`}
                >
                  <span className="agenda-evento-hora">{formatearHora(turno.fechaHora)}</span>
                  <span className="agenda-evento-paciente">{paciente}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
