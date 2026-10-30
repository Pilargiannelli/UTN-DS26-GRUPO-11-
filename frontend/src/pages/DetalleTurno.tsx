import { useParams, useNavigate } from "react-router-dom";
import { Spinner } from "react-bootstrap";
import Layout from "../components/Layout/Layout.tsx";
import { Migas } from "../components/Migas.tsx";
import { IndicacionesMedico } from "../components/Paciente/IndicacionesMedico";
import { consultaDelTurno, useMiHistoria } from "../hooks/useMiHistoria";
import { useFetch } from "../hooks/useFetch";
import { formatearChipFecha, formatearHora } from "../utils/fecha";
import { obtenerClaseEstado, puedeCancelarPaciente, yaPaso } from "../utils/estadoTurno";
import type { Turno } from "../types/Turno";
import "../assets/styles/DetalleTurno.css";
import "../assets/styles/PaginaPaciente.css";

function DetalleTurno() {
  const { id } = useParams();
  const navigate = useNavigate();
  // GET /api/turnos/:id: el back devuelve 404 si el turno no existe o no es tuyo
  const { data: turno, loading, error } = useFetch<Turno>(`/turnos/${id}`);
  const { historia } = useMiHistoria();

  if (loading) {
    return (
      <Layout>
        <div className="pagina-paciente text-center py-5">
          <Spinner animation="border" role="status" aria-label="Cargando turno" />
        </div>
      </Layout>
    );
  }

  if (error || !turno) {
    return (
      <Layout>
        <div className="pagina-paciente">
          <Migas items={[{ texto: "Mis turnos", a: "/mis-turnos" }, { texto: "Turno" }]} />
          <p className="text-muted">No encontramos este turno.</p>
        </div>
      </Layout>
    );
  }

  const { dia, mes } = formatearChipFecha(turno.fechaHora);
  const fechaLarga = new Date(turno.fechaHora).toLocaleDateString("es-AR", {
    weekday: "long", day: "numeric", month: "long",
  });

  const consulta = yaPaso(turno.fechaHora) ? consultaDelTurno(turno, historia?.entradas ?? []) : undefined;

  return (
    <Layout>
      <div className="pagina-paciente">
        <Migas items={[{ texto: "Mis turnos", a: "/mis-turnos" }, { texto: `Turno del ${dia} de ${mes.toLowerCase()}` }]} />

        <div className="detalle-turno-card">
          <div className="detalle-turno-encabezado">
            <div className="detalle-turno-chip-fecha">
              <p className="detalle-turno-chip-mes">{mes}</p>
              <p className="detalle-turno-chip-dia">{dia}</p>
            </div>
            <div className="detalle-turno-titulo-bloque">
              <p className="detalle-turno-titulo">{turno.medico.especialidad}</p>
              <p className="detalle-turno-hora">{formatearHora(turno.fechaHora)} hs</p>
            </div>
            <span className={`detalle-turno-badge ${obtenerClaseEstado(turno.estado)}`}>{turno.estado}</span>
          </div>

          <div className="detalle-turno-grid">
            <div>
              <p className="detalle-turno-label">Profesional</p>
              <p className="detalle-turno-valor">{turno.medico.usuario.nombre} {turno.medico.usuario.apellido}</p>
            </div>
            <div>
              <p className="detalle-turno-label">Fecha</p>
              <p className="detalle-turno-valor">{fechaLarga}</p>
            </div>
          </div>

          {/* RN-006: el paciente cancela solo antes de la confirmación */}
          {puedeCancelarPaciente(turno.estado, turno.fechaHora) && (
            <div className="detalle-turno-acciones">
              <button className="detalle-turno-btn-cancelar" onClick={() => navigate(`/turnos/${turno.id}/cancelar`)}>
                Cancelar este turno
              </button>
            </div>
          )}

          {consulta && <IndicacionesMedico consulta={consulta} />}

          {turno.estado === "Confirmado" && !yaPaso(turno.fechaHora) && (
            <p className="detalle-turno-nota">
              Este turno ya fue confirmado. Si no podés asistir, comunicate con el consultorio.
            </p>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default DetalleTurno;
