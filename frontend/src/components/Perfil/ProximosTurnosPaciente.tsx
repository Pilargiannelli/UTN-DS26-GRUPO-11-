import { Badge, Spinner } from "react-bootstrap";
import { useFetch } from "../../hooks/useFetch";
import { formatearHora } from "../../utils/fecha";
import type { Turno } from "../../types/Turno";

const COLOR_ESTADO: Record<string, string> = {
  Pendiente: "warning",
  Reprogramado: "warning",
  Confirmado: "info",
};

// Próximos turnos de un paciente en su perfil. GET /api/turnos ya devuelve lo
// que el rol puede ver (la secretaria todos, el médico los suyos): acá solo se
// filtran los de este paciente que todavía no pasaron.
export function ProximosTurnosPaciente({ pacienteId }: { pacienteId: number }) {
  const { data, loading, error } = useFetch<Turno[]>("/turnos");

  if (loading) return <Spinner animation="border" size="sm" role="status" aria-label="Cargando turnos" />;
  if (error) return <p className="perfil-nota">No se pudieron cargar los turnos: {error.message}</p>;

  const ahora = new Date();
  const proximos = (data ?? [])
    .filter((t) => t.pacienteId === pacienteId && t.estado !== "Cancelado" && new Date(t.fechaHora) >= ahora)
    .sort((a, b) => a.fechaHora.localeCompare(b.fechaHora));

  if (proximos.length === 0) return <p className="perfil-nota">No tiene turnos próximos.</p>;

  return (
    <ul className="perfil-turnos">
      {proximos.map((t) => (
        <li key={t.id} className="perfil-turno">
          <span>
            <span className="perfil-turno-fecha">
              {new Date(t.fechaHora).toLocaleDateString("es-AR", { weekday: "short", day: "numeric", month: "short" })}
              {" · "}
              {formatearHora(t.fechaHora)} hs
            </span>
            <span className="perfil-turno-medico">
              {t.medico.usuario.nombre} {t.medico.usuario.apellido} · {t.medico.especialidad}
            </span>
          </span>
          <Badge bg={COLOR_ESTADO[t.estado] ?? "secondary"}>{t.estado}</Badge>
        </li>
      ))}
    </ul>
  );
}
