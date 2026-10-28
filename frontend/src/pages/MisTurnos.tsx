import { Link } from "react-router-dom";
import { Spinner, Alert } from "react-bootstrap";
import Layout from "../components/Layout/Layout.tsx";
import { BotonVolver } from "../components/BotonVolver.tsx";
import { useTurnosPaciente } from "../hooks/useTurnosPaciente";
import { parseFechaHora, formatearChipFecha, formatearHora } from "../utils/fecha";
import type { Turno } from "../types/Turno";
import { obtenerClaseEstado } from "../utils/estadoTurno";
import { useToast } from "../hooks/useToast";
import { ToastMensaje } from "../components/NotifyToast";
import "../assets/styles/MisTurnos.css";
import "../assets/styles/PaginaPaciente.css";

function MisTurnos() {
  const { misTurnos, loading, error } = useTurnosPaciente();
  // Vienen en el state de navigate() desde PedirTurno y CancelarTurno
  const creado = useToast("turnoCreado");
  const cancelado = useToast("turnoCancelado");
  const hoy = new Date();

  const proximas = misTurnos
    .filter((t) => t.estado !== "Cancelado" && parseFechaHora(t.fechaHora) >= hoy)
    .sort((a, b) => parseFechaHora(a.fechaHora).getTime() - parseFechaHora(b.fechaHora).getTime());

  const pasadas = misTurnos
    .filter((t) => t.estado === "Cancelado" || parseFechaHora(t.fechaHora) < hoy)
    .sort((a, b) => parseFechaHora(b.fechaHora).getTime() - parseFechaHora(a.fechaHora).getTime());

  const renderTurno = (turno: Turno, apagado = false) => {
    const { dia, mes } = formatearChipFecha(turno.fechaHora);
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
              <p className="turno-fila-titulo">{turno.medico.especialidad}, {formatearHora(turno.fechaHora)}</p>
              <p className="turno-fila-medico">Con {turno.medico.usuario.nombre} {turno.medico.usuario.apellido}</p>
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
      <ToastMensaje
        mensaje="Turno solicitado. Queda pendiente hasta que el consultorio lo confirme."
        tipo="toast-good"
        mostrar={creado.showToast}
        onClose={() => creado.setShowToast(false)}
      />
      <ToastMensaje
        mensaje="Turno cancelado."
        tipo="toast-good"
        mostrar={cancelado.showToast}
        onClose={() => cancelado.setShowToast(false)}
      />
      <div className="pagina-paciente">
        <BotonVolver />

        <div className="mis-turnos-header">
          <p className="mis-turnos-titulo">Tu agenda</p>
          <Link to="/pedir-turno">
            <button className="mis-turnos-btn-agendar">+ Agendar</button>
          </Link>
        </div>

        {loading && (
          <div className="text-center mb-4">
            <Spinner animation="border" size="sm" />
          </div>
        )}

        {error && <Alert variant="danger">{error.message}</Alert>}

        {!loading && !error && (
          <>
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
          </>
        )}
      </div>
    </Layout>
  );
}

export default MisTurnos;