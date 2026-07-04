import { useParams, useNavigate } from "react-router-dom";
import Layout from "../components/Layout/Layout.tsx";
import { BotonVolver } from "../components/BotonVolver.tsx";
import { useTurnosPaciente } from "../hooks/useTurnosPaciente";
import { formatearChipFecha } from "../utils/fecha";
import "../assets/styles/DetalleTurno.css";
import "../assets/styles/PaginaPaciente.css";

function obtenerClaseEstado(estado: string) {
  switch (estado) {
    case "Confirmado": return "estado-confirmado";
    case "Pendiente": return "estado-pendiente";
    case "Cancelado": return "estado-cancelado";
    default: return "";
  }
}

function DetalleTurno() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { misTurnos } = useTurnosPaciente();

  const turno = misTurnos.find((t) => t.id === Number(id));

  if (!turno) {
    return (
      <Layout>
        <div className="pagina-paciente">
          <BotonVolver />
          <p className="text-muted">No se encontró el turno.</p>
        </div>
      </Layout>
    );
  }

  const { dia, mes } = formatearChipFecha(turno.fecha);

  return (
    <Layout>
      <div className="pagina-paciente">
        <BotonVolver />

        <div className="detalle-turno-card">
          <div className="detalle-turno-encabezado">
            <div className="detalle-turno-chip-fecha">
              <p className="detalle-turno-chip-mes">{mes}</p>
              <p className="detalle-turno-chip-dia">{dia}</p>
            </div>
            <div className="detalle-turno-titulo-bloque">
              <p className="detalle-turno-titulo">{turno.especialidad}</p>
              <p className="detalle-turno-hora">{turno.hora} hs</p>
            </div>
            <span className={`detalle-turno-badge ${obtenerClaseEstado(turno.estado)}`}>{turno.estado}</span>
          </div>

          <div className="detalle-turno-grid">
            <div>
              <p className="detalle-turno-label">Profesional</p>
              <p className="detalle-turno-valor">{turno.medico}</p>
            </div>
            <div>
              <p className="detalle-turno-label">Consultorio</p>
              <p className="detalle-turno-valor">Sede Centro</p>
            </div>
          </div>

          {turno.estado !== "Cancelado" && (
            <div className="detalle-turno-acciones">
              <button className="detalle-turno-btn-cancelar" onClick={() => navigate(`/turnos/${turno.id}/cancelar`)}>
                Cancelar este turno
              </button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default DetalleTurno;