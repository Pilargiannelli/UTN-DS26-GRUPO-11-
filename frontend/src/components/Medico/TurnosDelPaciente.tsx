import { Link } from "react-router-dom";
import { Badge, Spinner } from "react-bootstrap";
import { useFetch } from "../../hooks/useFetch";
import { formatearHora } from "../../utils/fecha";
import { COLOR_ESTADO } from "../../utils/estadoTurno";
import type { Turno } from "../../types/Turno";

// Cuántos turnos se ven en la ficha; el resto está en "Ver más"
const TURNOS_VISIBLES = 3;

function FilaTurno({ turno }: { turno: Turno }) {
  const pasado = new Date(turno.fechaHora) < new Date();
  return (
    <li className={`panel-medico-turno ${pasado ? "panel-medico-turno-pasado" : ""}`}>
      <span>
        <span className="panel-medico-turno-fecha">
          {new Date(turno.fechaHora).toLocaleDateString("es-AR", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
          {" · "}
          {formatearHora(turno.fechaHora)} hs
        </span>
        <span className="panel-medico-turno-detalle">{turno.medico.especialidad}</span>
      </span>
      <Badge bg={COLOR_ESTADO[turno.estado] ?? "secondary"}>
        {pasado && turno.estado !== "Cancelado" ? "Realizado" : turno.estado}
      </Badge>
    </li>
  );
}

// Los 3 turnos más recientes del paciente con este médico. GET /api/turnos ya devuelve solo la
// agenda del médico (matriz de permisos §8): los turnos con otros médicos no se ven. "Ver más"
// abre la lista completa.
export function TurnosDelPaciente({ pacienteId }: { pacienteId: number }) {
  const { data, loading, error } = useFetch<Turno[]>("/turnos");

  if (loading) return <Spinner animation="border" size="sm" role="status" aria-label="Cargando turnos" />;
  if (error) return <p className="panel-medico-vacio">No se pudieron cargar los turnos: {error.message}</p>;

  const delPaciente = (data ?? [])
    .filter((t) => t.pacienteId === pacienteId)
    .sort((a, b) => b.fechaHora.localeCompare(a.fechaHora));

  if (delPaciente.length === 0) return <p className="panel-medico-vacio">Todavía no tiene turnos con vos.</p>;

  return (
    <>
      <ul className="panel-medico-turnos">
        {delPaciente.slice(0, TURNOS_VISIBLES).map((t) => <FilaTurno key={t.id} turno={t} />)}
      </ul>
      {delPaciente.length > TURNOS_VISIBLES && (
        <Link to={`/pacientes/${pacienteId}/turnos`} className="btn btn-primary btn-sm panel-medico-ver-todas">
          Ver más ({delPaciente.length - TURNOS_VISIBLES})
        </Link>
      )}
    </>
  );
}
