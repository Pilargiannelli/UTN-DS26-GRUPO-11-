import { Link } from "react-router-dom";
import Layout from "../components/Layout/Layout.tsx";
import { BotonVolver } from "../components/BotonVolver.tsx";
import { useTurnosPaciente } from "../hooks/useTurnosPaciente";
import { parseFecha, formatearChipFecha } from "../utils/fecha";
import type { TurnoReservadoProps } from "../types/TurnoReservadoProps";
import "../assets/styles/MisTurnos.css";
import "../assets/styles/PaginaPaciente.css";

function obtenerClaseEstado(estado: string) {
  switch (estado) {
    case "Confirmado": return "estado-confirmado";
    case "Pendiente": return "estado-pendiente";
    case "Cancelado": return "estado-cancelado";
    default: return "";
  }
}

function MisTurnos() {
  const { misTurnos } = useTurnosPaciente();
  const hoy = new Date();

  const proximas = misTurnos
    .filter((t) => t.estado !== "Cancelado" && parseFecha(t.fecha) >= hoy)
    .sort((a, b) => parseFecha(a.fecha).getTime() - parseFecha(b.fecha).getTime());

  const pasadas = misTurnos
    .filter((t) => t.estado === "Cancelado" || parseFecha(t.fecha) < hoy)
    .sort((a, b) => parseFecha(b.fecha).getTime() - parseFecha(a.fecha).getTime());

  const renderTurno = (turno: TurnoReservadoProps, apagado = false) => {
    const { dia, mes } = formatearChipFecha(turno.fecha);
    const clase = obtenerClaseEstado(turno.estado);
    return (
      <Link to={`/turnos/${turno.id}`} className={`turno-fila ${apagado ? "turno-fila-apagada" : ""}`} key={turno.id}>
        <div className={`turno-fila-barra ${clase}`}></div>
        <div className="turno-fila-card">
          <div className="turno-fila-info">
            <div className="turno-fila-fecha">
              <p className="turno-fila-mes">{mes}</p>
              <p className="turno-fila-dia">{dia}</p>
            </div>
            <div>
              <p className="turno-fila-titulo">{turno.especialidad}, {turno.hora}</p>
              <p className="turno-fila-medico">Con {turno.medico}</p>
            </div>
          </div>
          <span className={`turno-fila-badge ${clase}`}>
            {apagado && turno.estado !== "Cancelado" ? "Realizado" : turno.estado}
          </span>
        </div>
      </Link>
    );
  };

  return (
    <Layout>
      <div className="pagina-paciente">
        <BotonVolver />

        <div className="mis-turnos-header">
          <p className="mis-turnos-titulo">Tu agenda</p>
          <Link to="/pedir-turno">
            <button className="mis-turnos-btn-agendar">+ Agendar</button>
          </Link>
        </div>

        <p className="mis-turnos-seccion">Próximas</p>
        {proximas.length === 0 ? (
          <p className="text-muted mb-4">No tenés consultas agendadas.</p>
        ) : (
          <div className="mb-4">{proximas.map((t) => renderTurno(t))}</div>
        )}

        <p className="mis-turnos-seccion">Pasadas</p>
        {pasadas.length === 0 ? (
          <p className="text-muted">Todavía no tenés consultas anteriores.</p>
        ) : (
          <div>{pasadas.map((t) => renderTurno(t, true))}</div>
        )}
      </div>
    </Layout>
  );
}

export default MisTurnos;